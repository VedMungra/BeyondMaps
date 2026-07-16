const Inquiry = require('../models/Inquiry');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/mailer');

// @desc    Get all inquiries
// @route   GET /api/v1/inquiries
// @access  Private (Admin)
exports.getInquiries = asyncHandler(async (req, res, next) => {
    const inquiries = await Inquiry.find().populate({
        path: 'tourPackage',
        select: 'title price'
    });
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
});

// @desc    Create an inquiry
// @route   POST /api/v1/inquiries
// @access  Public (attaches the logged-in customer, if any, via attachCustomerIfPresent)
exports.createInquiry = asyncHandler(async (req, res, next) => {
    // Whitelisted explicitly - req.body.user/status must never be trusted from the client,
    // since a customer's identity here is only established server-side via their JWT.
    const { name, email, phone, message, tourPackage } = req.body;
    const inquiry = await Inquiry.create({
        name,
        email,
        phone,
        message,
        tourPackage,
        user: req.customer ? req.customer._id : undefined
    });

    // Best-effort confirmation email - a delivery failure should not fail the inquiry itself
    try {
        await sendEmail({
            email: inquiry.email,
            subject: 'We received your inquiry - Beyond Maps',
            message: `Hi ${inquiry.name},\n\nThanks for reaching out to Beyond Maps! We've received your inquiry and our travel team will get back to you shortly.\n\nYour message: "${inquiry.message}"\n\n- Beyond Maps`
        });
    } catch (err) {
        console.error('Inquiry confirmation email failed to send:', err.message);
    }

    res.status(201).json({ success: true, data: inquiry });
});

// @desc    Get the logged-in customer's own inquiries
// @route   GET /api/v1/inquiries/mine
// @access  Private (Customer)
exports.getMyInquiries = asyncHandler(async (req, res, next) => {
    const inquiries = await Inquiry.find({ user: req.customer._id })
        .populate({ path: 'tourPackage', select: 'title price photo' })
        .sort('-createdAt');
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
});

// @desc    Update inquiry status
// @route   PUT /api/v1/inquiries/:id
// @access  Private (Admin)
exports.updateInquiry = asyncHandler(async (req, res, next) => {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after',
        runValidators: true
    });
    if (!inquiry) {
        return next(new ErrorResponse(`Inquiry not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: inquiry });
});
