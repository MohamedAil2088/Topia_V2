const multer = require('multer');
const path = require('path');

// Check if running in serverless environment
const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

let storage;

if (isServerless) {
    // Use memory storage for serverless (Vercel/Netlify)
    storage = multer.memoryStorage();
    console.log("📦 Using memory storage for custom designs (Serverless mode)");
} else {
    // Use disk storage for local development
    const fs = require('fs');
    let uploadDir = path.join(__dirname, '../../uploads/custom-designs');

    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    } catch (error) {
        console.log("⚠️ Upload directory creation failed, falling back to /tmp");
        uploadDir = '/tmp/custom-designs';
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        } catch (e) {
            console.error("❌ Could not create /tmp upload dir:", e);
        }
    }

    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
}

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
