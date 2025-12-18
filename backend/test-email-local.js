const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../production.env') });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing email configuration from BACKEND folder...');
    console.log('User:', process.env.MAIL_USER);
    // Mask password for security in logs
    const pass = process.env.MAIL_PASS || '';
    console.log('Pass length:', pass.length);
    console.log('Pass check:', pass ? '******' : 'MISSING');

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.error('ERROR: Missing MAIL_USER or MAIL_PASS in production.env');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    try {
        console.log('Attempting to send email verify to: ' + process.env.MAIL_USER);
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: process.env.MAIL_USER,
            subject: 'RideX Email Configuration Test',
            text: 'Success! Your email configuration is valid.'
        });
        console.log('SUCCESS: Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('FAILURE: Email sending failed.');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Server Response:', error.response);
        }
    }
}

testEmail();
