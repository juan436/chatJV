'use client'
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import asApi from '@/apiAxios/asApi';
import Avatar from 'avataaars';
import EmojiPicker from 'emoji-picker-react';

const avatarMap = {
  avatar1: { id: 'avatar1', topType: 'ShortHairDreads01', accessoriesType: 'Blank', hairColor: 'BrownDark', facialHairType: 'Blank', clotheType: 'Hoodie', clotheColor: 'PastelBlue', eyeType: 'Happy', eyebrowType: 'Default', mouthType: 'Smile', skinColor: 'Light' },
  avatar2: { id: 'avatar2', topType: 'LongHairStraight', accessoriesType: 'Kurt', hairColor: 'Blonde', facialHairType: 'Blank', clotheType: 'BlazerShirt', clotheColor: 'Black', eyeType: 'Wink', eyebrowType: 'RaisedExcited', mouthType: 'Twinkle', skinColor: 'Pale' },
  avatar3: { id: 'avatar3', topType: 'Hat', accessoriesType: 'Prescription01', hairColor: 'Black', facialHairType: 'BeardLight', clotheType: 'GraphicShirt', clotheColor: 'Red', eyeType: 'Squint', eyebrowType: 'FlatNatural', mouthType: 'Serious', skinColor: 'Brown' },
  avatar4: { id: 'avatar4', topType: 'Hijab', accessoriesType: 'Round', hairColor: 'Auburn', facialHairType: 'Blank', clotheType: 'Overall', clotheColor: 'Blue02', eyeType: 'Surprised', eyebrowType: 'UpDown', mouthType: 'Smile', skinColor: 'DarkBrown' },
  avatar5: { id: 'avatar5', topType: 'LongHairCurly', accessoriesType: 'Sunglasses', hairColor: 'Red', facialHairType: 'Blank', clotheType: 'ShirtCrewNeck', clotheColor: 'Gray02', eyeType: 'WinkWacky', eyebrowType: 'RaisedExcitedNatural', mouthType: 'Disbelief', skinColor: 'Light' },
  avatar6: { id: 'avatar6', topType: 'ShortHairShortFlat', accessoriesType: 'Wayfarers', hairColor: 'BlondeGolden', facialHairType: 'MoustacheFancy', clotheType: 'BlazerSweater', clotheColor: 'PastelGreen', eyeType: 'Close', eyebrowType: 'Angry', mouthType: 'Grimace', skinColor: 'Yellow' }
};
function DashboardPage() {
  const [avatarId, setAvatarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [connectedUserIds, setConnectedUserIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const usersPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/auth/login');
    } else {
      try {
        const decoded = jwt.decode(token);
        setAvatarId(decoded.avatarId);
        fetchActiveUsers(decoded.userId).then(() => {
          setLoading(false);
        });

        const socket = new WebSocket('ws://localhost:8080');

        socket.addEventListener('open', () => {
          socket.send(JSON.stringify({ type: 'connect', userId: decoded.userId }));
        });

        socket.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'activeUsers') {
            setConnectedUserIds(data.activeUserIds);
          }
        });

        return () => {
          socket.close();
        };
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        setLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);

    const handlePopState = () => {
      window.location.href = 'https://www.google.com';
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  const fetchActiveUsers = async (userId) => {
    try {
      const response = await asApi.get(`/users?id=${userId}`);
      setActiveUsers(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await asApi.get(`/messages?userId=${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAvatarId(null);
    router.replace('/auth/login');
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: 'Tú', text: newMessage }]);
      setNewMessage('');
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage(newMessage + emojiObject.emoji);
  };

  const sortedUsers = activeUsers.sort((a, b) => {
    const aConnected = connectedUserIds.includes(a._id);
    const bConnected = connectedUserIds.includes(b._id);
    return bConnected - aConnected;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">Cargando...</div>;
  }

  const userAvatar = avatarMap[avatarId];

  return (
    <div className="flex min-h-screen bg-gray-800 text-white">
      <div className="w-1/6 bg-gray-900 p-4">
        <h2 className="text-xl font-bold mb-4 mt-18">Contactos</h2>
        {currentUsers.map(user => (
          <div
            key={user._id}
            className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
            onClick={() => handleUserSelect(user)}
          >
            <Avatar
              style={{ width: '40px', height: '40px' }}
              avatarStyle='Circle'
              {...avatarMap[user.avatar]}
            />
            <span className="ml-2">{user.username}</span>
            {connectedUserIds.includes(user._id) && <span className="ml-2 text-green-500">●</span>}
          </div>
        ))}
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(activeUsers.length / usersPerPage) }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-2 py-1 mx-1 ${currentPage === i + 1 ? 'bg-blue-500' : 'bg-gray-700'} text-white rounded`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <Header avatar={userAvatar} handleLogout={handleLogout} />
        <main className="flex flex-1">
          {selectedUser ? (
            <div className="flex-1 flex flex-col p-4 bg-gray-700 rounded">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                <button onClick={handleCloseChat} className="text-white text-xl">✖</button>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-800 p-2 rounded">
                {messages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    <span className="font-bold">{msg.sender}: </span>
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-2 relative">
                <button onClick={() => setShowEmojis(!showEmojis)} className="p-2 bg-gray-600 text-white rounded">😊</button>
                {showEmojis && (
                  <div className="absolute bottom-12 left-0 z-10" style={{ backgroundColor: '#1E3A8A', borderRadius: '8px' }}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
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
          ) : (
            <div className="flex justify-center items-center flex-1">
              <h2 className="text-2xl font-bold">Selecciona un contacto para chatear</h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;