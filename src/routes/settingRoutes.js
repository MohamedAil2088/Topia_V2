const express = require('express');
const router = express.Router();
const { getSetting, updateSetting, getAllSettings } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.post('/', protect, admin, updateSetting); // Use POST to update/create

module.exports = router;
