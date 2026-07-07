const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/tours/:tourId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.tourId) {
        query = Review.find({ tourPackage: req.params.tourId });
    } else {
        query = Review.find().populate({
            path: 'tourPackage',
            select: 'title description'
        });
    }
    
    const reviews = await query;
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Add review
// @route   POST /api/v1/tours/:tourId/reviews
// @access  Public (or Private depending on user model)
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.tourPackage = req.params.tourId;
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
});
