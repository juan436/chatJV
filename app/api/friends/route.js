import Friends from '@/models/Friends';
import { db } from '@/database';

export async function GET(req) {
    await db.connect();

    try {
        const { searchParams } = new URL(req.url);
        const senderId = searchParams.get('senderId');
        const isVerified = searchParams.get('isVerified');

        if (!senderId) {
            return new Response(JSON.stringify({ 
                message: 'ID del emisor no proporcionado', 
                variant: 'error' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let query = { sender: senderId };

        if (isVerified !== null) {
            query.isVerified = isVerified === 'true';
        }

        const friendRequests = await Friends.find(query).populate('receiver', 'username avatar');

        return new Response(JSON.stringify(friendRequests), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            message: 'Error al obtener solicitudes de amistad', 
            error: error.message, 
            variant: 'error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}