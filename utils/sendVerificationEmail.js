import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const sendVerificationEmail = async (user) => {
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
        subject: 'Verifica tu correo electrónico',
        text: `Haz clic en el siguiente enlace para verificar tu correo: ${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;