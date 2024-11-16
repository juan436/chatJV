import { User } from '@/models';
import { db } from '@/database';
import sendPasswordResetEmail from '@/utils/sendPasswordResetEmail';

export async function POST(req) {
    const { email } = await req.json();
    await db.connect();

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return new Response(JSON.stringify({ 
                message: 'Usuario no encontrado', 
                variant: 'error' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await sendPasswordResetEmail(user);

        return new Response(JSON.stringify({ 
            message: 'Instrucciones para restablecer la contraseña enviadas al correo electrónico', 
            variant: 'success' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            message: 'Error al procesar la solicitud', 
            error: error.message, 
            variant: 'error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}