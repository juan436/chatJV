'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import Avatar from 'avataaars';

function HomePage() {
  const [avatarId, setAvatarId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setAvatarId(decoded.avatarId); // Asegúrate de que el token contenga avatarId
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAvatarId(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">Cargando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-900">
        <h1 className="text-xl font-bold">JCV*</h1>
        <nav className="flex items-center">
          {avatarId ? (
            <>
              <Avatar
                style={{ width: '40px', height: '40px' }}
                avatarStyle='Circle'
                {...avatarId} // Asegúrate de que avatarId contenga las propiedades necesarias
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
      <main className="flex flex-1 justify-center items-center">
        <h2 className="text-2xl font-bold">
          {avatarId ? 'Page Admin' : 'Bienvenidos a JCV'}
        </h2>
      </main>
    </div>
  );
}

export default HomePage;