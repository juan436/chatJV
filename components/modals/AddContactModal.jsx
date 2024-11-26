import React, { useState, useRef, useEffect } from 'react';
import Avatar from 'avataaars';

const AddContactModal = ({ isOpen, onClose, avatarMap }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const modalRef = useRef(null);

  // Valores de prueba para usuarios con avatarId
  const users = [
    { username: 'juan', avatarId: 'avatar1' },
    { username: 'maria', avatarId: 'avatar2' },
    { username: 'pedro', avatarId: 'avatar3' },
    { username: 'ana', avatarId: 'avatar4' },
    { username: 'luis', avatarId: 'avatar5' },
    { username: 'carlos', avatarId: 'avatar6' },
    { username: 'laura', avatarId: 'avatar1' },
  ];

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
      const filteredUsers = users
        .filter(user => user.username.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Limita a 5 sugerencias
      setSuggestions(filteredUsers);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div ref={modalRef} className="bg-blue-900 p-6 rounded relative w-1/3">
        <button onClick={onClose} className="absolute top-2 right-2 text-white">✖</button>
        <h2 className="text-xl font-bold mb-4 text-white">Agregar Contacto</h2>
        <form>
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
                  <li key={index} className="p-2 hover:bg-gray-600 cursor-pointer text-white flex items-center">
                    <Avatar
                      style={{ width: '30px', height: '30px', marginRight: '10px' }}
                      avatarStyle='Circle'
                      {...avatarMap[user.avatarId]}
                    />
                    {user.username}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Agregar</button>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;