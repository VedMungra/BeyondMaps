const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Login / Register user with phone number
// @route   POST /api/v1/users/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { phone } = req.body;

    // Validate phone number
    if (!phone) {
        return next(new ErrorResponse('Please provide a phone number', 400));
    }

    // Check for user
    let user = await User.findOne({ phone });

    // If user doesn't exist, create them instantly (simulating seamless OTP signup)
    if (!user) {
        user = await User.create({ phone });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token,
        data: user
    });
});
