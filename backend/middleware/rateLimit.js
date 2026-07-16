const rateLimit = require('express-rate-limit');

// Throttles login attempts (admin email/password and customer Firebase-token exchange)
// to blunt credential-stuffing / brute-force attempts.
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' }
});

// Throttles public inquiry submission to blunt lead-form spam/abuse.
exports.inquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many inquiries submitted. Please try again later.' }
});
