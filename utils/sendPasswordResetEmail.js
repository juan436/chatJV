import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const sendPasswordResetEmail = async (user) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Restablece tu contraseña',
        text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
};

export default sendPasswordResetEmail;