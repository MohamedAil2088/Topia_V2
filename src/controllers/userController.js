const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    points: user.points || 0,
                    createdAt: user.createdAt
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                user.password = req.body.password; // Pre-save hook will hash it
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role,
                    points: updatedUser.points || 0,
                    token: generateToken(updatedUser._id)
                },
                message: 'تم تحديث البيانات بنجاح'
            });
        } else {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إدخال كلمة المرور الحالية والجديدة'
            });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص (#?!@$%^&*-)'
            });
        }

        // Get user with password field
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }

        // Check if current password matches
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }

        // Update password
        user.password = newPassword; // Pre-save hook will hash it
        await user.save();

        res.json({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add Item to Wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.productId;

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }

        res.json({ success: true, message: 'تمت الإضافة للمفضلة', data: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove Item from Wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.productId;

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.json({ success: true, message: 'تم الحذف من المفضلة', data: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json({ success: true, data: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Saved Addresses
// @route   GET /api/users/address
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user.addresses || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add Address
// @route   POST /api/users/address
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const address = req.body; // Expects { street, city, ... }

        user.addresses.push(address);
        await user.save();

        res.json({ success: true, message: 'تم إضافة العنوان', data: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Address
// @route   PUT /api/users/address/:addressId
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addressId = req.params.addressId;
        const updatedAddress = req.body;

        const address = user.addresses.id(addressId);

        if (address) {
            address.street = updatedAddress.street || address.street;
            address.city = updatedAddress.city || address.city;
            address.state = updatedAddress.state || address.state;
            address.zipCode = updatedAddress.zipCode || address.zipCode;
            address.country = updatedAddress.country || address.country;
            address.isDefault = updatedAddress.isDefault !== undefined ? updatedAddress.isDefault : address.isDefault;

            await user.save();
            res.json({ success: true, message: 'تم تحديث العنوان', data: user.addresses });
        } else {
            res.status(404).json({ success: false, message: 'العنوان غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Address
// @route   DELETE /api/users/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addressId = req.params.addressId;

        const address = user.addresses.id(addressId);

        if (address) {
            address.deleteOne(); // Mongoose subdocument remove
            await user.save();
            res.json({ success: true, message: 'تم حذف العنوان', data: user.addresses });
        } else {
            res.status(404).json({ success: false, message: 'العنوان غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role; // Admin can update role

            const updatedUser = await user.save();

            res.json({
                success: true,
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ success: true, message: 'تم حذف المستخدم' });
        } else {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Private
exports.getUserPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('preferences');

        if (user) {
            res.json({
                success: true,
                data: user.preferences || {
                    theme: 'light',
                    viewMode: 'grid',
                    language: 'en',
                    emailNotifications: true,
                    smsNotifications: false
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updateUserPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update only provided preferences
            if (req.body.theme) user.preferences.theme = req.body.theme;
            if (req.body.viewMode) user.preferences.viewMode = req.body.viewMode;
            if (req.body.language) user.preferences.language = req.body.language;
            if (req.body.emailNotifications !== undefined) user.preferences.emailNotifications = req.body.emailNotifications;
            if (req.body.smsNotifications !== undefined) user.preferences.smsNotifications = req.body.smsNotifications;

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: 'تم تحديث الإعدادات بنجاح',
                data: updatedUser.preferences
            });
        } else {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
