const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إنشاء مجلد uploads إذا لم يكن موجوداً
// إنشاء مجلد uploads إذا لم يكن موجوداً
let uploadDir = 'uploads/custom-designs';

try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (error) {
    console.log("⚠️ Upload directory creation failed (likely read-only fs), falling back to /tmp");
    uploadDir = '/tmp/custom-designs';
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    } catch (e) {
        console.error("❌ Could not create /tmp upload dir:", e);
    }
}

// إعداد التخزين
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // إنشاء اسم فريد للملف
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// فلترة أنواع الملفات المسموحة
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('يُسمح فقط بملفات الصور (JPEG, PNG, GIF) أو PDF'));
    }
};

// Middleware
const uploadCustomDesign = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max per file
    },
    fileFilter: fileFilter
});

module.exports = {
    uploadCustomDesign
};
