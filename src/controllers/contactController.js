const { sendContactFormEmail } = require('../services/emailService');

// @desc    Send contact form message
// @route   POST /api/contact
// @access  Public
exports.sendContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, email, subject, and message'
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Send email
        const result = await sendContactFormEmail(name, email, subject, message);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Message sent successfully! We will get back to you soon.',
                data: {
                    messageIds: result.messageIds
                }
            });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
            error: error.message
        });
    }
};
