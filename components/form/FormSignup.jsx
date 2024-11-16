import React, { useState } from 'react';
import Link from 'next/link';
import CircularProgress from '@mui/material/CircularProgress';

export const FormSignup = ({ reactHookForm, onSubmit }) => {
    const { register, handleSubmit } = reactHookForm;
    const [loading, setLoading] = useState(false);

    const handleFormSubmit = async (data) => {
        setLoading(true);
        await onSubmit(data);
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8">
                <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
                    <h2 className="text-2xl font-bold text-center mb-6 text-white">Registro</h2>
                    <div>
                        <input
                            type="text"
                            {...register('username')} 
                            placeholder="Nombre"
                            required
                            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            {...register('email')}
                            placeholder="Email"
                            required
                            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            {...register('password')}
                            placeholder="Contraseña"
                            required
                            minLength="8"
                            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            {...register('confirmarPassword')}
                            placeholder="Confirmar Contraseña"
                            required
                            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800" disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
                    </button>
                </form>
                <div className="mt-4 text-center text-gray-400">
                    ¿Ya estás registrado?{' '}
                    <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                        Ingresa
                    </Link>
                </div>
            </div>
        </div>
    );
};