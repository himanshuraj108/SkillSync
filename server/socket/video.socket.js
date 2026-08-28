const setupVideoSocket = (io, socket) => {
    socket.on('join_room', (sessionId) => {
        const room = `session_${sessionId}`;
        socket.join(room);
        console.log(`${socket.user.name} joined video room ${room}`);
        socket.to(room).emit('user_joined', { socketId: socket.id, userId: socket.user._id, name: socket.user.name });
    });

    socket.on('leave_room', (sessionId) => {
        const room = `session_${sessionId}`;
        socket.leave(room);
        console.log(`${socket.user.name} left video room ${room}`);
        socket.to(room).emit('user_left', { socketId: socket.id, userId: socket.user._id });
    });

    socket.on('offer', (data) => {
        const { targetSocketId, offer } = data;
        io.to(targetSocketId).emit('offer', { senderSocketId: socket.id, offer });
    });

    socket.on('answer', (data) => {
        const { targetSocketId, answer } = data;
        io.to(targetSocketId).emit('answer', { senderSocketId: socket.id, answer });
    });

    socket.on('ice_candidate', (data) => {
        const { targetSocketId, candidate } = data;
        io.to(targetSocketId).emit('ice_candidate', { senderSocketId: socket.id, candidate });
    });

    socket.on('toggle_audio', (data) => {
        const { sessionId, state } = data;
        socket.to(`session_${sessionId}`).emit('toggle_audio', { userId: socket.user._id, state });
    });

    socket.on('toggle_video', (data) => {
        const { sessionId, state } = data;
        socket.to(`session_${sessionId}`).emit('toggle_video', { userId: socket.user._id, state });
    });

    socket.on('session_code_change', (data) => {
        const { sessionId, code, language } = data;
        socket.to(`session_${sessionId}`).emit('session_code_update', {
            userId: socket.user._id,
            userName: socket.user.name,
            code,
            language
        });
    });

    socket.on('session_notes_change', (data) => {
        const { sessionId, notes } = data;
        socket.to(`session_${sessionId}`).emit('session_notes_update', {
            userId: socket.user._id,
            userName: socket.user.name,
            notes
        });
    });

    socket.on('session_chat_message', (data) => {
        const { sessionId, text } = data;
        io.in(`session_${sessionId}`).emit('session_chat_broadcast', {
            id: Date.now().toString(),
            senderId: socket.user._id,
            senderName: socket.user.name,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('session_recording_consent', (data) => {
        const { sessionId, consent } = data;
        socket.to(`session_${sessionId}`).emit('session_recording_consent_update', {
            userId: socket.user._id,
            userName: socket.user.name,
            consent
        });
    });
};

export default setupVideoSocket;
