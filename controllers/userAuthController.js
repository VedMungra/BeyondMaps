const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const admin = require('../config/firebase');

// @desc    Verify Firebase ID Token and Login / Register
// @route   POST /api/v1/users/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body;

    if (!idToken) {
        return next(new ErrorResponse('Please provide a Firebase ID token', 400));
    }

    if (!admin) {
        return next(new ErrorResponse('Firebase Admin is not configured on the server', 500));
    }

    try {
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phone = decodedToken.phone_number;

        if (!phone) {
            return next(new ErrorResponse('Verified phone number not found in token', 400));
        }

        // Find user by phone number
        let user = await User.findOne({ phone });

        // If user doesn't exist, create them
        if (!user) {
            user = await User.create({ phone });
        }

        // Create our standard JWT token
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            data: user
        });
    } catch (error) {
        console.error('Firebase token verification error:', error);
        return next(new ErrorResponse('Invalid or expired Firebase token', 401));
    }
});

// @desc    Get all users (Travelers)
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().sort('-createdAt');
    
    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});


