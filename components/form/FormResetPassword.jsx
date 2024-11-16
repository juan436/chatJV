import React from 'react';

const FormResetPassword = ({ reactHookForm, onSubmit }) => {
    const { register, handleSubmit } = reactHookForm;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8">
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <h2 className="text-2xl font-bold text-center mb-6 text-white">Restablecer Contraseña</h2>
                    <div>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="Nueva Contraseña"
                            required
                            {...register('newPassword')}
                            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            placeholder="Confirmar Nueva Contraseña"
                            required
                            {...register('confirmNewPassword')}
                            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800">
                        Restablecer Contraseña
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormResetPassword;