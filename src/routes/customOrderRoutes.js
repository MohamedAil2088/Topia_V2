const express = require('express');
const router = express.Router();
const {
    createCustomOrder,
    getAllCustomOrders,
    getMyCustomOrders,
    getCustomOrderById,
    updateCustomOrderStatus,
    addAdminNotes,
    cancelCustomOrder,
    getCustomOrderStats,
    uploadDesignImages
} = require('../controllers/customOrderController');
const { protect, admin } = require('../middleware/auth');
const { uploadCustomDesign } = require('../middleware/uploadCustomDesign');

// Upload endpoint (يجب أن يكون قبل إنشاء الطلب)
router.post('/upload-images',
    protect,
    uploadCustomDesign.array('designImages', 5),  // max 5 images
    uploadDesignImages
);

// User routes
router.route('/')
    .post(protect, createCustomOrder);  // إنشاء طلب

router.route('/my-orders')
    .get(protect, getMyCustomOrders);  // طلباتي

router.route('/:id')
    .get(protect, getCustomOrderById);  // عرض طلب واحد

router.route('/:id/cancel')
    .put(protect, cancelCustomOrder);  // إلغاء طلب

// Admin routes
router.route('/admin/all')
    .get(protect, admin, getAllCustomOrders);  // جميع الطلبات

router.route('/admin/stats')
    .get(protect, admin, getCustomOrderStats);  // الإحصائيات

router.route('/:id/status')
    .put(protect, admin, updateCustomOrderStatus);  // تحديث الحالة

router.route('/:id/admin-notes')
    .put(protect, admin, addAdminNotes);  // إضافة ملاحظات

module.exports = router;
