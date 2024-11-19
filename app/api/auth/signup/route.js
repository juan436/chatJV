import { User } from '@/models';
import { db } from '@/database';
import bcrypt from 'bcryptjs';
import sendVerificationEmail from '@/utils/sendVerificationEmail';

export async function POST(req) {
    const { username, email, password } = await req.json();
    await db.connect();
    try {
        // Verificar si el correo electrónico ya existe
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return new Response(JSON.stringify({ 
                message: 'El correo electrónico ya está en uso.', 
                variant: 'error' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Verificar si el nombre de usuario ya existe
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return new Response(JSON.stringify({ 
                message: 'El nombre de usuario ya está en uso.', 
                variant: 'error' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Crear el nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            isVerified: false
        });

        await sendVerificationEmail(user);

        return new Response(JSON.stringify({ 
            message: 'Usuario creado exitosamente. Verifica tu correo electrónico.', 
            userId: user._id,
            variant: 'success' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            message: 'Error al crear el usuario', 
            error: error.message, 
            variant: 'error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}