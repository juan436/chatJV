// app/api/test/route.js
export async function GET(request) {
    return new Response(JSON.stringify({ message: 'API funcionando' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(request) {
    // Aquí puedes manejar las solicitudes POST
    return new Response(JSON.stringify({ message: 'Solicitud POST recibida' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}