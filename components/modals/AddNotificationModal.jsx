import React, { useRef, useEffect, useState } from 'react';
import Avatar from 'avataaars';
import { asApi } from '@/apiAxios';
import { FaCheck } from 'react-icons/fa';

const AddNotificationModal = ({ isOpen, onClose, requests, avatarMap, setFriendRequests, Allusers, userId, setConfirmedFriends, socketRef }) => {
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

    // Prevenir multiples clicks si la solicitud ya fue aceptada
    if (acceptedRequests.includes(request.sender._id)) {
      console.log('Solicitud ya aceptada.');
      return;
    }

    try {
      console.log('Enviando solicitud para aceptar:', request);
      const response = await asApi.patch('/friends', {
        senderId: request.sender._id,
        receiverId: request.receiver
      });

      if (response.status === 200) {
        console.log('Solicitud de amistad aceptada con éxito');
        setAcceptedRequests(prev => [...prev, request.sender._id]);

        // Eliminar la solicitud de la lista de notificaciones
        setFriendRequests(prevRequests => 
          prevRequests.filter(req => req.senderId !== request.sender._id)
        );

        // Notificar al servidor que la solicitud fue aceptada
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
              <div key={request.sender?._id || index} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                <div className="flex items-center">
                  <Avatar
                    style={{ width: '30px', height: '30px', marginRight: '10px' }}
                    avatarStyle='Circle'
                    {...(avatarMap[request.sender?.avatar] || {})}
                  />
                  <p className="text-white">{request.sender?.username || 'Usuario desconocido'}</p>
                </div>
                <button 
                  onClick={() => handleAcceptRequest(request)}
                  disabled={acceptedRequests.includes(request.sender?._id)} // Deshabilitar si ya fue aceptada
                  className={`p-1 rounded-full text-white ${acceptedRequests.includes(request.sender?._id) ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'}`}>
                  <FaCheck />
                </button>
              </div>
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