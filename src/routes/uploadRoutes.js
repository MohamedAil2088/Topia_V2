const path = require('path');
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if running in serverless environment
const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

let upload;

if (isServerless) {
    // Use memory storage for serverless (Netlify/Vercel)
    const memoryStorage = multer.memoryStorage();
    upload = multer({
        storage: memoryStorage,
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    });
} else {
    // Use disk storage for local development
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '../../uploads');

    // Ensure directory exists (only for local)
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const diskStorage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, uploadsDir);
        },
        filename(req, file, cb) {
            cb(
                null,
                `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
            );
        },
    });

    upload = multer({
        storage: diskStorage,
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    });
}

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

// Upload to Cloudinary helper function
const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'topia-store',
                public_id: filename,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (isServerless) {
            // Upload to Cloudinary for serverless
            const filename = `${req.file.fieldname}-${Date.now()}`;
            const result = await uploadToCloudinary(req.file.buffer, filename);

            res.json({
                success: true,
                url: result.secure_url,
                imagePath: result.secure_url,
                filename: result.public_id,
                cloudinary_id: result.public_id
            });
        } else {
            // Return local URL path for development
            const imageUrl = `/uploads/${req.file.filename}`;
            res.json({
                success: true,
                url: imageUrl,
                imagePath: imageUrl,
                filename: req.file.filename
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

module.exports = router;
