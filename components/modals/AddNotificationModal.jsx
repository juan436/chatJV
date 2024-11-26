import React, { useRef, useEffect } from 'react';
import Avatar from 'avataaars';

const AddNotificationModal = ({ isOpen, onClose, requests, avatarMap }) => {
  const modalRef = useRef(null);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div ref={modalRef} className="bg-blue-900 p-6 rounded relative w-1/3">
        <button onClick={onClose} className="absolute top-2 right-2 text-white">✖</button>
        <h2 className="text-xl font-bold mb-4 text-white">Solicitudes de Amistad</h2>
        <ul className="bg-gray-800 border border-gray-600 rounded mt-2">
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <li key={index} className="p-2 hover:bg-gray-600 cursor-pointer text-white flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar
                    style={{ width: '30px', height: '30px', marginRight: '10px' }}
                    avatarStyle='Circle'
                    {...avatarMap[request.avatarId]}
                  />
                  <span>{request.username}</span>
                </div>
                <button className="bg-green-500 text-white p-1 rounded">Aceptar</button>
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