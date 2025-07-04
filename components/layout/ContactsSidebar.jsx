import React, { useState } from 'react';
import Avatar from 'avataaars';

const ContactsSidebar = ({ contacts, handleUserSelect, avatarMap, lastMessages, unreadMessages, isChatOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Eliminar duplicados antes de renderizar para evitar errores de keys
  const uniqueContacts = filteredContacts.filter((contact, index, self) =>
    index === self.findIndex(c => c._id === contact._id)
  );

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="flex flex-col p-4 bg-gray-700 h-screen w-1/5">
      <h2 className="text-white text-lg mb-4">Mensajes</h2>
      <input
        type="text"
        placeholder="Buscar..."
        className="p-2 mb-4 rounded bg-gray-600 text-white placeholder-gray-400"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex flex-col overflow-y-auto">
        {uniqueContacts.map(contact => {
          const avatarData = avatarMap[contact.avatar];
          const lastMessage = lastMessages.find(msg => msg.users.includes(contact._id));
          const lastMessageText = lastMessage ? truncateText(lastMessage.message.text, 20) : 'No hay mensajes';
          const lastMessageTime = lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
          const unreadCount = unreadMessages[contact._id] || 0;

          return (
            <div
              key={contact._id}
              className="flex items-center justify-between p-2 mb-2 bg-blue-800 rounded cursor-pointer"
              onClick={() => handleUserSelect(contact)}
            >
              <div className="flex items-center">
                <Avatar
                  style={{ width: '40px', height: '40px' }}
                  avatarStyle='Circle'
                  {...avatarData}
                />
                <div className="ml-2">
                  <span className="text-white font-bold">{contact.username}</span>
                  <p className="text-gray-300 text-sm truncate">{lastMessageText}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 mr-1">{unreadCount}</span>
                  )}
                  {contact.isConnected && (
                    <span className="w-3 h-3 rounded-full bg-green-500 mb-1"></span>
                  )}
                </div>
                <span className="text-gray-300 text-xs">{lastMessageTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactsSidebar;