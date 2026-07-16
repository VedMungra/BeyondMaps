const Inquiry = require('../models/Inquiry');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

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
// @access  Public
exports.createInquiry = asyncHandler(async (req, res, next) => {
    const inquiry = await Inquiry.create(req.body);
    res.status(201).json({ success: true, data: inquiry });
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
