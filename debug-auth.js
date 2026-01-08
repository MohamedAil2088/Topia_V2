const mongoose = require('mongoose');

// الرابط الجديد باليوزر اللي عملناه
const uri = "mongodb+srv://admin:TopiaSecretPass2025@cluster0.vnkludj.mongodb.net/topia-ecommerce?retryWrites=true&w=majority&appName=Cluster0";

console.log("... جاري تجربة الاتصال بالمستخدم admin والباسورد TopiaSecretPass2025");

mongoose.connect(uri)
    .then(() => {
        console.log("✅✅✅ نجح الاتصال! الباسورد صح.");
        console.log("المشكلة كانت في ملف .env .. جاري إصلاحه تلقائياً...");

        // إصلاح ملف .env تلقائياً
        const fs = require('fs');
        const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=${uri}
JWT_SECRET=topia-super-secret-jwt-key-2024-change-in-production
EMAIL_USER=mohamed1414148@gmail.com
EMAIL_APP_PASSWORD=grhotgoxyajqtpvrey
FRONTEND_URL=http://localhost:5173`;

        fs.writeFileSync('.env', envContent);
        console.log("✅ تم تحديث ملف .env بنجاح! السيرفر هيشتغل دلوقتي.");
        process.exit(0);
    })
    .catch(err => {
        console.log("❌❌❌ فشل الاتصال! الباسورد غلط.");
        console.log("السبب: ", err.message);
        console.log("من فضلك تأكد إنك عملت المستخدم admin والباسورد TopiaSecretPass2025");
        process.exit(1);
    });
