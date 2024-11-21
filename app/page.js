'use client'
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';

function HomePage() {
  const [avatarId, setAvatarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    document.title = "JVS";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setAvatarId(decoded.avatarId);
        router.replace('/dashboard');
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAvatarId(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">Cargando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Header avatarId={avatarId} handleLogout={handleLogout} />
      <main className="flex flex-1 justify-center items-center">
        {!avatarId && (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Bienvenidos a JCV</h2>
            <p className="mt-4">Por favor, regístrate o inicia sesión para continuar.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;