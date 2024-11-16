import { User } from '@/models';
import { db } from '@/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    const { email, password } = await req.json();
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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ 
                message: 'Contraseña incorrecta', 
                variant: 'error' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return new Response(JSON.stringify({ 
            message: 'Inicio de sesión exitoso', 
            token, 
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