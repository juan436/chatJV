import React from 'react';
import Link from 'next/link';

export const FormForgotPassword = ({ reactHookForm, onSubmit }) => {
    const { register, handleSubmit } = reactHookForm;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8">
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <h2 className="text-2xl font-bold text-center mb-6 text-white">Recuperar Contraseña</h2>
                    <p className="text-gray-400 text-center mb-4">
                        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                    </p>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                            {...register('email')}
                            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800">
                        Enviar Instrucciones
                    </button>
                </form>
                <div className="mt-4 text-center text-gray-400">
                    <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};