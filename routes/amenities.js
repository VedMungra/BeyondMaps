const express = require('express');
const { getAmenities, createAmenity, deleteAmenity } = require('../controllers/amenityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getAmenities)
    .post(protect, createAmenity);

router.route('/:id')
    .delete(protect, deleteAmenity);

module.exports = router;
