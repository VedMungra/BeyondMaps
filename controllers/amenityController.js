const Amenity = require('../models/Amenity');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all amenities
// @route   GET /api/v1/amenities
// @access  Public
exports.getAmenities = asyncHandler(async (req, res, next) => {
    const amenities = await Amenity.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: amenities.length, data: amenities });
});

// @desc    Create new amenity
// @route   POST /api/v1/amenities
// @access  Private (Admin)
exports.createAmenity = asyncHandler(async (req, res, next) => {
    const amenity = await Amenity.create(req.body);
    res.status(201).json({ success: true, data: amenity });
});

// @desc    Delete amenity
// @route   DELETE /api/v1/amenities/:id
// @access  Private (Admin)
exports.deleteAmenity = asyncHandler(async (req, res, next) => {
    const amenity = await Amenity.findByIdAndDelete(req.params.id);
    if (!amenity) {
        return next(new ErrorResponse(`Amenity not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: {} });
});
