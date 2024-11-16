import { User } from '@/models';
import { db } from '@/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    const { token, newPassword } = await req.json();
    await db.connect();

    try {
        // Verifica el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Busca al usuario por ID
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

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return new Response(JSON.stringify({ 
            message: 'Contraseña restablecida exitosamente', 
            variant: 'success' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            message: 'Error al restablecer la contraseña', 
            error: error.message, 
            variant: 'error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}