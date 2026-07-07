const express = require('express');
const { getReviews, addReview } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getReviews)
    .post(addReview);

module.exports = router;
