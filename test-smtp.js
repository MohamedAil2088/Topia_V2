require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing SMTP Configuration...\n');

// Check if SMTP vars exist
console.log('SMTP_SERVICE:', process.env.SMTP_SERVICE || '❌ NOT SET');
console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL || '❌ NOT SET');
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL || '❌ NOT SET');
console.log('FROM_NAME:', process.env.FROM_NAME || '❌ NOT SET');
console.log('\n---\n');

if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('❌ ERROR: SMTP_EMAIL or SMTP_PASSWORD is missing!');
    console.log('\n📝 Solution:');
    console.log('1. Get App Password from: https://myaccount.google.com/apppasswords');
    console.log('2. Add to .env file:');
    console.log('   SMTP_PASSWORD=your_16_char_password_here');
    process.exit(1);
}

// Test connection
async function testSMTP() {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        console.log('🔄 Testing connection to Gmail SMTP...');
        await transporter.verify();
        console.log('✅ SUCCESS! SMTP connection is working!');
        console.log('📧 You can now send emails from your app.');

    } catch (error) {
        console.log('❌ SMTP Connection FAILED!');
        console.log('\nError:', error.message);
        console.log('\n🔧 Common fixes:');
        console.log('1. Make sure App Password is correct (16 chars, no spaces)');
        console.log('2. Enable "Less secure app access" if needed');
        console.log('3. Check that 2-Step Verification is enabled on Gmail');
    }
}

testSMTP();
