const nodemailer = require('nodemailer');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing SMTP Connection...');
    console.log(`👤 User: ${process.env.MAIL_USER}`);

    if (!process.env.MAIL_PASS) {
        console.error('❌ MAIL_PASS is missing!');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        debug: true,
        logger: true
    });

    try {
        // 1. Verify Connection
        console.log('1️⃣ Verifying connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        // 2. Send Test Email
        console.log('2️⃣ Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test Script" <${process.env.MAIL_USER}>`,
            to: 'vvibe4985@gmail.com', // Target email requested by user
            subject: 'Test Email from Server (Explicit Config)',
            text: 'If you see this, the SMTP configuration on port 587 (STARTTLS) is working correctly on DigitalOcean.'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Error:', error);
        if (error.code === 'EAUTH') {
            console.error('👉 Check your email and password. Ensure "Less secure apps" is on OR use an App Password.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('👉 Connection blocked. Check firewall or port 587 availability on DigitalOcean.');
        }
    }
}

testConnection();
