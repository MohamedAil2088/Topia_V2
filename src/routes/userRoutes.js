const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getUserPreferences,
    updateUserPreferences
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const { addressValidation } = require('../middleware/validation');

// User Profile Routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Wishlist Routes
router.route('/wishlist')
    .get(protect, getWishlist);

router.route('/wishlist/:productId')
    .post(protect, addToWishlist)
    .delete(protect, removeFromWishlist);

// Address Routes
router.route('/address')
    .get(protect, getAddresses)
    .post(protect, addressValidation, addAddress);

router.route('/address/:addressId')
    .put(protect, addressValidation, updateAddress)
    .delete(protect, deleteAddress);

// Preferences Routes
router.route('/preferences')
    .get(protect, getUserPreferences)
    .put(protect, updateUserPreferences);

// Change Password Route (MUST be before /:id route)
router.route('/password')
    .put(protect, changePassword);

// Admin Routes (Get All Users)
router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);

module.exports = router;
