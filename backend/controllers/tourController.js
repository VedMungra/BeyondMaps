const TourPackage = require('../models/TourPackage');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const upload = require('../middleware/upload');

// Cloudinary storage sets file.path to the hosted image URL; local disk storage sets
// file.path to a local filesystem path, so file.filename (just the bare name) is what
// the frontend's /uploads/<filename> route expects instead.
const fileRef = (file) => (upload.usingCloudinary ? file.path : file.filename);

// @desc    Get all tour packages
// @route   GET /api/v1/tours
// @access  Public
exports.getTours = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single tour package
// @route   GET /api/v1/tours/:id
// @access  Public
exports.getTour = asyncHandler(async (req, res, next) => {
    const tour = await TourPackage.findById(req.params.id).populate('location');
    if (!tour) {
        return next(new ErrorResponse(`Tour not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: tour });
});

// @desc    Create new tour package
// @route   POST /api/v1/tours
// @access  Private (Admin)
exports.createTour = asyncHandler(async (req, res, next) => {
    const tour = await TourPackage.create(req.body);
    res.status(201).json({ success: true, data: tour });
});

// @desc    Update tour package
// @route   PUT /api/v1/tours/:id
// @access  Private (Admin)
exports.updateTour = asyncHandler(async (req, res, next) => {
    const tour = await TourPackage.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after',
        runValidators: true
    });
    if (!tour) {
        return next(new ErrorResponse(`Tour not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: tour });
});

// @desc    Delete tour package
// @route   DELETE /api/v1/tours/:id
// @access  Private (Admin)
exports.deleteTour = asyncHandler(async (req, res, next) => {
    const tour = await TourPackage.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new ErrorResponse(`Tour not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: {} });
});

// @desc    Upload photo for tour package
// @route   PUT /api/v1/tours/:id/photo
// @access  Private (Admin)
exports.tourPhotoUpload = asyncHandler(async (req, res, next) => {
    let tour = await TourPackage.findById(req.params.id);

    if (!tour) {
        return next(new ErrorResponse(`Tour not found with id of ${req.params.id}`, 404));
    }

    if (!req.file) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    // Update the database with the file name (or Cloudinary URL)
    tour = await TourPackage.findByIdAndUpdate(req.params.id, { photo: fileRef(req.file) }, {
        returnDocument: 'after',
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: tour
    });
});

// @desc    Upload multiple gallery photos for tour package
// @route   PUT /api/v1/tours/:id/gallery
// @access  Private (Admin)
exports.tourGalleryUpload = asyncHandler(async (req, res, next) => {
    let tour = await TourPackage.findById(req.params.id);

    if (!tour) {
        return next(new ErrorResponse(`Tour not found with id of ${req.params.id}`, 404));
    }

    if (!req.files || req.files.length === 0) {
        return next(new ErrorResponse(`Please upload at least one file`, 400));
    }

    const fileNames = req.files.map(fileRef);

    tour = await TourPackage.findByIdAndUpdate(req.params.id, { gallery: fileNames }, {
        returnDocument: 'after',
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: tour
    });
});

// @desc    Upload photo for a specific package option
// @route   PUT /api/v1/tours/:id/package-option/:optionIndex/photo
// @access  Private (Admin)
exports.tourPackageOptionPhotoUpload = asyncHandler(async (req, res, next) => {
    let tour = await TourPackage.findById(req.params.id);

    if (!tour) {
        return next(new ErrorResponse(`Tour not found with id of ${req.params.id}`, 404));
    }

    if (!req.file) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const { optionIndex } = req.params;
    if (!tour.packageOptions[optionIndex]) {
        return next(new ErrorResponse(`Package option not found at index ${optionIndex}`, 404));
    }

    tour.packageOptions[optionIndex].image = fileRef(req.file);
    await tour.save();

    res.status(200).json({
        success: true,
        data: tour
    });
});
