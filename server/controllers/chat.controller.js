import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { getIo } from '../socket/index.js';

export const getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({ participants: req.user._id })
            .populate('participants', 'name avatar')
            .sort({ updated_at: -1 });

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        next(error);
    }
};

export const getConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id).populate('participants', 'name avatar');
        
        if (!conversation) return res.status(404).json({ success: false, message: 'Not found' });
        if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const { cursor, limit = 20 } = req.query;
        const conversation = await Conversation.findById(req.params.id);
        
        if (!conversation || !conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const query = { conversation_id: conversation._id };
        if (cursor) query.timestamp = { $lt: new Date(cursor) };

        const messages = await Message.find(query)
            .sort({ timestamp: -1 })
            .limit(Number(limit))
            .populate('sender', 'name avatar');

        const nextCursor = messages.length > 0 ? messages[messages.length - 1].timestamp : null;

        const unreadKey = req.user._id.toString();
        conversation.unread_counts.set(unreadKey, 0);
        await conversation.save();

        res.status(200).json({ success: true, data: messages, nextCursor });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { content, type = 'text', file_url, file_name, file_size, code_language } = req.body;
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation || !conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const message = await Message.create({
            conversation_id: conversation._id,
            sender: req.user._id,
            type, content, file_url, file_name, file_size, code_language
        });

        conversation.last_message = {
            content: type === 'text' ? content : `Sent a ${type}`,
            sender: req.user._id,
            timestamp: message.timestamp
        };
        conversation.updated_at = message.timestamp;

        conversation.participants.forEach(p => {
            if (p.toString() !== req.user._id.toString()) {
                const count = conversation.unread_counts.get(p.toString()) || 0;
                conversation.unread_counts.set(p.toString(), count + 1);
            }
        });
        
        await conversation.save();

        const populatedMessage = await message.populate('sender', 'name avatar');
        
        const io = getIo();
        if (io) {
            io.to(`conv_${conversation._id}`).emit('new_message', populatedMessage);
        }

        res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
        next(error);
    }
};

export const markRead = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        conversation.unread_counts.set(req.user._id.toString(), 0);
        await conversation.save();

        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
};
