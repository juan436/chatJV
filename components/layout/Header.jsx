import React from 'react';
import Avatar from 'avataaars';
import Link from 'next/link';

const Header = ({ avatar, userName, handleLogout }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-900">
      <nav className="flex items-center">
        <h1 className="text-xl font-bold">JCV*</h1>
      </nav>
      <div className="flex items-center">
        {avatar ? (
          <>
            <span className="mr-2 text-white">{userName}</span> {/* Mostrar el nombre del usuario */}
            <Avatar
              style={{ width: '40px', height: '40px' }}
              avatarStyle='Circle'
              {...avatar}
            />
            <button onClick={handleLogout} className="ml-4 text-blue-400 hover:text-blue-300">
              Cerrar Sesión
            </button>
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