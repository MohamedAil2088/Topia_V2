const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create new review
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        req.body.product = req.params.productId;
        req.body.user = req.user._id;

        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
        }

        // التحقق مما إذا كان المستخدم قد قيم المنتج مسبقاً
        const isReviewed = await Review.findOne({
            user: req.user._id,
            product: req.params.productId
        });

        if (isReviewed) {
            return res.status(400).json({ success: false, message: 'لقد قمت بتقييم هذا المنتج مسبقاً' });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        // Public users only see approved and non-hidden reviews
        const reviews = await Review.find({
            product: req.params.productId,
            approved: true,
            hidden: false
        })
            .populate('user', 'name')
            .sort({ featured: -1, createdAt: -1 }); // Featured reviews first

        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get featured reviews (Public)
// @route   GET /api/reviews/featured
// @access  Public
exports.getFeaturedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            featured: true,
            approved: true,
            hidden: false
        })
            .populate('user', 'name')
            .limit(3)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner/Admin)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'التقييم غير موجود' });
        }

        // التأكد من أن المستخدم هو صاحب التقييم أو أدمن
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'غير مصرح لك بحذف هذا التقييم' });
        }

        await review.deleteOne();

        res.json({ success: true, message: 'تم حذف التقييم' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============= ADMIN FUNCTIONS =============

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = 20;
        const filter = req.query.filter || 'all'; // all, approved, unapproved, featured, hidden

        let query = {};

        if (filter === 'approved') query.approved = true;
        if (filter === 'unapproved') query.approved = false;
        if (filter === 'featured') query.featured = true;
        if (filter === 'hidden') query.hidden = true;

        const count = await Review.countDocuments(query);
        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            success: true,
            data: reviews,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/Unapprove review
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'التقييم غير موجود' });
        }

        review.approved = req.body.approved !== undefined ? req.body.approved : true;
        await review.save();

        res.json({
            success: true,
            message: review.approved ? 'تم الموافقة على التقييم' : 'تم إلغاء الموافقة',
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Feature/Unfeature review
// @route   PUT /api/admin/reviews/:id/feature
// @access  Private/Admin
exports.featureReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'التقييم غير موجود' });
        }

        review.featured = req.body.featured !== undefined ? req.body.featured : !review.featured;
        await review.save();

        res.json({
            success: true,
            message: review.featured ? 'تم تمييز التقييم' : 'تم إلغاء التمييز',
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Hide/Unhide review
// @route   PUT /api/admin/reviews/:id/hide
// @access  Private/Admin
exports.hideReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'التقييم غير موجود' });
        }

        review.hidden = req.body.hidden !== undefined ? req.body.hidden : !review.hidden;
        await review.save();

        res.json({
            success: true,
            message: review.hidden ? 'تم إخفاء التقييم' : 'تم إظهار التقييم',
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
