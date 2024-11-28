import React, { useState, useRef, useEffect } from 'react';
import Avatar from 'avataaars';
import { asApi } from '@/apiAxios';

const AddContactModal = ({ isOpen, userId, Allusers, onClose, avatarMap, socketRef }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const modalRef = useRef(null);

  console.log('Allusers para agregar contacto', Allusers);

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

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      const filteredUsers = Allusers
        .filter(user => user.username.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Limita a 5 sugerencias
      setSuggestions(filteredUsers);
    } else {
      setSuggestions([]);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    console.log('Enviando solicitud de amistad a:', receiverId);
    try {
      const response = await asApi.post('/friends', {
        senderId: userId,
        receiverId: receiverId,
      });

      if (response.status === 201) {
        console.log('Solicitud de amistad enviada:', response.data);
        setSuccessMessage('Solicitud enviada');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (socketRef.current) {
          socketRef.current.emit('friendRequestSent', { receiverId, senderId: userId });
        }
      } else {
        console.error('Error en la respuesta de la API:', response);
      }
    } catch (error) {
      console.error('Error al enviar solicitud de amistad:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      console.log('Usuario seleccionado para enviar solicitud:', selectedUser);
      sendFriendRequest(selectedUser._id);
      setSelectedUser(null);
    } else {
      console.log('No hay usuario seleccionado');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div ref={modalRef} className="bg-blue-900 p-6 rounded relative w-1/3">
        <button onClick={onClose} className="absolute top-2 right-2 text-white">✖</button>
        <h2 className="text-xl font-bold mb-4 text-white">Agregar Contacto</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white">Nombre de Usuario</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded text-white bg-gray-700"
              placeholder="Ingrese el nombre de usuario"
            />
            {suggestions.length > 0 && (
              <ul className="bg-gray-800 border border-gray-600 rounded mt-2">
                {suggestions.map((user, index) => (
                  <li key={index} className="p-2 hover:bg-gray-600 cursor-pointer text-white flex items-center" onClick={() => {
                    setSelectedUser(user);
                    setSearchTerm('');
                    setSuggestions([]); // Cerrar el menú desplegable
                  }}>
                    <Avatar
                      style={{ width: '30px', height: '30px', marginRight: '10px' }}
                      avatarStyle='Circle'
                      {...avatarMap[user.avatar]}
                    />
                    {user.username}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedUser && (
            <div className="mt-2 mb-4 p-2 bg-blue-900 rounded text-white flex items-center">
              <Avatar
                style={{ width: '30px', height: '30px', marginRight: '10px' }}
                avatarStyle='Circle'
                {...avatarMap[selectedUser.avatar]}
              />
              {selectedUser.username}
            </div>
          )}
          {successMessage && (
            <div className="mt-2 mb-4 p-2 bg-green-500 rounded text-white">
              {successMessage}
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded transform transition-transform duration-150 active:scale-95"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;