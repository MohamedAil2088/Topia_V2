const CustomOrder = require('../models/CustomOrder');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendCustomOrderNotification } = require('../services/emailService');

// @desc    Create new custom order
// @route   POST /api/custom-orders
// @access  Private
exports.createCustomOrder = async (req, res) => {
    try {
        const {
            productId,
            quantity,
            size,
            color,
            customization,
            shippingAddress
        } = req.body;

        // التحقق من المنتج
        console.log('📦 NEW CUSTOM ORDER REQUEST:', JSON.stringify(req.body)); // Debug Log
        const product = await Product.findById(productId);

        if (!product) {
            console.error('❌ Custom Order Error: Product not found for ID:', productId);
            return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
        }

        // التحقق من أن المنتج يسمح بالتخصيص
        if (!product.isCustomizable && !product.allowCustomization) {
            console.error('❌ Custom Order Error: Product does not allow customization:', product._id);
            return res.status(400).json({ success: false, message: 'هذا المنتج لا يدعم التخصيص' });
        }

        // التحقق من التصميم المختار
        let selectedDesign = null;
        if (customization.selectedDesign) {
            const Design = require('../models/Design');
            selectedDesign = await Design.findById(customization.selectedDesign);

            if (!selectedDesign) {
                return res.status(404).json({ success: false, message: 'التصميم المختار غير موجود' });
            }

            if (!selectedDesign.isActive) {
                return res.status(400).json({ success: false, message: 'التصميم المختار غير متاح حالياً' });
            }

            // زيادة عدد استخدامات التصميم
            await selectedDesign.incrementUsage();
        }

        // حساب الأسعار
        const basePrice = product.price * quantity;
        let printPrice = 0;

        // حساب سعر الطباعة حسب الموقع
        if (customization.printLocation === 'front') {
            printPrice += product.customizationPricing.frontPrint;
        } else if (customization.printLocation === 'back') {
            printPrice += product.customizationPricing.backPrint;
        } else if (customization.printLocation === 'both') {
            printPrice += product.customizationPricing.bothSides;
        }

        // حساب سعر الحجم
        if (customization.printSize === 'small') {
            printPrice += product.customizationPricing.smallSize;
        } else if (customization.printSize === 'medium') {
            printPrice += product.customizationPricing.mediumSize;
        } else if (customization.printSize === 'large') {
            printPrice += product.customizationPricing.largeSize;
        }

        // إضافة سعر التصميم (إن وجد)
        if (selectedDesign) {
            printPrice += selectedDesign.price;
        }

        printPrice *= quantity; // ضرب في الكمية
        const totalPrice = basePrice + printPrice;

        // إنشاء الطلب
        const customOrder = await CustomOrder.create({
            user: req.user._id,
            product: productId,
            quantity,
            size,
            color,
            customization,
            pricing: {
                basePrice,
                printPrice,
                totalPrice
            },
            shippingAddress,
            timeline: [{
                status: 'pending',
                note: 'تم إنشاء الطلب',
                updatedBy: req.user._id
            }]
        });

        // Populate product and design details
        await customOrder.populate('product');
        await customOrder.populate('customization.selectedDesign', 'name image price');

        // Send email notification
        try {
            await sendCustomOrderNotification(
                customOrder,
                req.user.email,
                req.user.name
            );
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't fail the request if email fails
        }
        // Populate product and design details
        await customOrder.populate('product', 'name images price');
        await customOrder.populate('user', 'name email');
        await customOrder.populate('customization.selectedDesign', 'name image price');

        res.status(201).json({
            success: true,
            message: 'تم إنشاء طلب التخصيص بنجاح',
            data: customOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all custom orders (Admin)
// @route   GET /api/custom-orders/admin/all
// @access  Private/Admin
exports.getAllCustomOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const customOrders = await CustomOrder.find(filter)
            .populate('user', 'name email phone')
            .populate('product', 'name images price')
            .populate('admin.reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CustomOrder.countDocuments(filter);

        res.json({
            success: true,
            count: customOrders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: customOrders
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user's custom orders
// @route   GET /api/custom-orders/my-orders
// @access  Private
exports.getMyCustomOrders = async (req, res) => {
    try {
        const customOrders = await CustomOrder.find({ user: req.user._id })
            .populate('product', 'name images price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: customOrders.length,
            data: customOrders
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single custom order
// @route   GET /api/custom-orders/:id
// @access  Private
exports.getCustomOrderById = async (req, res) => {
    try {
        const customOrder = await CustomOrder.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('product', 'name images price description')
            .populate('admin.reviewedBy', 'name email')
            .populate('timeline.updatedBy', 'name');

        if (!customOrder) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }

        // التحقق من الصلاحيات
        if (customOrder.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'غير مصرح لك بمشاهدة هذا الطلب' });
        }

        res.json({
            success: true,
            data: customOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update custom order status (Admin)
// @route   PUT /api/custom-orders/:id/status
// @access  Private/Admin
exports.updateCustomOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        const customOrder = await CustomOrder.findById(req.params.id);

        if (!customOrder) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }

        // تحديث الحالة
        customOrder.status = status;

        // إضافة للـ timeline
        customOrder.addTimelineEntry(status, note, req.user._id);

        // تحديث معلومات الـ Admin
        if (status === 'reviewing' || status === 'approved') {
            customOrder.admin.reviewedBy = req.user._id;
            customOrder.admin.reviewedAt = new Date();
        }

        await customOrder.save();

        res.json({
            success: true,
            message: 'تم تحديث حالة الطلب',
            data: customOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add admin notes to custom order
// @route   PUT /api/custom-orders/:id/admin-notes
// @access  Private/Admin
exports.addAdminNotes = async (req, res) => {
    try {
        const { notes } = req.body;

        const customOrder = await CustomOrder.findById(req.params.id);

        if (!customOrder) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }

        customOrder.admin.notes = notes;
        await customOrder.save();

        res.json({
            success: true,
            message: 'تم إضافة الملاحظات',
            data: customOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel custom order
// @route   PUT /api/custom-orders/:id/cancel
// @access  Private
exports.cancelCustomOrder = async (req, res) => {
    try {
        const customOrder = await CustomOrder.findById(req.params.id);

        if (!customOrder) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }

        // التحقق من الصلاحيات
        if (customOrder.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'غير مصرح لك بإلغاء هذا الطلب' });
        }

        // لا يمكن الإلغاء بعد بدء الطباعة
        if (['printing', 'completed', 'shipped', 'delivered'].includes(customOrder.status)) {
            return res.status(400).json({ success: false, message: 'لا يمكن إلغاء الطلب في هذه المرحلة' });
        }

        customOrder.status = 'cancelled';
        customOrder.addTimelineEntry('cancelled', req.body.reason || 'تم الإلغاء بواسطة العميل', req.user._id);

        await customOrder.save();

        res.json({
            success: true,
            message: 'تم إلغاء الطلب',
            data: customOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get custom orders statistics (Admin)
// @route   GET /api/custom-orders/admin/stats
// @access  Private/Admin
exports.getCustomOrderStats = async (req, res) => {
    try {
        const stats = await CustomOrder.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.totalPrice' }
                }
            }
        ]);

        const totalOrders = await CustomOrder.countDocuments();
        const totalRevenue = await CustomOrder.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$pricing.totalPrice' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                byStatus: stats,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload design images
// @route   POST /api/custom-orders/upload-images
// @access  Private
exports.uploadDesignImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'الرجاء رفع صورة واحدة على الأقل' });
        }

        const uploadedImages = req.files.map(file => ({
            url: `/uploads/custom-designs/${file.filename}`,
            filename: file.filename,
            uploadedAt: new Date()
        }));

        res.json({
            success: true,
            message: 'تم رفع الصور بنجاح',
            data: uploadedImages
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
