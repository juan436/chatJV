import React, { useRef, useEffect, useState } from 'react';
import Avatar from 'avataaars';
import { asApi } from '@/apiAxios';
import { FaCheck } from 'react-icons/fa';

const AddNotificationModal = ({ isOpen, onClose, requests, avatarMap, setFriendRequests, Allusers, userId, setConfirmedFriends, socketRef }) => {
  console.log('requests en modal', requests);
  console.log('Allusers en modal', Allusers);
  const modalRef = useRef(null);
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const formatRequests = (requests) => {
    return requests.map(request => {
      if (!request.receiver) {
        return {
          ...request,
          receiver: userId,
          sender: request.sender || Allusers.find(user => user._id === request.senderId) || {}
        };
      }
      return request;
    });
  };

  const formattedRequests = formatRequests(requests);

  const handleAcceptRequest = async (request) => {
    console.log('request en handleAcceptRequest', request);
    try {
      console.log('Enviando solicitud para aceptar:', request);
      const response = await asApi.patch('/friends', {
        senderId: request.sender._id,
        receiverId: request.receiver
      });

      if (response.status === 200) {
        const updatedFriend = response.data;
        console.log('Solicitud aceptada:', updatedFriend);

        // Formatear la información del amigo confirmado
        const formattedFriend = {
          _id: request.sender._id,
          username: request.sender.username,
          avatar: request.sender.avatar,
        };

        console.log('formattedFriend', formattedFriend);
        // Agregar el amigo confirmado al estado
        setConfirmedFriends(prevFriends => [
          ...prevFriends,
          formattedFriend
        ]);

        setFriendRequests(prevRequests => prevRequests.filter(req => req.senderId !== request.sender._id));
        setAcceptedRequests(prev => [...prev, request.sender._id]);
       
        if (socketRef.current) {
          socketRef.current.emit('acceptFriendRequest', {
            senderId: request.sender._id,
            receiverId: userId
          });
        }
      } else {
        console.error('Error al aceptar la solicitud:', response.statusText);
      }
    } catch (error) {
      console.error('Error al aceptar la solicitud:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div ref={modalRef} className="bg-blue-900 p-6 rounded relative w-1/4">
        <button onClick={onClose} className="absolute top-2 right-2 text-white">✖</button>
        <h2 className="text-xl font-bold mb-4 text-white">Solicitudes de Amistad</h2>
        <ul className="bg-gray-800 border border-gray-600 rounded mt-2">
          {formattedRequests.length > 0 ? (
            formattedRequests.map((request, index) => (
              <li key={index} className="p-2 hover:bg-gray-600 cursor-pointer text-white flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar
                    style={{ width: '30px', height: '30px', marginRight: '10px' }}
                    avatarStyle='Circle'
                    {...(avatarMap[request.sender?.avatar] || {})}
                  />
                  <span>{request.sender?.username || 'Usuario desconocido'}</span>
                </div>
                <button
                  className="bg-green-500 text-white p-1 rounded"
                  onClick={() => handleAcceptRequest(request)}
                >
                  {acceptedRequests.includes(request.sender._id) ? <FaCheck color="white" /> : 'Aceptar'}
                </button>
              </li>
            ))
          ) : (
            <li className="p-2 text-white">No hay solicitudes pendientes</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AddNotificationModal;