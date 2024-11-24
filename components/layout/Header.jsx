import React, { useState, useRef, useEffect } from 'react';
import Avatar from 'avataaars';
import Link from 'next/link';

const Header = ({ avatar, userName, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleClick = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setTimeout(() => {
        setMenuOpen(false);
      }, 1000); // Espera 1 segundo antes de cerrar el menú
    }
  };

  const toggleMenu = (event) => {
    event.stopPropagation();
    setMenuOpen((prevMenuOpen) => !prevMenuOpen);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900">
      <nav className="flex items-center">
        <h1 className="text-xl font-bold">JCV*</h1>
      </nav>
      <div className="flex items-center relative">
        {avatar ? (
          <>
            <div onClick={toggleMenu} className="cursor-pointer">
              <Avatar
                style={{ width: '40px', height: '40px' }}
                avatarStyle='Circle'
                {...avatar}
              />
            </div>
            <div className="hidden md:flex items-center ml-2">
              <span className="text-white">{userName}</span>
              <button onClick={handleLogout} className="ml-4 text-blue-400 hover:text-blue-300">
                Cerrar Sesión
              </button>
            </div>
            {menuOpen && (
              <div ref={menuRef} className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 md:hidden">
                <div className="flex flex-col items-center p-4">
                  <span className="text-white">{userName}</span>
                  <button onClick={handleLogout} className="mt-2 text-blue-400 hover:text-blue-300">
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Link href="/auth/signup" className="mr-4 text-blue-400 hover:text-blue-300">
              Regístrate
            </Link>
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
              Iniciar Sesión
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;