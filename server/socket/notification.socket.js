import User from '../models/User.js';
import { getIo } from './index.js';

const setupNotificationSocket = (io, socket) => {
    const userRoom = `user_${socket.user._id}`;
    socket.join(userRoom);
    console.log(`${socket.user.name} joined notification room ${userRoom}`);

    socket.on('disconnect', async () => {
        try {
            await User.findByIdAndUpdate(socket.user._id, { last_seen: new Date() });
        } catch (error) {
            console.error('Error updating last_seen on disconnect:', error);
        }
    });
};

export const emitNotification = (userId, notification) => {
    try {
        const io = getIo();
        if (io) {
            io.to(`user_${userId}`).emit('new_notification', notification);
        }
    } catch (error) {
        console.error('Error emitting notification:', error);
    }
};

export default setupNotificationSocket;
