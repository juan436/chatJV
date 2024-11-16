'use client'
import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import asApi from '@/apiAxios/asApi';
import { useSnackMessages } from '@/hooks/useSnackMessage';
import FormLogin from '@/components/form/FormLogin';

function LoginPage() {
    const reactHookForm = useForm();
    const { msgMostrar } = useSnackMessages();
    const router = useRouter();

    const onSubmit = async (form) => {
        try {
            const { data } = await asApi({
                url: '/auth/login',
                method: 'POST',
                data: form
            });

            if (!data.message) throw new Error('Error durante el proceso, vuelva a intentarlo');

            console.log(data.message);
            msgMostrar(data.message, 'success');

            //token en localStorage
            localStorage.setItem('authToken', data.token);
            
            router.push('/');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error durante el proceso, vuelva a intentarlo';
            console.error('Error en la solicitud:', errorMessage);
            msgMostrar('Error en la solicitud: ' + errorMessage, 'error');
        }
    };

    return (
        <FormLogin reactHookForm={reactHookForm} onSubmit={onSubmit} />
    );
}

export default LoginPage;