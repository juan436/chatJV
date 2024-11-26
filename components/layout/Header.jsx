import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-900">
      <nav className="flex items-center">
        <h1 className="text-xl font-bold">JCV*</h1>
      </nav>
      <div className="flex items-center">
        <Link href="/auth/signup" className="mr-4 text-blue-400 hover:text-blue-300">
          Regístrate
        </Link>
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
          Iniciar Sesión
        </Link>
      </div>
    </header>
  );
};

export default Header;