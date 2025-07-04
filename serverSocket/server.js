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
const pendingAccepts = new Set(); // Para evitar aceptaciones duplicadas

io.on('connection', (socket) => {
    console.log('Usuario conectado', socket.id);

    socket.on('registerUser', ({ userId, username, avatarId }) => {
        if (userId && username && avatarId) {
            // Verificar si el usuario ya está conectado
            const existingUser = connectedUsers[userId];

            if (existingUser && existingUser.socketId !== socket.id) {
                // Desconectar el socket anterior
                const oldSocket = io.sockets.sockets.get(existingUser.socketId);
                if (oldSocket) {
                    oldSocket.leave(`user:${userId}`);
                    oldSocket.disconnect(true);
                }
            }

            // Registrar el nuevo socket
            connectedUsers[userId] = {
                userId,
                socketId: socket.id,
                username,
                avatarId,
                isConnected: true
            };

            // Unir al room correcto
            socket.join(`user:${userId}`);
            console.log(`Usuario ${userId} unido a la sala user:${userId}`);
            console.log('Usuarios conectados:', Object.values(connectedUsers));
            console.log('Socket ID:', socket.id);
            console.log("room", socket.rooms);

            io.emit('updateUsers', Object.values(connectedUsers));
        }
    });

    socket.on('acceptFriendRequest', ({ senderId, receiverId }) => {
        const requestKey = `${senderId}-${receiverId}`;
        if (pendingAccepts.has(requestKey)) {
            console.log('Solicitud ya en proceso:', requestKey);
            return;
        }
        pendingAccepts.add(requestKey);

        console.log(`Evento acceptFriendRequest recibido: senderId=${senderId}, receiverId=${receiverId}`);

        const sender = connectedUsers[senderId];
        if (sender) {
            io.to(`user:${senderId}`).emit('friendRequestAccepted', { 
                receiverId,
                // Añadimos un timestamp para asegurar que cada evento sea único si es necesario
                timestamp: Date.now()
            });
            console.log('Notificación de aceptación de amistad enviada a:', senderId);
        }

        // Limpiamos el set después de un momento para permitir nuevas interacciones si fueran necesarias
        setTimeout(() => {
            pendingAccepts.delete(requestKey);
        }, 5000); // 5 segundos de cooldown
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
        console.log(`Intentando enviar notificación a ${receiverId} desde ${senderId}`);
        // Emitir a la sala específica del usuario
        io.to(`user:${receiverId}`).emit('receiveFriendRequest', { senderId, receiverId });
        console.log('Notificación de solicitud de amistad enviada a:', receiverId);

        // Emitir evento global para sincronización
        io.emit('friendRequestUpdated', { receiverId });
    });

    socket.on('logout', ({ userId }) => {
        if (userId && connectedUsers[userId]) {
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