const Setting = require('../models/Setting');

// Get a setting by key
exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        let setting = await Setting.findOne({ key });

        // If setting doesn't exist, return default value based on key
        if (!setting) {
            if (key === 'freeShippingThreshold') {
                return res.json({ success: true, value: 5000 }); // Default default
            }
            return res.status(404).json({ success: false, message: 'Setting not found' });
        }

        res.json({ success: true, value: setting.value });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update or Create a setting (Admin only)
exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true } // Create if doesn't exist
        );

        res.json({ success: true, data: setting, message: 'Setting updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all settings (for admin dashboard loading)
exports.getAllSettings = async (req, res) => {
    try {
        const settings = await Setting.find({});
        // Convert array to object for easier frontend consumption
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        res.json({ success: true, data: settingsMap });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
