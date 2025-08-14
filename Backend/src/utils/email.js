import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'exampleemail@gmail.com', 
        pass: 'examplepass',   
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Error: ', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

export const sendVerificationEmail = async (email, token) => {
    const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking on the following link: ${verificationLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};
