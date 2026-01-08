const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

const cleanContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://admin:TopiaSecretPass2025@cluster0.vnkludj.mongodb.net/topia-ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=topia-super-secret-jwt-key-2024-change-in-production
FRONTEND_URL=http://localhost:5173

# Email Settings
EMAIL_SERVICE=gmail
EMAIL_USER=mohamed1414148@gmail.com
# The correct App Password (16 chars)
EMAIL_APP_PASSWORD=vgatuvteepydkkua

# Aliases for compatibility
EMAIL_PASSWORD=vgatuvteepydkkua
EMAIL_PASS=vgatuvteepydkkua
SMTP_EMAIL=mohamed1414148@gmail.com
SMTP_PASSWORD=vgatuvteepydkkua
`;

try {
    fs.writeFileSync(envPath, cleanContent, 'utf8');
    console.log("✅ .env file successfully overwritten with CLEAN content!");
} catch (err) {
    console.error("❌ Failed to write .env:", err);
}
