import React, { useRef, useEffect, useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import asApi from '@/apiAxios/asApi';

const Chat = ({ selectedUser, setSelectedUser, messages, setMessages, userId, socketRef, getUserNameById, handleCloseChat }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);
    const emojiRef = useRef(null);

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

    const handleEmojiClick = (emoji) => {
        setNewMessage(newMessage + emoji.native);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedUser) {
            const messageData = {
                type: 'message',
                senderId: userId,
                receiverId: selectedUser._id,
                text: newMessage,
            };

            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify(messageData));
            } else {
                console.error('WebSocket no está conectado');
            }

            // Guardar el mensaje en la base de datos
            try {
                const response = await asApi.post('/chat', {
                    from: userId,
                    to: selectedUser._id,
                    text: newMessage,
                });
                console.log('Respuesta de la API:', response);
                if (response.status !== 200) {
                    console.error('Error al guardar el mensaje en la base de datos');
                }
            } catch (error) {
                console.error('Error al guardar el mensaje:', error);
            }

            // Actualizar la lista de mensajes localmente
            setMessages((prevMessages) => [...prevMessages, { sender: userId, message: { text: newMessage } }]);
            setNewMessage('');
        }
    };

    return (
        <div className="flex-1 flex flex-col p-4 bg-gray-700 rounded h-[885px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                <button onClick={handleCloseChat} className="text-white text-xl">✖</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-800 p-2 rounded custom-scrollbar">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded-lg max-w-xs ${msg.sender === userId ? 'bg-gray-600 text-white mr-auto' : 'bg-blue-500 text-white ml-auto'
                            }`} // Cambia las clases aquí
                    >
                        <span className="font-bold">{getUserNameById(msg.sender)}: </span>
                        <span>{msg.message.text}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center mt-2 relative">
                <button onClick={() => setShowEmojis(!showEmojis)} className="p-2 bg-gray-600 text-white rounded">😊</button>
                {showEmojis && (
                    <div ref={emojiRef} className="absolute bottom-12 left-0 z-10" style={{ backgroundColor: '#f0f0f0' }}>
                        <Picker data={data} onEmojiSelect={handleEmojiClick} />
                    </div>
                )}
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 p-2 rounded bg-gray-600 text-white ml-2"
                />
                <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">Enviar</button>
            </div>
        </div>
    );
};

export default Chat;