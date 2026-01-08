const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Read current .env
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if SMTP settings already exist
if (!envContent.includes('SMTP_SERVICE')) {
    console.log('📝 Adding SMTP configuration to .env...');

    const smtpConfig = `
# Email Configuration
SMTP_SERVICE=gmail
SMTP_EMAIL=mohamed1414148@gmail.com
SMTP_PASSWORD=YOUR_APP_PASSWORD_HERE
FROM_NAME=Topia Store
FROM_EMAIL=mohamed1414148@gmail.com
`;

    // Append to .env
    fs.appendFileSync(envPath, smtpConfig);
    console.log('✅ SMTP configuration added!');
    console.log('\n⚠️  IMPORTANT: You need to replace YOUR_APP_PASSWORD_HERE with your actual Gmail App Password!');
    console.log('📧 Get it from: https://myaccount.google.com/apppasswords');
} else {
    console.log('ℹ️  SMTP configuration already exists in .env');
}
