import express from 'express';
const { createServer } = require('http');
const { Server } = require('socket.io');

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

io.on('connection', (socket) => {
    console.log('Usuario conectado', socket.id);

    socket.on('disconnect', () => {
        console.log('Usuario desconectado', socket.id);
    });

});
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Servidor de Socket.io escuchando en el puerto ${PORT}`);
});