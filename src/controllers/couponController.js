const Coupon = require('../models/Coupon');

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
    try {
        const { code, discount, expiryDate } = req.body;

        const couponExists = await Coupon.findOne({ code });
        if (couponExists) {
            return res.status(400).json({ success: false, message: 'الكوبون موجود بالفعل' });
        }

        const coupon = await Coupon.create({
            code,
            discount,
            expiryDate
        });

        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public (or Private)
exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'الكوبون غير صحيح' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: 'الكوبون غير نشط' });
        }

        if (new Date() > coupon.expiryDate) {
            return res.status(400).json({ success: false, message: 'انتهت صلاحية الكوبون' });
        }

        res.json({
            success: true,
            data: {
                code: coupon.code,
                discount: coupon.discount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await coupon.deleteOne();
            res.json({ success: true, message: 'تم حذف الكوبون' });
        } else {
            res.status(404).json({ success: false, message: 'الكوبون غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
