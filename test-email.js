require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log("--- Email Configuration Debugger ---");

    // Resolve credentials using the same logic as your app
    const emailUser = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const emailPass = process.env.SMTP_PASSWORD || process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
    const emailService = process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE || 'gmail';

    console.log(`User: ${emailUser}`);
    console.log(`Pass Length: ${emailPass ? emailPass.length : 'MISSING'}`);
    console.log(`Service: ${emailService}`);

    if (!emailUser || !emailPass) {
        console.log("❌ ERROR: Missing email or password in .env file");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: emailService,
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        console.log("\n📡 Verifying SMTP connection...");
        await transporter.verify();
        console.log("✅ Connection Successful! Credentials are correct.");

        console.log("\n📨 Sending test email to yourself...");
        const info = await transporter.sendMail({
            from: `"Topia Debugger" <${emailUser}>`,
            to: emailUser, // Sending to self to test
            subject: "Topia Email Test 🚀",
            html: "<h1>It Works!</h1><p>Your email configuration is correct.</p>"
        });

        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);

    } catch (error) {
        console.log("\n❌ EMAIL FAILED TO SEND ❌");
        console.log("Error Code:", error.code);
        console.log("Error Message:", error.message);

        if (error.response) {
            console.log("Server Response:", error.response);
        }
    }
};

testEmail();
