const express = require('express');
const { getLocations, createLocation, deleteLocation } = require('../controllers/locationController');
const Location = require('../models/Location');
const advancedResults = require('../middleware/advancedResults');

const { protect } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    .get(advancedResults(Location), getLocations)
    .post(protect, createLocation);

router
    .route('/:id')
    .delete(protect, deleteLocation);

module.exports = router;
