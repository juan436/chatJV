// app/verify/page.jsx
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-center mb-6 text-white">Cuenta verificada</h1>
                <p className="text-center text-gray-400">Serás redirigido a la página principal en breve.</p>
                <div className="mt-4 text-center">
                    <a href="/" className="text-blue-400 hover:text-blue-300">
                        Ir a la página principal ahora
                    </a>
                </div>
            </div>
        </div>
    );
}