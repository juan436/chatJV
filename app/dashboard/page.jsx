'use client'
import React, { useEffect, useState, useRef } from 'react';
import jwt from 'jsonwebtoken';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import asApi from '@/apiAxios/asApi';
import Avatar from 'avataaars';
import Chat from '@/components/chat/Chat';

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
  const router = useRouter();
  const socketRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [usersPerPage, setUsersPerPage] = useState(10);
  const [unreadMessages, setUnreadMessages] = useState({});

  // Detectar el tamaño de la pantalla y ajustar el número de usuarios por página
  useEffect(() => {
    const updateUsersPerPage = () => {
      if (window.innerWidth < 640) {
        setUsersPerPage(7);
      } else {
        setUsersPerPage(10);
      }
    };

    updateUsersPerPage();
    window.addEventListener('resize', updateUsersPerPage);
    return () => window.removeEventListener('resize', updateUsersPerPage);
  }, []);

  // Prevent back button
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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAvatarId(null);
    router.replace('/auth/login');
  }

  // Select user
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
    setIsChatOpen(true);
    // Restablecer el conteo de mensajes no leídos para el usuario seleccionado
    setUnreadMessages((prevUnread) => ({
      ...prevUnread,
      [user._id]: 0,
    }));
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setIsChatOpen(false);
  };
  //  get active users
  const fetchActiveUsers = async (userId) => {
    try {
      const response = await asApi.get(`/users?id=${userId}`);
      setActiveUsers(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
    }
  };

  // get all users
  const fetchAllUsers = async () => {
    try {
      const response = await asApi.get('/users');
      const users = response.data.map(user => ({ id: user._id, name: user.username }));
      setAllUsers(users);
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // get user name by id
  const getUserNameById = (id) => {
    const user = allUsers.find(user => user.id === id);
    return user ? user.name : 'Desconocido';
  };

  // Obtener mensajes
  const fetchMessages = async (selectedUserId) => {
    try {
      const response = await asApi.get(`/chat?userId=${userId}`);
      console.log('Datos recibidos:', response.data); // Verifica los datos recibidos
      const filteredMessages = response.data.filter(
        msg => msg.users.includes(userId) && msg.users.includes(selectedUserId)
      );
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    }
  };

  // configuration to connect with websocket
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/auth/login');
    } else {
      try {
        const decoded = jwt.decode(token);
        setAvatarId(decoded.avatarId);
        setUserId(decoded.userId);
        fetchActiveUsers(decoded.userId).then(() => {
          setLoading(false);
        });

        const connectWebSocket = () => {
          if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
            return; // Evita reconectar si la conexión ya está abierta o en proceso de cierre
          }

          socketRef.current = new WebSocket('ws://localhost:8080');

          socketRef.current.addEventListener('open', () => {
            socketRef.current.send(JSON.stringify({ type: 'connect', userId: decoded.userId }));
            console.log('Conexión WebSocket abierta');
          });

          socketRef.current.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('Mensaje recibido:', data);
            if (data.type === 'activeUsers') {
              setConnectedUserIds(data.activeUserIds);
            } else if (data.type === 'message') {
              if ((data.senderId === userId && data.receiverId === selectedUser?._id) ||
                (data.senderId === selectedUser?._id && data.receiverId === userId)) {
                setMessages((prevMessages) => [...prevMessages, { sender: data.senderId, text: data.text }]);
              } else {
                // Incrementar el conteo de mensajes no leídos
                setUnreadMessages((prevUnread) => ({
                  ...prevUnread,
                  [data.senderId]: (prevUnread[data.senderId] || 0) + 1,
                }));
              }
            }
          });

          socketRef.current.addEventListener('close', () => {
            console.log('Conexión WebSocket cerrada, intentando reconectar...');
            setTimeout(connectWebSocket, 5000); // Intenta reconectar cada 5 segundos
          });

          socketRef.current.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
          });
        };

        connectWebSocket();

        return () => {
          if (socketRef.current) {
            socketRef.current.close();
          }
        };
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        setLoading(false);
      }
    }
  }, [router, selectedUser, userId]);



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
  const userName = getUserNameById(userId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Header avatar={userAvatar} userName={userName} handleLogout={handleLogout} />
      <div className="flex flex-1 h-screen">
        <div className={`p-4 mt-0 pt-8 sm:pt-8 sm:mt-0 bg-[#00325b] flex flex-col justify-start items-center w-full md:w-1/5 ${isChatOpen ? 'hidden' : 'block'} md:block`}>
          <h2 className="text-2xl font-bold mb-4 text-center">Lista de Contactos</h2>
          <div className="flex flex-col items-center justify-center space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            {currentUsers.map(user => (
              <div
                key={user._id}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-600 w-full max-w-xs rounded-lg transition duration-300"
                onClick={() => handleUserSelect(user)}
              >
                <Avatar
                  style={{ width: '40px', height: '40px' }}
                  avatarStyle='Circle'
                  {...avatarMap[user.avatar]}
                />
                <span className="ml-3">{user.username}</span>
                {connectedUserIds.includes(user._id) && <span className="ml-2 text-green-500">●</span>}
                {unreadMessages[user._id] > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                    {unreadMessages[user._id]}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            {Array.from({ length: Math.ceil(activeUsers.length / usersPerPage) }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-2 py-1 mx-1 ${currentPage === i + 1 ? 'bg-blue-500' : 'bg-gray-600'} text-white rounded`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div className={`flex-1 flex flex-col ${isChatOpen ? 'block' : 'hidden'} md:block`}>
          <main className="flex flex-1 w-full h-full bg-gray-800">
            {selectedUser ? (
              <Chat
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                messages={messages}
                setMessages={setMessages}
                userId={userId}
                socketRef={socketRef}
                getUserNameById={getUserNameById}
                handleCloseChat={handleCloseChat}
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full">
                <p className="text-center">Seleccione un contacto para chatear</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
  export default DashboardPage;