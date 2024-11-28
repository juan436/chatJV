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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});


  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  const socketRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState(null);

  const [confirmedFriends, setConfirmedFriends] = useState([]);
  const [Allusers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [friendsWithStatus, setFriendsWithStatus] = useState([]);
  const [lastMessages, setLastMessages] = useState([]);


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
      socketRef.current = io('http://localhost:4000', { reconnection: false });

      socketRef.current.on('connect', () => {
        console.log('Conectado al servidor de Socket.io');
        if (userId && username && avatarId) {
          socketRef.current.emit('registerUser', { userId, username, avatarId });
        }
      });

      socketRef.current.on('receiveMessage', (message) => {
        console.log('Mensaje recibido:', message);

        // Actualizar la lista de mensajes localmente
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: message.senderId,
            message: { text: message.text },
            createdAt: message.createdAt,
            users: message.users,
          },
        ]);

        // Solo actualizar los mensajes no leídos si el chat no está abierto
        if (!isChatOpen || selectedUser?._id !== message.senderId) {
          setUnreadMessages((prevUnread) => ({
            ...prevUnread,
            [message.senderId]: (prevUnread[message.senderId] || 0) + 1,
          }));
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
  }, [userId, username, avatarId, isChatOpen, selectedUser]);
  
  console.log("usuarios conectados", connectedUsers);

  // Crear lista de amigos con estado de conexión
  useEffect(() => {
    const updateFriendsWithStatus = () => {
      const updatedFriends = confirmedFriends.map(friend => ({
        ...friend,
        isConnected: connectedUsers.some(user => user.userId === friend._id && user.isConnected)
      }));
      setFriendsWithStatus(updatedFriends);
    };

    updateFriendsWithStatus();
  }, [confirmedFriends, connectedUsers]);

  console.log('friendsWithStatus:', friendsWithStatus);


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


  console.log('friendRequests', friendRequests);

  // useEffect para recibir notificaciones de aceptación de amistad
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('friendRequestAccepted', ({ receiverId }) => {
        console.log('Evento friendRequestAccepted recibido:', { receiverId });

        // Buscar el usuario en Allusers que coincida con receiverId
        const user = Allusers.find(user => user._id === receiverId);

        if (user) {
          // Formatear el objeto
          const formattedUser = {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            isConnected: true // o false, dependiendo de la lógica de conexión
          };

          // Mostrar el resultado formateado en la consola
          console.log('Usuario formateado:', formattedUser);

          // Anexar el usuario formateado a la lista de amigos confirmados
          setConfirmedFriends(prevFriends => [...prevFriends, formattedUser]);
        } else {
          console.log('Usuario no encontrado');
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('friendRequestAccepted');
      }
    };
  }, [socketRef, userId, Allusers]);


  // funcion para cerrar la sesion
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAvatarId(null);

    // Emitir evento de cierre de sesión
    if (socketRef.current) {
      socketRef.current.emit('logout', { userId });
      socketRef.current.disconnect();
    }

    router.replace('/auth/login');
  }


  // funcion para seleccionar un usuario y abrir el chat
  const handleUserSelect = (user) => {
    console.log('Usuario seleccionado', user);
    setSelectedUser(user);
    setIsChatOpen(true);

    // Marcar mensajes como leídos
    setUnreadMessages((prevUnread) => ({
      ...prevUnread,
      [user._id]: 0,
    }));

    // Filtrar mensajes que incluyan el _id del usuario seleccionado
    const filteredMessages = messages.filter(message =>
      Array.isArray(message.users) && message.users.includes(user._id)
    );

    setMessages(filteredMessages);
    console.log('Mensajes filtrados:', filteredMessages);
  };

  // funcion para cerrar el chat
  const handleCloseChat = () => {
    setSelectedUser(null);
    setIsChatOpen(false);
  };

  // funcion para obtener los mensajes
  const fetchMessages = async () => {
    try {
      const response = await asApi.get(`/chat?userId=${userId}`);
      if (response.status === 200) {
        setMessages(response.data);
        console.log('Mensajes recibidos:', response.data);
      } else {
        console.error('Error al obtener mensajes:', response.statusText);
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    }
  };

  // useEffect para obtener los mensajes
  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);


  // useEffect para obtener los ultimos mensajes
  useEffect(() => {
    const getLastMessages = () => {
      const chatMap = {};

      messages.forEach((msg) => {
        // Ordenar los IDs de los usuarios para crear una clave única
        const chatKey = msg.users.sort().join('-');

        // Si el chat no existe en el mapa o el mensaje actual es más reciente, actualizar el mapa
        if (!chatMap[chatKey] || new Date(msg.createdAt) > new Date(chatMap[chatKey].createdAt)) {
          chatMap[chatKey] = msg;
        }
      });

      // Convertir el mapa en un array de mensajes
      const lastMessagesArray = Object.values(chatMap);
      setLastMessages(lastMessagesArray);
    };

    getLastMessages();
  }, [messages]);

  console.log("unreadMessages", unreadMessages);
  console.log("isChatOpen", isChatOpen);
  console.log("messages", messages);
  console.log("lastMessages", lastMessages);


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">Cargando...</div>;
  }

  const getUserNameById = (id) => {
    const user = connectedUsers.find(user => user.userId === id);
    return user ? user.username : 'Desconocido';
  };

  const userInfo = {
    avatar: avatarId,
    userId: userId,
    username: username,
    socketRef: socketRef,
    friendRequests: friendRequests,
    setFriendRequests: setFriendRequests,
    Allusers: Allusers,
    setConfirmedFriends: setConfirmedFriends
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <div className="flex flex-1 h-screen">
        <Sidebar userInfo={userInfo} handleLogout={handleLogout} avatarMap={avatarMap} />
        <ContactsSidebar contacts={friendsWithStatus}
          handleUserSelect={handleUserSelect}
          messages={messages}
          avatarMap={avatarMap}
          lastMessages={lastMessages}
          unreadMessages={unreadMessages}
          isChatOpen={isChatOpen}
        />

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
                isChatOpen={isChatOpen}
                setLastMessages={setLastMessages}
                setUnreadMessages={setUnreadMessages}
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