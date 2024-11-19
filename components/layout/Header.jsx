import React from 'react';
import Avatar from 'avataaars';
import Link from 'next/link';

const Header = ({ avatarId, handleLogout }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-900">
      <h1 className="text-xl font-bold">JCV*</h1>
      <nav className="flex items-center">
        {avatarId ? (
          <>
            <Avatar
              style={{ width: '40px', height: '40px' }}
              avatarStyle='Circle'
              {...avatarId}
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
      </nav>
    </header>
  );
};

export default Header;