require('dotenv').config({ path: './production.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('User:', process.env.MAIL_USER);
    console.log('Pass length:', process.env.MAIL_PASS ? process.env.MAIL_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    try {
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: process.env.MAIL_USER, // Send to self
            subject: 'Test Email from RideX Debugger',
            text: 'If you receive this, your email credentials are working correctly!'
        });
        console.log('SUCCESS: Email sent!', info.messageId);
    } catch (error) {
        console.error('FAILURE: Could not send email.');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.response) console.error('Server Response:', error.response);
    }
}

testEmail();
