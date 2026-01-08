const { check, validationResult } = require('express-validator');

// Middleware to handle validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => err.msg)
        });
    }
    next();
};

// Auth Validators
exports.registerValidation = [
    check('name', 'الاسم مطلوب').not().isEmpty(),
    check('email', 'الرجاء إدخال بريد إلكتروني صحيح').isEmail(),
    check('password', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل').isLength({ min: 6 }),
    check('phone', 'رقم الهاتف مطلوب').not().isEmpty(),
    validate
];

exports.loginValidation = [
    check('email', 'الرجاء إدخال بريد إلكتروني صحيح').isEmail(),
    check('password', 'كلمة المرور مطلوبة').exists(),
    validate
];

// Product Validators
exports.productValidation = [
    check('name', 'اسم المنتج مطلوب').not().isEmpty(),
    check('price', 'سعر المنتج مطلوب ويجب أن يكون رقماً').isNumeric(),
    check('category', 'فئة المنتج مطلوبة').not().isEmpty(),
    check('stock', 'الكمية مطلوبة ويجب أن تكون رقماً').isNumeric(),
    validate
];

// Order Validators
exports.orderValidation = [
    check('orderItems', 'لا توجد منتجات في الطلب').isArray({ min: 1 }),
    check('shippingAddress', 'عنوان الشحن مطلوب').not().isEmpty(),
    check('paymentMethod', 'طريقة الدفع مطلوبة').not().isEmpty(),
    validate
];

// Category Validators
exports.categoryValidation = [
    check('name', 'اسم الفئة مطلوب').not().isEmpty(),
    check('description', 'وصف الفئة مطلوب').not().isEmpty(),
    validate
];

// Coupon Validators
exports.couponValidation = [
    check('code', 'كود الكوبون مطلوب').not().isEmpty(),
    check('discount', 'نسبة الخصم مطلوبة وتجب أن تكون رقماً').isNumeric(),
    check('expiryDate', 'تاريخ الانتهاء مطلوب').not().isEmpty(),
    validate
];

// Review Validators
exports.reviewValidation = [
    check('rating', 'التقييم مطلوب').isNumeric(),
    check('comment', 'التعليق مطلوب').not().isEmpty(),
    validate
];

// Address Validators
exports.addressValidation = [
    check('street', 'اسم الشارع مطلوب').not().isEmpty(),
    check('city', 'اسم المدينة مطلوب').not().isEmpty(),
    check('state', 'اسم المحافظة مطلوب').not().isEmpty(),
    check('zipCode', 'الرمز البريدي مطلوب').not().isEmpty(),
    check('country', 'اسم الدولة مطلوب').not().isEmpty(),
    validate
];
