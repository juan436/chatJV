import Friends from '@/models/Friends';
import { db } from '@/database';

export async function GET(req) {
    await db.connect();

    try {
        const { searchParams } = new URL(req.url);
        const receiverId = searchParams.get('receiverId');
        const userId = searchParams.get('userId');
        const isVerified = searchParams.get('isVerified');

        let query = {};

        if (userId && isVerified === 'true') {
            query = {
                $or: [
                    { sender: userId },
                    { receiver: userId }
                ],
                isVerified: true
            };

            const friendRequests = await Friends.find(query)
                .populate('sender', 'username avatar')
                .populate('receiver', 'username avatar');

            const filteredFriends = friendRequests.map(friend => {
                if (friend.sender._id.toString() === userId) {
                    return friend.receiver;
                } else {
                    return friend.sender;
                }
            });

            return new Response(JSON.stringify(filteredFriends), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else if (receiverId) {
            query = { receiver: receiverId };
            if (isVerified !== null) {
                query.isVerified = isVerified === 'true';
            }

            const friendRequests = await Friends.find(query)
                .populate('sender', 'username avatar')
                .populate('receiver', 'username avatar');

            return new Response(JSON.stringify(friendRequests), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify({
                message: 'ID del receptor o usuario no proporcionado',
                variant: 'error'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
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

export async function POST(req) {
    await db.connect();

    try {
        const { senderId, receiverId } = await req.json();

        if (!senderId || !receiverId) {
            return new Response(JSON.stringify({
                message: 'ID del emisor o receptor no proporcionado',
                variant: 'error'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const newRequest = new Friends({
            sender: senderId,
            receiver: receiverId,
            isVerified: false,
        });

        await newRequest.save();

        return new Response(JSON.stringify(newRequest), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            message: 'Error al crear la solicitud de amistad',
            error: error.message,
            variant: 'error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function PATCH(req) {
    await db.connect();

    try {
        const { senderId, receiverId } = await req.json();

        if (!senderId || !receiverId) {
            return new Response(JSON.stringify({
                message: 'Datos incompletos proporcionados',
                variant: 'error'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updatedRequest = await Friends.findOneAndUpdate(
            { sender: senderId, receiver: receiverId },
            { isVerified: true },
            { new: true }
        );

        if (!updatedRequest) {
            return new Response(JSON.stringify({
                message: 'Solicitud no encontrada',
                variant: 'error'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(updatedRequest), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({
            message: 'Error al actualizar la solicitud de amistad',
            error: error.message,
            variant: 'error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}