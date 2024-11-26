import React, { useState } from 'react';
import Avatar from 'avataaars';

const avatarMap = {
  avatar1: { id: 'avatar1', topType: 'ShortHairDreads01', accessoriesType: 'Blank', hairColor: 'BrownDark', facialHairType: 'Blank', clotheType: 'Hoodie', clotheColor: 'PastelBlue', eyeType: 'Happy', eyebrowType: 'Default', mouthType: 'Smile', skinColor: 'Light' },
  avatar2: { id: 'avatar2', topType: 'LongHairStraight', accessoriesType: 'Kurt', hairColor: 'Blonde', facialHairType: 'Blank', clotheType: 'BlazerShirt', clotheColor: 'Black', eyeType: 'Wink', eyebrowType: 'RaisedExcited', mouthType: 'Twinkle', skinColor: 'Pale' },
  avatar3: { id: 'avatar3', topType: 'Hat', accessoriesType: 'Prescription01', hairColor: 'Black', facialHairType: 'BeardLight', clotheType: 'GraphicShirt', clotheColor: 'Red', eyeType: 'Squint', eyebrowType: 'FlatNatural', mouthType: 'Serious', skinColor: 'Brown' },
  avatar4: { id: 'avatar4', topType: 'Hijab', accessoriesType: 'Round', hairColor: 'Auburn', facialHairType: 'Blank', clotheType: 'Overall', clotheColor: 'Blue02', eyeType: 'Surprised', eyebrowType: 'UpDown', mouthType: 'Smile', skinColor: 'DarkBrown' },
  avatar5: { id: 'avatar5', topType: 'LongHairCurly', accessoriesType: 'Sunglasses', hairColor: 'Red', facialHairType: 'Blank', clotheType: 'ShirtCrewNeck', clotheColor: 'Gray02', eyeType: 'WinkWacky', eyebrowType: 'RaisedExcitedNatural', mouthType: 'Disbelief', skinColor: 'Light' },
  avatar6: { id: 'avatar6', topType: 'ShortHairShortFlat', accessoriesType: 'Wayfarers', hairColor: 'BlondeGolden', facialHairType: 'MoustacheFancy', clotheType: 'BlazerSweater', clotheColor: 'PastelGreen', eyeType: 'Close', eyebrowType: 'Angry', mouthType: 'Grimace', skinColor: 'Yellow' }
};

const ContactsSidebar = ({ contacts, handleUserSelect, messages }) => {
    const [searchTerm, setSearchTerm] = useState('');
  
    const filteredContacts = contacts.filter(contact =>
      contact.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const getLastMessage = (userId) => {
      const userMessages = messages.filter(msg => msg.sender === userId || msg.receiver === userId);
      if (userMessages.length > 0) {
        return userMessages[userMessages.length - 1];
      }
      return null;
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
          {filteredContacts.map(contact => {
            const avatarData = avatarMap[contact.avatarId];
            const lastMessage = getLastMessage(contact.userId);
            const lastMessageTime = lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const lastMessageText = lastMessage ? lastMessage.text : 'No hay mensajes';
  
            return (
              <div
                key={contact.userId}
                className="flex items-center justify-between p-2 mb-2 bg-blue-800 rounded cursor-pointer"
                onClick={() => handleUserSelect(contact.userId)}
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
                  {contact.isConnected && (
                    <span className="w-3 h-3 rounded-full bg-green-500 mb-1"></span>
                  )}
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