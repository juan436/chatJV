import React, { useState, useEffect, useRef } from 'react';
import Avatar from 'avataaars';
import { FaComments, FaUserPlus, FaSignOutAlt, FaBell } from 'react-icons/fa';
import AddContactModal from '../modals/AddContactModal';
import AddNotificationModal from '../modals/AddNotificationModal';

const Sidebar = ({ userInfo , handleLogout, avatarMap, Allusers }) => {

  const { avatar, userId, username, socketRef} = userInfo;
  const [selected, setSelected] = useState('chats');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const menuRef = useRef(null);

  // Ejemplo de solicitudes de amistad
  const friendRequests = [
    { username: 'juan', avatarId: 'avatar1' },
    { username: 'maria', avatarId: 'avatar2' },
    { username: 'pedro', avatarId: 'avatar3' },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col justify-between items-center p-0 bg-gray-900 h-screen w-16">
      <div className="flex flex-col items-center w-full mt-10">
        <button
          className="text-white mb-4 p-2 w-full bg-gray-800 flex justify-center items-center"
          onClick={() => setSelected('chats')}
        >
          <FaComments size={24} />
        </button>
        <button
          className="text-white mb-4 p-2 w-full flex justify-center items-center transform active:scale-90 transition-transform"
          onClick={() => setShowAddModal(true)}
        >
          <FaUserPlus size={24} />
        </button>
        <button
          className="text-white mb-4 p-2 w-full flex justify-center items-center transform active:scale-90 transition-transform"
          onClick={() => setShowNotificationsModal(true)}
        >
          <FaBell size={24} />
        </button>
      </div>
      <div className="flex flex-col items-center mb-20">
        {avatar && (
          <div className="relative cursor-pointer mb-4" onClick={toggleMenu} ref={menuRef}>
            <Avatar
              style={{ width: '40px', height: '40px' }}
              avatarStyle='Circle'
              {...avatar}
            />
            {menuOpen && (
              <div className="absolute bottom-12 left-0 bg-gray-700 text-white p-2 rounded shadow-lg">
                <span>{username}</span>
              </div>
            )}
          </div>
        )}
        <button onClick={handleLogout} className="text-white flex justify-center items-center transform active:scale-90 transition-transform">
          <FaSignOutAlt size={24} />
        </button>
      </div>

      {/* Modal de Agregar Contacto */}
      <AddContactModal isOpen={showAddModal} userId={userId} Allusers={Allusers} onClose={() => setShowAddModal(false)} avatarMap={avatarMap} socketRef={socketRef} />

      {/* Modal de Notificaciones */}
      <AddNotificationModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        requests={friendRequests}
        avatarMap={avatarMap}
      />
    </div>
  );
};

export default Sidebar;