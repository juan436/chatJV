import { useRouter } from 'next/navigation';
import asApi from '@/apiAxios/asApi';
import { useSnackMessages } from '@/hooks/useSnackMessage';

const useSubmit = (reset) => {
    const { msgMostrar } = useSnackMessages();
    const router = useRouter();

    const onSubmit = async (form) => {
        if (form.password !== form.confirmarPassword) {
            msgMostrar('Las contraseñas no coinciden', 'error');
            return;
        }

        const { confirmarPassword, ...userData } = form;

        try {
            const { data } = await asApi.post('/auth/signup', userData); 

            if (!data.message || !data.userId) throw new Error('Error durante el proceso, vuelva a intentarlo');

            msgMostrar(data.message, 'success');
            reset();
            router.push(`/auth/select-avatar?userId=${data.userId}`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error durante el proceso, vuelva a intentarlo';
            msgMostrar('Error en la solicitud: ' + errorMessage, 'error');
        }
    };

    return { onSubmit };
};

export default useSubmit;