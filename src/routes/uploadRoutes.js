const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// 1. تكوين Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. إعداد التخزين (مباشرة إلى Cloudinary)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'topia-store', // نفس المجلد اللي استخدمناه في ال migration
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        // يمكنك إضافة transformation هنا لو حابب تضغط الصور مثلاً
        // transformation: [{ width: 1000, crop: "limit" }]
    },
});

const upload = multer({ storage: storage });

// 3. مسار الرفع (لصورة واحدة)
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // الرد بنفس الصيغة اللي ال frontend متعود عليها عشان ميبوظش
        res.json({
            message: 'Image uploaded successfully',
            success: true, // مهم لل frontend الحالي
            url: req.file.path, // Cloudinary URL
            imagePath: req.file.path, // Cloudinary URL (للتوافق)
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

module.exports = router;
