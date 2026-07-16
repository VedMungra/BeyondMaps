const Location = require('../models/Location');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all locations
// @route   GET /api/v1/locations
// @access  Public
exports.getLocations = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Create new location
// @route   POST /api/v1/locations
// @access  Private (Admin)
exports.createLocation = asyncHandler(async (req, res, next) => {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, data: location });
});

// @desc    Delete location
// @route   DELETE /api/v1/locations/:id
// @access  Private (Admin)
exports.deleteLocation = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);
    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }
    await location.deleteOne();
    res.status(200).json({ success: true, data: {} });
});
