'use client'
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';

function DashboardPage() {
  const [avatarId, setAvatarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/auth/login');
    } else {
      try {
        const decoded = jwt.decode(token);
        setAvatarId(decoded.avatarId);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const handlePopState = () => {
      router.replace('/dashboard');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAvatarId(null);
    router.replace('/auth/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">Cargando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Header avatarId={avatarId} handleLogout={handleLogout} />
      <main className="flex flex-1 justify-center items-center">
        <h2 className="text-2xl font-bold">Page Admin</h2>
      </main>
    </div>
  );
}

export default DashboardPage;