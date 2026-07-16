const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await AdminUser.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Protect routes that act on behalf of a logged-in customer (phone/OTP auth, see
// userAuthController.js). Separate from protect() above since customer JWTs decode
// into a User, not an AdminUser.
exports.protectUser = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.customer = await User.findById(decoded.id);

        if (!req.customer) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Attaches req.customer if a valid customer Bearer token is present, but never blocks
// the request - used on the public inquiry-creation route so a logged-in customer's
// submission gets linked to their account while anonymous visitors can still submit.
exports.attachCustomerIfPresent = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return next();
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.customer = await User.findById(decoded.id);
    } catch (err) {
        // Invalid/expired token on a route that doesn't require auth - proceed anonymously
    }

    next();
};
