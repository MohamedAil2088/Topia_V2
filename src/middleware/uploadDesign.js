const multer = require('multer');
const path = require('path');

// Check if running in serverless environment
const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

let storage;

if (isServerless) {
    // Use memory storage for serverless (Vercel/Netlify)
    storage = multer.memoryStorage();
    console.log("📦 Using memory storage for designs (Serverless mode)");
} else {
    // Use disk storage for local development
    const fs = require('fs');
    let uploadsDir = path.join(__dirname, '../../uploads/designs');

    try {
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    } catch (error) {
        console.log("⚠️ Upload directory creation failed, falling back to /tmp");
        uploadsDir = '/tmp/uploads/designs';
        try {
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
        } catch (e) {
            console.error("❌ Could not create /tmp upload dir:", e);
        }
    }

    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
}

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('صيغة الملف غير مدعومة! يرجى رفع صورة (JPG, PNG, GIF, WEBP)'));
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: fileFilter
});

module.exports = upload;
