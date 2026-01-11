const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

const router = express.Router();

// Configure Cloudinary
// Using direct config as Vercel env vars are not being read properly
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmujfkut1',
    api_key: process.env.CLOUDINARY_API_KEY || '774152193843247',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mEkpjoinKZoL1mjnlj_psacHECc',
});

// Use Memory Storage for Serverless (Vercel/Netlify)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Debug/Test Route
router.get('/test', (req, res) => {
    res.json({
        status: 'Online',
        cloudinary_configured: true,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmujfkut1 (fallback)',
        env: process.env.NODE_ENV || 'development'
    });
});

// Upload Route
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`[Upload] Processing: ${req.file.originalname}`);

        // Upload to Cloudinary using stream
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
            message: 'Image uploaded successfully',
            url: result.secure_url,
            imagePath: result.secure_url,
            filename: result.public_id
        });

    } catch (error) {
        console.error('[Upload Error]:', error);
        res.status(500).json({
            message: 'Upload failed',
            error: error.message
        });
    }
});

module.exports = router;
