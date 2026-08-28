import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import setupChatSocket from './chat.socket.js';
import setupVideoSocket from './video.socket.js';
import setupNotificationSocket from './notification.socket.js';

let io;
const onlineUsers = new Map();

const setupSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));
            
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await User.findById(decoded.userId);
            if (!user) return next(new Error('User not found'));
            
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);
        onlineUsers.set(socket.user._id.toString(), socket.id);
        
        setupChatSocket(io, socket);
        setupVideoSocket(io, socket);
        setupNotificationSocket(io, socket);

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.name} (${socket.id})`);
            onlineUsers.delete(socket.user._id.toString());
            
            try {
                await User.findByIdAndUpdate(socket.user._id, { last_seen: new Date() });
            } catch (error) {
                console.error('Error updating last_seen:', error);
            }
        });
    });
};

export const getIo = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

export default setupSocket;
