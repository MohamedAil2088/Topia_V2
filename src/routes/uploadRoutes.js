const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// 1. تكوين Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. إعداد Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// 3. مسار اختبار (عشان نتأكد إن الإعدادات واصلة)
router.get('/test', (req, res) => {
    res.json({
        message: 'Upload route is working',
        cloudinary_configured: !!process.env.CLOUDINARY_CLOUD_NAME,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME : 'MISSING',
        env: process.env.NODE_ENV
    });
});

// 4. مسار الرفع
router.post('/', (req, res, next) => {
    // Wrap in a standard handler to catch multer errors
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: 'File upload error', error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        // Check Config First
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            throw new Error('Cloudinary configuration is missing on server');
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`[Upload] Processing file: ${req.file.originalname}`);

        // Upload Stream
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                const streamLoad = cloudinary.uploader.upload_stream(
                    { folder: 'topia-store' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.Readable.from(req.file.buffer).pipe(streamLoad);
            });
        };

        const result = await uploadStream();

        console.log('[Upload] Success:', result.secure_url);

        res.json({
            success: true,
            message: 'Uploaded!',
            url: result.secure_url,
            imagePath: result.secure_url,
            filename: result.public_id
        });

    } catch (error) {
        console.error('[Upload Fatal Error]:', error);
        // Return the ACTUAL error message to the client
        res.status(500).json({
            message: 'Upload failed internal',
            error: error.message,
            details: error // Show full details
        });
    }
});

module.exports = router;
