const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Remove old SMTP config if exists
envContent = envContent.replace(/\n# Email Configuration[\s\S]*?FROM_EMAIL=.*$/gm, '');

// Add new SMTP configuration
const smtpConfig = `
# Email Configuration for Gmail
SMTP_SERVICE=gmail
SMTP_EMAIL=mohamed1414148@gmail.com
SMTP_PASSWORD=ffacnnywrhamdnfe
FROM_NAME=Topia Store
FROM_EMAIL=mohamed1414148@gmail.com
`;

fs.writeFileSync(envPath, envContent + smtpConfig);
console.log('✅ Gmail SMTP configured successfully!');
console.log('📧 Emails will now be sent to real Gmail addresses!');
