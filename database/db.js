import mongoose from 'mongoose';

/**
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */

let isConnected = false;

export const connect = async () => {
    if (isConnected) {
        console.log('Ya estábamos conectados');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log('Conectado a MongoDB:', process.env.MONGODB_URI);
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
    }
}

export const disconnect = async () => {
    if (!isConnected) return;

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('Desconectado de MongoDB');
    } catch (error) {
        console.error('Error desconectando de MongoDB:', error);
    }
}