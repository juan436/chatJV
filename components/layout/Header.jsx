import React from 'react';
import Avatar from 'avataaars';
import Link from 'next/link';

const Header = ({ avatar, handleLogout }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-900">
      <nav className="flex items-center">
        {!avatar && ( // Condición para mostrar el <h1> solo si no hay avatar
          <h1 className="text-xl font-bold">JCV*</h1>
        )}
      </nav>
      <div className="flex items-center">
        {avatar ? (
          <>
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