import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
});

const connectedUsers = {};

io.on('connection', (socket) => {
    console.log('Usuario conectado', socket.id);

    socket.on('registerUser', ({ userId, username, avatarId }) => {
        if (userId && username && avatarId) {
            connectedUsers[userId] = { userId, socketId: socket.id, username, avatarId, isConnected: true };
            io.emit('updateUsers', Object.values(connectedUsers));
        }
    });

    socket.on('sendMessage', (messageData) => {
        const { receiverId, text, createdAt } = messageData;
        const receiver = connectedUsers[receiverId];
        if (receiver) {
            io.to(receiver.socketId).emit('receiveMessage', { senderId: messageData.senderId, text, createdAt });
        }
    });

    socket.on('disconnect', () => {
        for (const [userId, userInfo] of Object.entries(connectedUsers)) {
            if (userInfo.socketId === socket.id) {
                connectedUsers[userId].isConnected = false;
                break;
            }
        }
        io.emit('updateUsers', Object.values(connectedUsers));
    });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Servidor de Socket.io escuchando en el puerto ${PORT}`);
});