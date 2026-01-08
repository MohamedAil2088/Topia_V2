const express = require('express');
const { register, login, checkEmail, forgotPassword, verifyCode, resetPassword, googleLogin } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validation');

const router = express.Router();
console.log('🔓 Auth Routes Loaded');

console.log('🔓 Auth Routes File Loading...');
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/check-email', checkEmail);
router.post('/forgot-password', (req, res, next) => {
    console.log('📩 Forgot Password Hit!');
    forgotPassword(req, res, next);
});
router.post('/verify-code', verifyCode);
router.put('/reset-password', resetPassword);
router.post('/google', googleLogin);

// 🔥 EMERGENCY FIX ROUTE (Temp)
router.get('/emergency-fix', async (req, res) => {
    try {
        const User = require('../models/User');
        const bcrypt = require('bcryptjs'); // Ensure bcrypt is used

        // 1. Delete Admin
        await User.deleteMany({ email: 'admin@topia.com' });

        // 2. Create Admin (Let pre-save hook handle hashing)
        const admin = new User({
            name: 'Admin',
            email: 'admin@topia.com',
            password: 'admin123',
            role: 'admin',
            isEmailVerified: true
        });

        await admin.save(); // pre('save') will hash 'admin123'

        console.log('✅ Admin recreated via Emergency Route');

        res.json({
            success: true,
            message: 'Admin recreated successfully!',
            credentials: {
                email: 'admin@topia.com',
                password: 'admin123'
            }
        });
    } catch (error) {
        console.error('❌ Emergency fix failed:', error);
        res.status(500).json({ error: error.message });
    }
});

console.log('✅ Auth Routes Registered');

module.exports = router;
