const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Memory Storage for Vercel (Critical for Serverless)
// Vercel functions cannot write to disk typically
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Increased limit to 10MB
});

// Helper to upload buffer to Cloudinary
const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'topia-store',
                resource_type: 'auto', // Auto detect type (image/video/etc)
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.Readable.from(buffer).pipe(uploadStream);
    });
};

// POST Upload Route
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`[Upload] Starting upload for file: ${req.file.originalname}`);

        // Direct upload from memory to Cloudinary
        const result = await uploadFromBuffer(req.file.buffer);

        console.log('[Upload] Success:', result.secure_url);

        res.json({
            message: 'Image uploaded successfully',
            success: true,
            url: result.secure_url,
            imagePath: result.secure_url,
            filename: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
        });

    } catch (error) {
        console.error('[Upload Error]:', error);
        res.status(500).json({
            message: 'Upload failed',
            error: error.message || 'Unknown error'
        });
    }
});

module.exports = router;
