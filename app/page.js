'use client'
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <main className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-center gap-12">
        
        <div className="flex-1 max-w-xl text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Bienvenidos a JVChat
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Tu plataforma web confiable para chatear con tus amigos y familiares en tiempo real desde cualquier parte del mundo.
          </p>
        </div>

        <div className="flex-1 max-w-md w-full">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl text-white font-semibold mb-6 text-center">
              Únete a JVChat Chat hoy
            </h2>
            <div className="space-y-4">
              <Link
                href="/auth/signup"
                className="w-full block text-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Crear cuenta nueva
              </Link>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">o</span>
                </div>
              </div>
              <Link
                href="/auth/login"
                className="w-full block text-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default HomePage;