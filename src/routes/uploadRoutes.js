const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// 🔒 HARDCODED CONFIGURATION (Temporary Fix for Vercel)
// We are putting credentials directly here because Vercel env vars are failing
const CLOUDINARY_CONFIG = {
    cloud_name: 'dmujfkut1',
    api_key: '774152193843247',
    api_secret: 'mEkpjoinKZoL1mjnlj_psacHECc'
};

cloudinary.config(CLOUDINARY_CONFIG);

// Use Memory Storage for Vercel
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Debug Route
router.get('/test', (req, res) => {
    res.json({
        status: 'Online',
        config_source: 'Hardcoded',
        cloud_name: CLOUDINARY_CONFIG.cloud_name,
        can_upload: true
    });
});

// Upload Route
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`[Upload] Starting: ${req.file.originalname}`);

        // Upload Stream
        const uploadFromBuffer = (buffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'topia-store',
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.Readable.from(buffer).pipe(uploadStream);
            });
        };

        const result = await uploadFromBuffer(req.file.buffer);

        console.log('[Upload] Success:', result.secure_url);

        res.json({
            success: true,
            message: 'Uploaded!',
            url: result.secure_url,
            imagePath: result.secure_url,
            filename: result.public_id
        });

    } catch (error) {
        console.error('[Upload Failed]:', error);
        res.status(500).json({
            message: 'Upload failed',
            error: error.message
        });
    }
});

module.exports = router;
