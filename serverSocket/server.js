import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3001',
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
            // Verificar si el usuario ya está conectado con otro socket
            const existingUser = connectedUsers[userId];
            if (existingUser && existingUser.socketId !== socket.id) {
                // Desconectar el socket anterior del room específico del usuario
                const oldSocketId = existingUser.socketId;
                const oldSocket = io.sockets.sockets.get(oldSocketId);
                if (oldSocket) {
                    console.log(`Desconectando socket anterior ${oldSocketId} para el usuario ${userId}`);
                    oldSocket.leave(`user:${userId}`);
                }
            }
            
            // Registrar el nuevo socket para este usuario
            connectedUsers[userId] = { userId, socketId: socket.id, username, avatarId, isConnected: true };
            
            // Unir este socket a un room específico para este usuario
            socket.join(`user:${userId}`);
            
            io.emit('updateUsers', Object.values(connectedUsers));
        }
    });

    socket.on('sendMessage', (messageData) => {
        console.log('Mensaje enviado:', messageData);
        const { senderId, receiverId, text, createdAt } = messageData;
        const receiver = connectedUsers[receiverId];

        if (receiver) {
            // Crear el arreglo de usuarios
            const users = [senderId, receiverId].sort();

            // Emitir el mensaje al room específico del receptor en lugar de al socket específico
            io.to(`user:${receiverId}`).emit('receiveMessage', { senderId, text, createdAt, users });
            console.log('Mensaje enviado al usuario:', receiverId);
        } else {
            console.log('Receptor no encontrado para el mensaje:', messageData);
        }
    });

    socket.on('friendRequestSent', ({ receiverId, senderId }) => {
        const receiver = connectedUsers[receiverId];
        if (receiver) {
            io.to(`user:${receiverId}`).emit('receiveFriendRequest', { senderId, receiverId });
            console.log('Notificación de solicitud de amistad enviada a:', receiverId);
        }
    });

    socket.on('acceptFriendRequest', ({ senderId, receiverId }) => {
        console.log(`Evento acceptFriendRequest recibido: senderId=${senderId}, receiverId=${receiverId}`);

        const sender = connectedUsers[senderId];
        if (sender) {
            io.to(`user:${senderId}`).emit('friendRequestAccepted', { receiverId });
            console.log('Notificación de aceptación de amistad enviada a:', senderId);
        }
    });

    socket.on('logout', ({ userId }) => {
        console.log('Usuario desconectado:', userId);
        if (connectedUsers[userId]) {
            connectedUsers[userId].isConnected = false;
            io.emit('updateUsers', Object.values(connectedUsers));
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