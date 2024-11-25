'use client'
import React, { useEffect, useState, useRef } from 'react';
import jwt from 'jsonwebtoken';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import Avatar from 'avataaars';
import Chat from '@/components/chat/Chat';
import io from 'socket.io-client';

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
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const socketRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    const socketInitializer = async () => {
      socketRef.current = io('http://localhost:4000');
  
      socketRef.current.on('connect', () => {
        console.log('Conectado al servidor de Socket.io');
        if (userId && username && avatarId) {
          socketRef.current.emit('registerUser', { userId, username, avatarId });
        }
      });
  
      socketRef.current.on('updateUsers', (users) => {
        console.log('Usuarios conectados:', users);
        setConnectedUsers(users);
      });
    };
  
    socketInitializer();
  
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, username, avatarId]);


  console.log("connectedUsers", connectedUsers);
  // useEffect para verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/auth/login');
    } else {
      try {
        const decoded = jwt.decode(token);
        setAvatarId(decoded.avatarId);
        setUserId(decoded.userId);
        setUsername(decoded.username);
        setLoading(false);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        setLoading(false);
      }
    }
  }, [router]);

  // useEffect para evitar que el usuario vuelva a la pagina de login al volver con el boton de atras del navegador
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

  // funcion para cerrar la sesion
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAvatarId(null);
    router.replace('/auth/login');
  }

  // funcion para seleccionar un usuario y abrir el chat
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);
    setUnreadMessages((prevUnread) => ({
      ...prevUnread,
      [user._id]: 0,
    }));

    try {
      const response = await fetch(`/api/chat?userId=${userId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  // funcion para cerrar el chat
  const handleCloseChat = () => {
    setSelectedUser(null);
    setIsChatOpen(false);
  };


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">Cargando...</div>;
  }

  const userAvatar = avatarMap[avatarId];

  const getUserNameById = (id) => {
    const user = connectedUsers.find(user => user.userId === id);
    return user ? user.username : 'Desconocido';
  };

  const exampleUsers = [
    {
      _id: '1',
      username: 'Juancho',
      avatar: 'avatar1',
      lastMessage: 'Hola tal cosa tal cosa tal cosa',
      time: '09:00',
      unreadCount: 2,
    },
    {
      _id: '2',
      username: 'Maria',
      avatar: 'avatar2',
      lastMessage: '¿Cómo estás?',
      time: '09:15',
      unreadCount: 1,
    },
    {
      _id: '3',
      username: 'Carlos',
      avatar: 'avatar3',
      lastMessage: 'Nos vemos mañana',
      time: '10:30',
      unreadCount: 0,
    },
    {
      _id: '4',
      username: 'Ana',
      avatar: 'avatar4',
      lastMessage: '¡Feliz cumpleaños!',
      time: '11:45',
      unreadCount: 3,
    },
    {
      _id: '5',
      username: 'Luis',
      avatar: 'avatar5',
      lastMessage: '¿Qué tal el proyecto?',
      time: '12:00',
      unreadCount: 0,
    },
    {
      _id: '6',
      username: 'Sofia',
      avatar: 'avatar6',
      lastMessage: 'Llámame cuando puedas',
      time: '13:20',
      unreadCount: 5,
    },
  ];

  const truncateMessage = (message, maxLength) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  

  const filteredUsers = connectedUsers.filter(user => user.userId !== userId);

  console.log('userId:', userId);
  console.log('connectedUsers:', connectedUsers);
  console.log('filteredUsers:', filteredUsers);

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Header avatar={userAvatar} userName={username} handleLogout={handleLogout} />
      <div className="flex flex-1 h-screen">
        <div className={`p-2 sm:p-4 mt-0 pt-8 sm:pt-8 sm:mt-0 bg-[#00325b] flex flex-col justify-start items-center w-full sm:w-1/6 md:w-1/5 ${isChatOpen ? 'hidden' : 'block'} md:block`}>
          <h2 className="text-2xl font-bold mb-4 text-center">Lista de Contactos</h2>
          <div className="flex flex-col items-center justify-center space-y-2 overflow-y-auto w-full" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            {filteredUsers.map(user => (
              <div
                key={user.userId}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-600 w-full rounded-lg transition duration-300"
                onClick={() => handleUserSelect(user)}
              >
                <Avatar
                  style={{ width: '40px', height: '40px' }}
                  avatarStyle='Circle'
                  {...avatarMap[user.avatarId]}
                />
                <div className="ml-3 flex-1">
                  <span className="font-bold">{user.username}</span>
                </div>
              </div>
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