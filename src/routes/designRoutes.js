const express = require('express');
const router = express.Router();
const {
    createDesign,
    getAllDesigns,
    getDesignById,
    updateDesign,
    deleteDesign,
    getDesignStats
} = require('../controllers/designController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/uploadDesign');

// Public routes
router.get('/', getAllDesigns);
router.get('/:id', getDesignById);

// Admin routes
router.post('/', protect, admin, upload.single('image'), createDesign);
router.put('/:id', protect, admin, upload.single('image'), updateDesign);
router.delete('/:id', protect, admin, deleteDesign);
router.get('/admin/stats', protect, admin, getDesignStats);

module.exports = router;
