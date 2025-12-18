const emailService = require('./services/emailService');
require('dotenv').config();

async function testEmail() {
    console.log('📧 Testing Email Sending...');
    console.log(`User: ${process.env.MAIL_USER}`);

    // Check if password exists (don't print it)
    if (!process.env.MAIL_PASS) {
        console.error('❌ MAIL_PASS is missing in .env');
        return;
    }

    const testDest = 'gravyanti@gmail.com'; // Send to requested address
    const token = 'test-token-123';

    console.log(`Sending test email to ${testDest}...`);

    const result = await emailService.sendVerificationEmail(testDest, token);

    if (result) {
        console.log('✅ Email sent successfully!');
    } else {
        console.error('❌ Email failed to send. Check console for details.');
    }
}

testEmail();
