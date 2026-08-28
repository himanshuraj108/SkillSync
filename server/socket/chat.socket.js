import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const setupChatSocket = (io, socket) => {
    socket.on('join_conversation', (conversationId) => {
        socket.join(`conv_${conversationId}`);
        console.log(`${socket.user.name} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conv_${conversationId}`);
        console.log(`${socket.user.name} left conversation ${conversationId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            const { conversationId, content, type = 'text', file_url, file_name, file_size, code_language } = data;
            
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !conversation.participants.includes(socket.user._id)) return;

            const message = await Message.create({
                conversation_id: conversation._id,
                sender: socket.user._id,
                type, content, file_url, file_name, file_size, code_language
            });

            conversation.last_message = {
                content: type === 'text' ? content : `Sent a ${type}`,
                sender: socket.user._id,
                timestamp: message.timestamp
            };
            conversation.updated_at = message.timestamp;

            conversation.participants.forEach(p => {
                if (p.toString() !== socket.user._id.toString()) {
                    const count = conversation.unread_counts.get(p.toString()) || 0;
                    conversation.unread_counts.set(p.toString(), count + 1);
                }
            });
            
            await conversation.save();

            const populatedMessage = await message.populate('sender', 'name avatar');
            io.to(`conv_${conversationId}`).emit('new_message', populatedMessage);
        } catch (error) {
            console.error('Socket send_message error:', error);
        }
    });

    socket.on('typing_start', (conversationId) => {
        socket.to(`conv_${conversationId}`).emit('typing_start', { user: socket.user._id, conversationId });
    });

    socket.on('typing_stop', (conversationId) => {
        socket.to(`conv_${conversationId}`).emit('typing_stop', { user: socket.user._id, conversationId });
    });

    socket.on('mark_read', async (conversationId) => {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !conversation.participants.includes(socket.user._id)) return;

            conversation.unread_counts.set(socket.user._id.toString(), 0);
            await conversation.save();

            socket.emit('marked_read', { conversationId });
        } catch (error) {
            console.error('Socket mark_read error:', error);
        }
    });
};

export default setupChatSocket;
