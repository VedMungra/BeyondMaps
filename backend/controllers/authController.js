const AdminUser = require('../models/AdminUser');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generateToken } = require('../utils/jwt');

// @desc    Register admin user
// @route   POST /api/v1/auth/register
// @access  Public (or Private depending on requirements)
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Create user
    const user = await AdminUser.create({
        name,
        email,
        password
    });

    sendTokenResponse(user, 201, res);
});

// @desc    Login admin user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await AdminUser.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = generateToken(user._id);

    res.status(statusCode).json({
        success: true,
        token
    });
};
