require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('🔄 جاري اختبار إعدادات الإيميل...');
    console.log(`📧 المستخدم: ${process.env.EMAIL_USER}`);

    // إعداد الناقل
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });

    try {
        // التحقق من الاتصال
        await transporter.verify();
        console.log('✅ الاتصال بـ Gmail نجح!');

        // إرسال إيميل تجريبي
        const info = await transporter.sendMail({
            from: `"TOPIA Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // هيبعت لنفس الإيميل
            subject: '🚀 TOPIA Email Test Succeeded!',
            text: 'This is a test email to confirm that your SMTP settings are working correctly.',
            html: `
                <div style="font-family: Arial; padding: 20px; background: #f0fdf4; border-radius: 10px;">
                    <h2 style="color: #166534;">🎉 Congratulations!</h2>
                    <p>Your email configuration is working perfectly.</p>
                    <p><strong>App Password:</strong> Works!</p>
                    <p>You can now receive contact form messages and order notifications.</p>
                </div>
            `
        });

        console.log('✅ تم إرسال إيميل الاختبار بنجاح!');
        console.log('🆔 Message ID:', info.messageId);
        console.log('-----------------------------------');
        console.log('💡 دلوقتي لازم تعمل Restart للـ Backend عشان التغييرات تشتغل في الموقع.');
    } catch (error) {
        console.error('❌ فشل الاختبار:');
        console.error(error);
    }
};

testEmail();
