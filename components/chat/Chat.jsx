import React, { useRef, useEffect, useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import asApi from '@/apiAxios/asApi';

const Chat = ({ selectedUser, setSelectedUser, messages, setMessages, userId, socketRef, getUserNameById, handleCloseChat, setUnreadMessages}) => {
    const [newMessage, setNewMessage] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);
    const emojiRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmojis(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            const handleReceiveMessage = (message) => {
                console.log('Mensaje recibido:', message);

                // Verifica si el mensaje pertenece a la conversación actual
                if (message.users.includes(selectedUser._id)) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            sender: message.senderId,
                            message: { text: message.text },
                            createdAt: message.createdAt,
                            users: message.users,
                        },
                    ]);
                } else {
                    // Incrementa el contador de mensajes no leídos si el chat no está abierto con el remitente
                    setUnreadMessages((prevUnread) => ({
                        ...prevUnread,
                        [message.senderId]: (prevUnread[message.senderId] || 0) + 1,
                    }));
                }
            };

            socketRef.current.on('receiveMessage', handleReceiveMessage);

            return () => {
                socketRef.current.off('receiveMessage', handleReceiveMessage);
            };
        }
    }, [socketRef, selectedUser, setMessages, setUnreadMessages]);

    // Desplaza el scroll al final cuando cambian los mensajes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleEmojiClick = (emoji) => {
        setNewMessage(newMessage + emoji.native);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedUser) {
            // Crear el arreglo de usuarios
            const users = [userId, selectedUser._id].sort();

            const messageData = {
                senderId: userId,
                receiverId: selectedUser._id,
                text: newMessage,
                createdAt: new Date().toISOString(),
                users: users,
            };

            console.log('Enviando mensaje:', messageData);

            if (socketRef.current) {
                socketRef.current.emit('sendMessage', messageData);
            }

            // Guardar el mensaje en la base de datos
            try {
                const response = await asApi.post('/chat', {
                    from: userId,
                    to: selectedUser._id,
                    text: newMessage,
                    users: users,
                });
                console.log('Respuesta de la API:', response);
            } catch (error) {
                console.error('Error al guardar el mensaje:', error);
            }

            // Actualizar la lista de mensajes localmente
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender: userId,
                    message: { text: newMessage },
                    createdAt: messageData.createdAt,
                    users: users, // Incluir el arreglo de usuarios
                },
            ]);
            setNewMessage('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-100">
            <div className="flex items-center justify-between p-4 bg-gray-900">
                <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                <button onClick={handleCloseChat} className="text-white text-xl">✖</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-800 p-2 rounded custom-scrollbar" style={{ maxHeight: 'calc(107vh - 200px)', overflowY: 'auto' }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded-lg max-w-xs ${msg.sender === userId ? 'bg-gray-600 text-white mr-auto' : 'bg-blue-500 text-white ml-auto'}`}
                    >
                        <span className="font-bold">{getUserNameById(msg.sender)}: </span>
                        <span>{msg.message.text}</span>
                        <span className="block text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center p-4 bg-gray-900">
                <button onClick={() => setShowEmojis(!showEmojis)} className="p-2 bg-gray-700 text-white rounded">😊</button>
                {showEmojis && (
                    <div ref={emojiRef} className="absolute bottom-16 left-50 z-10" style={{ backgroundColor: '#f0f0f0' }}>
                        <Picker data={data} onEmojiSelect={handleEmojiClick} />
                    </div>
                )}
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 p-2 rounded bg-gray-700 text-white ml-2"
                />
                <button onClick={handleSendMessage} className="ml-2 p-2 bg-gray-700 text-white rounded">Enviar</button>
            </div>
        </div>
    );
};

export default Chat;