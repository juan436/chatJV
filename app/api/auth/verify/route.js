// app/api/auth/verify/route.js
import { User } from '@/models';
import jwt from 'jsonwebtoken';
import { db } from '@/database';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await db.connect();

        const user = await User.findById(decoded.userId);

        if (!user) {
            return new Response('Usuario no encontrado', { status: 404 });
        }

        if (user.isVerified) {
            return new Response('El correo ya ha sido verificado', { status: 400 });
        }

        user.isVerified = true;
        await user.save();

        return new Response(null, {
            status: 302,
            headers: { Location: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify` },
        });
    } catch (error) {
        return new Response('Token inválido o expirado', { status: 400 });
    }
}