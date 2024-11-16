import asApi from '@/apiAxios/asApi';
import { useSnackMessages } from '@/hooks/useSnackMessage';

const useSubmit = (reset) => {
    const { msgMostrar } = useSnackMessages();

    const onSubmit = async (form) => {
        console.log('Formulario enviado:', form);

        if (form.password !== form.confirmarPassword) {
            console.error('Las contraseñas no coinciden');
            msgMostrar('Las contraseñas no coinciden', 'error');
            return;
        }

        const { confirmarPassword, ...userData } = form;

        try {
            const { data } = await asApi.post('/auth/signup', userData); 

            if (!data.message) throw new Error('Error durante el proceso, vuelva a intentarlo');

            console.log(data.message);
            msgMostrar(data.message, 'success');
            reset();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error durante el proceso, vuelva a intentarlo';
            console.error('Error en la solicitud:', errorMessage);
            msgMostrar('Error en la solicitud: ' + errorMessage, 'error');
        }
    };

    return { onSubmit };
};

export default useSubmit;