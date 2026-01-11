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

// 2. إعداد Multer (استخدام الذاكرة بدلاً من القرص)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // حد أقصى 5 ميجا للصورة
});

// دالة مساعدة لرفع الـ Buffer إلى Cloudinary
const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'topia-store',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.Readable.from(buffer).pipe(uploadStream);
    });
};

// 3. مسار الرفع
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('Start uploading to Cloudinary...');

        // رفع الملف من الذاكرة لـ Cloudinary
        const result = await uploadFromBuffer(req.file.buffer);

        console.log('Upload success:', result.secure_url);

        // الرد بنفس الصيغة اللي ال frontend متعود عليها
        res.json({
            message: 'Image uploaded successfully',
            success: true,
            url: result.secure_url,     // الرابط الآمن
            imagePath: result.secure_url, // للتوافق
            filename: result.public_id
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

module.exports = router;
