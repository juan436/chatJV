"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Avatar from 'avataaars';
import asApi from '@/apiAxios/asApi';

const SelectAvatar = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const id = searchParams.get('userId');
        if (id) {
            setUserId(id);
            console.log('User ID:', id);
        } else {
            console.error('User ID no encontrado');
        }
    }, [searchParams]);

    const avatars = [
        { id: 'avatar1', topType: 'ShortHairDreads01', accessoriesType: 'Blank', hairColor: 'BrownDark', facialHairType: 'Blank', clotheType: 'Hoodie', clotheColor: 'PastelBlue', eyeType: 'Happy', eyebrowType: 'Default', mouthType: 'Smile', skinColor: 'Light' },
        { id: 'avatar2', topType: 'LongHairStraight', accessoriesType: 'Kurt', hairColor: 'Blonde', facialHairType: 'Blank', clotheType: 'BlazerShirt', clotheColor: 'Black', eyeType: 'Wink', eyebrowType: 'RaisedExcited', mouthType: 'Twinkle', skinColor: 'Pale' },
        { id: 'avatar3', topType: 'Hat', accessoriesType: 'Prescription01', hairColor: 'Black', facialHairType: 'BeardLight', clotheType: 'GraphicShirt', clotheColor: 'Red', eyeType: 'Squint', eyebrowType: 'FlatNatural', mouthType: 'Serious', skinColor: 'Brown' },
        { id: 'avatar4', topType: 'Hijab', accessoriesType: 'Round', hairColor: 'Auburn', facialHairType: 'Blank', clotheType: 'Overall', clotheColor: 'Blue02', eyeType: 'Surprised', eyebrowType: 'UpDown', mouthType: 'Smile', skinColor: 'DarkBrown' },
        { id: 'avatar5', topType: 'LongHairCurly', accessoriesType: 'Sunglasses', hairColor: 'Red', facialHairType: 'Blank', clotheType: 'ShirtCrewNeck', clotheColor: 'Gray02', eyeType: 'WinkWacky', eyebrowType: 'RaisedExcitedNatural', mouthType: 'Disbelief', skinColor: 'Light' },
        { id: 'avatar6', topType: 'ShortHairShortFlat', accessoriesType: 'Wayfarers', hairColor: 'BlondeGolden', facialHairType: 'MoustacheFancy', clotheType: 'BlazerSweater', clotheColor: 'PastelGreen', eyeType: 'Close', eyebrowType: 'Angry', mouthType: 'Grimace', skinColor: 'Yellow' }
    ];

    const handleSelect = async (avatar) => {
        if (!userId) {
            console.error('User ID no disponible');
            return;
        }
    
        setSelectedAvatar(avatar);
        setLoading(true);
    
        try {
            const response = await asApi.post('/auth/select-avatar', { userId, avatarId: avatar.id });
            console.log('Avatar actualizado:', response.data.message);
            setSuccess(true);
            setTimeout(() => {
                router.replace('/');
            }, 2000);
        } catch (error) {
            console.error('Error al actualizar el avatar:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-800">
            {loading && (
                <div className="absolute inset-0 flex justify-center items-center">
                    <div className="loader"></div>
                </div>
            )}
            <div className="text-center px-4">
                <h2 className="text-2xl font-bold mb-6 text-white">Selecciona un Avatar</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {avatars.map((avatar, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelect(avatar)}
                            className={`cursor-pointer transition-transform transform hover:scale-110 ${
                                selectedAvatar === avatar ? 'ring-4 ring-blue-500' : ''
                            }`}
                        >
                            <Avatar
                                style={{ width: '80px', height: '80px' }}
                                avatarStyle='Circle'
                                {...avatar}
                            />
                        </div>
                    ))}
                </div>
                {success && (
                    <div className="mt-4 text-green-500 flex justify-center items-center">
                        <span>¡Avatar agregado exitosamente!</span>
                        <span className="ml-2 animate-spin">🔄</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectAvatar;