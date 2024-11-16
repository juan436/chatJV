'use client'
import React from 'react';
import { useForm } from 'react-hook-form';
import asApi from '@/apiAxios/asApi';
import { useSnackMessages } from '@/hooks/useSnackMessage';
import { FormForgotPassword } from '@/components/form';

function ForgotPasswordPage() {
    const reactHookForm = useForm();
    const { msgMostrar } = useSnackMessages();

    const onSubmit = async (form) => {
        try {
            const { data } = await asApi({
                url: '/auth/forgot-password',
                method: 'POST',
                data: form
            });

            if (!data.message) throw new Error('Error durante el proceso, vuelva a intentarlo');

            console.log(data.message);
            msgMostrar(data.message, 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error durante el proceso, vuelva a intentarlo';
            console.error('Error en la solicitud:', errorMessage);
            msgMostrar('Error en la solicitud: ' + errorMessage, 'error');
        }
    };

    return (
        <FormForgotPassword reactHookForm={reactHookForm} onSubmit={onSubmit} />
    );
}

export default ForgotPasswordPage;