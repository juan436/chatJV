import { db } from '@/database';
import Message from '@/models/Messages';

export async function GET(req) {
    await db.connect();

    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      if (!userId) throw new Error('userId no proporcionado');

      const messages = await Message.find({
        users: userId,
      }).sort({ createdAt: 1 });

      return new Response(JSON.stringify(messages), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        message: 'Error al obtener mensajes', 
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
    const { from, to, text } = await req.json();
    const newMessage = await Message.create({
      message: { text },
      users: [from, to],
      sender: from,
    });

    return new Response(JSON.stringify({ 
      message: 'Mensaje agregado exitosamente', 
      data: newMessage 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      message: 'Error al agregar mensaje', 
      error: error.message, 
      variant: 'error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}