const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if SMTP already configured
if (envContent.includes('SMTP_SERVICE')) {
    console.log('✅ SMTP already configured in .env');
    process.exit(0);
}

const smtpConfig = `
# Email Configuration for Gmail
SMTP_SERVICE=gmail
SMTP_EMAIL=mohamed1414148@gmail.com
SMTP_PASSWORD=PASTE_YOUR_16_CHAR_APP_PASSWORD_HERE
FROM_NAME=Topia Store
FROM_EMAIL=mohamed1414148@gmail.com
`;

fs.appendFileSync(envPath, smtpConfig);
console.log('✅ Added SMTP configuration to .env');
console.log('⚠️  Replace PASTE_YOUR_16_CHAR_APP_PASSWORD_HERE with your actual App Password!');
