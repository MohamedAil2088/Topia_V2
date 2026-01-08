const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            console.log(`🔐 Auth Attempt: User ID ${decoded.id} for ${req.method} ${req.originalUrl}`);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.error(`❌ Auth Failed: User ${decoded.id} not found in DB`);
                return res.status(401).json({ success: false, message: 'غير مصرح، المستخدم غير موجود' });
            }

            console.log(`✅ Auth Success: ${req.user.name} (${req.user.email})`);
            next();
        } catch (error) {
            console.error(`❌ Auth Error (${req.originalUrl}):`, error.message);
            return res.status(401).json({ success: false, message: 'غير مصرح، التوكن غير صحيح أو منتهي' });
        }
    } else {
        console.warn(`⚠️ Auth Denied: No Bearer token for ${req.originalUrl}`);
        return res.status(401).json({ success: false, message: 'غير مصرح، لا يوجد توكن' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'غير مصرح، للمشرفين فقط' });
    }
};

const protectOptional = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            console.error('Optional Auth Error:', error.message);
            // Continue as guest if token is invalid
        }
    }
    next();
};

module.exports = { protect, admin, protectOptional };
