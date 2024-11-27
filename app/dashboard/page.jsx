'use client'
import React, { useEffect, useState, useRef } from 'react';
import jwt from 'jsonwebtoken';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import Chat from '@/components/chat/Chat';
import io from 'socket.io-client';
import ContactsSidebar from '@/components/layout/ContactsSidebar';
import { asApi } from '@/apiAxios';

const avatarMap = {
  avatar1: { id: 'avatar1', topType: 'ShortHairDreads01', accessoriesType: 'Blank', hairColor: 'BrownDark', facialHairType: 'Blank', clotheType: 'Hoodie', clotheColor: 'PastelBlue', eyeType: 'Happy', eyebrowType: 'Default', mouthType: 'Smile', skinColor: 'Light' },
  avatar2: { id: 'avatar2', topType: 'LongHairStraight', accessoriesType: 'Kurt', hairColor: 'Blonde', facialHairType: 'Blank', clotheType: 'BlazerShirt', clotheColor: 'Black', eyeType: 'Wink', eyebrowType: 'RaisedExcited', mouthType: 'Twinkle', skinColor: 'Pale' },
  avatar3: { id: 'avatar3', topType: 'Hat', accessoriesType: 'Prescription01', hairColor: 'Black', facialHairType: 'BeardLight', clotheType: 'GraphicShirt', clotheColor: 'Red', eyeType: 'Squint', eyebrowType: 'FlatNatural', mouthType: 'Serious', skinColor: 'Brown' },
  avatar4: { id: 'avatar4', topType: 'Hijab', accessoriesType: 'Round', hairColor: 'Auburn', facialHairType: 'Blank', clotheType: 'Overall', clotheColor: 'Blue02', eyeType: 'Surprised', eyebrowType: 'UpDown', mouthType: 'Smile', skinColor: 'DarkBrown' },
  avatar5: { id: 'avatar5', topType: 'LongHairCurly', accessoriesType: 'Sunglasses', hairColor: 'Red', facialHairType: 'Blank', clotheType: 'ShirtCrewNeck', clotheColor: 'Gray02', eyeType: 'WinkWacky', eyebrowType: 'RaisedExcitedNatural', mouthType: 'Disbelief', skinColor: 'Light' },
  avatar6: { id: 'avatar6', topType: 'ShortHairShortFlat', accessoriesType: 'Wayfarers', hairColor: 'BlondeGolden', facialHairType: 'MoustacheFancy', clotheType: 'BlazerSweater', clotheColor: 'PastelGreen', eyeType: 'Close', eyebrowType: 'Angry', mouthType: 'Grimace', skinColor: 'Yellow' }
};

function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  const socketRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [unreadMessages, setUnreadMessages] = useState({});

  const [confirmedFriends, setConfirmedFriends] = useState([]);
  const [Allusers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);


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

  // useEffect para conectar al socket
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

  // Crear lista de amigos con estado de conexión
  const friendsWithStatus = confirmedFriends.map(friend => ({
    ...friend,
    isConnected: connectedUsers.some(user => user.userId === friend._id)
  }));

  console.log('friendsWithStatusaaa', friendsWithStatus);


  // GET para obtener los amigos confirmados
  const getConfirmedFriends = async (userId) => {
    try {
      const response = await asApi.get(`/friends?userId=${userId}&isVerified=true`);
      const confirmedFriends = response.data;
      setConfirmedFriends(confirmedFriends);
      console.log('Amigos confirmados:', confirmedFriends);
    } catch (error) {
      console.error('Error al obtener amigos confirmados:', error);
    }
  };

  // GET para obtener todos los usuarios
  const getUsers = async (userId) => {
    const response = await asApi.get(`/users?id=${userId}`);
    const data = response.data;
    setAllUsers(data);
    console.log('users aaa', data);
  }

  // GET para obtener las solicitudes de amistad pendientes
  const getFriendRequests = async (userId) => {
    try {
      const response = await asApi.get(`/friends?receiverId=${userId}&isVerified=false`);
      const pendingRequests = response.data;
      setFriendRequests(pendingRequests);
      console.log('Solicitudes de amistad pendientes:', pendingRequests);
    } catch (error) {
      console.error('Error al obtener solicitudes de amistad pendientes:', error);
    }
  };

  useEffect(() => {

    if (userId) {
      getConfirmedFriends(userId);
      getUsers(userId);
      getFriendRequests(userId);
    }
  }, [userId]);

  console.log('friendRequests', friendRequests);
  console.log('confirmedFriends', confirmedFriends);
  console.log('allUsers', Allusers);



  // useEffect para recibir solicitudes de amistad
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('receiveFriendRequest', ({ senderId, receiverId }) => {
        if (receiverId === userId) {
          console.log('Nueva solicitud de amistad de:', senderId);
          setFriendRequests(prevRequests => [...prevRequests, { senderId }]);
          localStorage.setItem('friendRequests', JSON.stringify([...friendRequests, { senderId }]));
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receiveFriendRequest');
      }
    };
  }, [friendRequests, userId]);



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
      const response = await asApi.get(`/chat?userId=${userId}`);
      const data = response.data;
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

  const getUserNameById = (id) => {
    const user = connectedUsers.find(user => user.userId === id);
    return user ? user.username : 'Desconocido';
  };

  const filteredUsers = connectedUsers.filter(user => user.userId !== userId);

  console.log('userId:', userId);
  console.log('connectedUsers:', connectedUsers);
  console.log('filteredUsers:', filteredUsers);

  const userInfo = {
    avatar: avatarId,
    userId: userId,
    username: username,
    socketRef: socketRef,
    friendRequests: friendRequests,
    setFriendRequests: setFriendRequests,
    Allusers: Allusers
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <div className="flex flex-1 h-screen">
        <Sidebar userInfo={userInfo} handleLogout={handleLogout} avatarMap={avatarMap} />
        <ContactsSidebar contacts={friendsWithStatus} handleUserSelect={handleUserSelect} messages={messages} avatarMap={avatarMap} />
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