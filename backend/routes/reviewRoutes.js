const express = require('express');
const { getReviews, addReview } = require('../controllers/reviewController');
const upload = require('../middleware/upload');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getReviews)
    .post(upload.array('photos', 4), addReview);

module.exports = router;
