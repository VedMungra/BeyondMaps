const express = require('express');
const { getTours, getTour, createTour, updateTour, deleteTour, tourPhotoUpload, tourGalleryUpload, tourPackageOptionPhotoUpload } = require('../controllers/tourController');
const upload = require('../middleware/upload');
const TourPackage = require('../models/TourPackage');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const reviewRouter = require('./reviewRoutes');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Re-route into other resource routers
router.use('/:tourId/reviews', reviewRouter);

router
    .route('/')
    .get(advancedResults(TourPackage), getTours)
    .post(protect, createTour);

router
    .route('/:id')
    .get(getTour)
    .put(protect, updateTour)
    .delete(protect, deleteTour);

router
    .route('/:id/photo')
    .put(protect, upload.single('file'), tourPhotoUpload);

router
    .route('/:id/gallery')
    .put(protect, upload.array('files', 5), tourGalleryUpload);

router
    .route('/:id/package-option/:optionIndex/photo')
    .put(protect, upload.single('file'), tourPackageOptionPhotoUpload);

module.exports = router;
