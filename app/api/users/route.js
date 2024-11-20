import { User } from '@/models';
import { db } from '@/database';

export async function GET(req) {
    await db.connect();

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('id');

        console.log("a ver que hay aqui ",userId);
        // Encuentra todos los usuarios excepto el que coincide con el ID proporcionado
        const users = await User.find({ _id: { $ne: userId } }).select([
            "email",
            "username",
            "avatar",
            "_id",
        ]);

        return new Response(JSON.stringify(users), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            message: 'Error al obtener usuarios', 
            error: error.message, 
            variant: 'error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}