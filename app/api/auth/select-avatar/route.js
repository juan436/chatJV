import { User } from '@/models';
import { db } from '@/database';

export async function POST(req) {
    const { userId, avatarId } = await req.json();
    await db.connect();
    console.log('probando',)
    try {
        const user = await User.findById(userId);

        if (!user) {
            return new Response(JSON.stringify({
                message: 'Usuario no encontrado',
                variant: 'error'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        user.avatar = avatarId;
        await user.save();

        return new Response(JSON.stringify({
            message: 'Avatar actualizado exitosamente',
            variant: 'success'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            message: 'Error al actualizar el avatar',
            error: error.message,
            variant: 'error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}