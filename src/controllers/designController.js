const Design = require('../models/Design');
const path = require('path');
const fs = require('fs');

// @desc    Create new design (Admin)
// @route   POST /api/designs
// @access  Private/Admin
exports.createDesign = async (req, res) => {
    try {
        const { name, description, category, price, tags } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'يرجى رفع صورة التصميم' });
        }

        const design = await Design.create({
            name,
            description,
            category,
            price: price || 0,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            image: `/uploads/designs/${req.file.filename}`,
            uploadedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'تم إضافة التصميم بنجاح',
            data: design
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all designs
// @route   GET /api/designs
// @access  Public
exports.getAllDesigns = async (req, res) => {
    try {
        const { category, search, active = 'true' } = req.query;

        const filter = {};

        // Filter by active status
        if (active === 'true') {
            filter.isActive = true;
        }

        // Filter by category
        if (category) {
            filter.category = category;
        }

        // Search functionality
        if (search) {
            filter.$text = { $search: search };
        }

        const designs = await Design.find(filter)
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: designs.length,
            data: designs
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single design
// @route   GET /api/designs/:id
// @access  Public
exports.getDesignById = async (req, res) => {
    try {
        const design = await Design.findById(req.params.id)
            .populate('uploadedBy', 'name email');

        if (!design) {
            return res.status(404).json({ success: false, message: 'التصميم غير موجود' });
        }

        res.json({
            success: true,
            data: design
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update design (Admin)
// @route   PUT /api/designs/:id
// @access  Private/Admin
exports.updateDesign = async (req, res) => {
    try {
        const { name, description, category, price, tags, isActive } = req.body;

        const design = await Design.findById(req.params.id);

        if (!design) {
            return res.status(404).json({ success: false, message: 'التصميم غير موجود' });
        }

        // Update fields
        if (name) design.name = name;
        if (description) design.description = description;
        if (category) design.category = category;
        if (price !== undefined) design.price = price;
        if (tags) design.tags = tags.split(',').map(tag => tag.trim());
        if (isActive !== undefined) design.isActive = isActive;

        // Update image if new file uploaded
        if (req.file) {
            // Delete old image
            const oldImagePath = path.join(__dirname, '../../', design.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            design.image = `/uploads/designs/${req.file.filename}`;
        }

        await design.save();

        res.json({
            success: true,
            message: 'تم تحديث التصميم بنجاح',
            data: design
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete design (Admin)
// @route   DELETE /api/designs/:id
// @access  Private/Admin
exports.deleteDesign = async (req, res) => {
    try {
        const design = await Design.findById(req.params.id);

        if (!design) {
            return res.status(404).json({ success: false, message: 'التصميم غير موجود' });
        }

        // Delete image file
        const imagePath = path.join(__dirname, '../../', design.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await design.deleteOne();

        res.json({
            success: true,
            message: 'تم حذف التصميم بنجاح'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get design statistics (Admin)
// @route   GET /api/designs/admin/stats
// @access  Private/Admin
exports.getDesignStats = async (req, res) => {
    try {
        const totalDesigns = await Design.countDocuments();
        const activeDesigns = await Design.countDocuments({ isActive: true });

        const categoryStats = await Design.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const mostUsed = await Design.find({ isActive: true })
            .sort({ usageCount: -1 })
            .limit(5)
            .select('name image usageCount');

        res.json({
            success: true,
            data: {
                totalDesigns,
                activeDesigns,
                inactiveDesigns: totalDesigns - activeDesigns,
                byCategory: categoryStats,
                mostUsed
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
