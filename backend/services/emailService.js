const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    // Add debug options
    debug: true, // show debug output
    logger: true // log information in console
});

exports.sendWelcomeEmail = async (toEmail, name, password) => {
    try {
        const mailOptions = {
            from: `"RideX Team" <${process.env.MAIL_USER}>`,
            to: toEmail,
            subject: 'Welcome to RideX - Registration Successful',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #FACC15;">Welcome to RideX, ${name}!</h2>
                    <p>Thank you for registering with us.</p>
                    <p>Your account has been created successfully.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Your Login Credentials:</p>
                        <p style="margin: 5px 0;">Email: <strong>${toEmail}</strong></p>
                        <p style="margin: 5px 0;">Password: <strong>${password}</strong></p>
                    </div>

                    <p>Please keep this password safe. You can change it after logging in.</p>
                    <p>Best regards,<br>The RideX Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending welcome email from service:', error);
        return false;
    }
};

exports.sendVerificationEmail = async (toEmail, token) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationLink = `${frontendUrl}/verify?token=${token}`;

        const mailOptions = {
            from: `"RideX Team" <${process.env.MAIL_USER}>`,
            to: toEmail,
            subject: 'Verify Your RideX Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #FACC15;">Verify Your Email</h2>
                    <p>Thank you for registering with RideX. Please verify your email to activate your account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #FACC15; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                    </div>
                     <p>Or click this link: <a href="${verificationLink}">${verificationLink}</a></p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};
