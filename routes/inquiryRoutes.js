const express = require('express');
const { getInquiries, createInquiry, updateInquiry } = require('../controllers/inquiryController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    .get(protect, getInquiries)
    .post(createInquiry);

router
    .route('/:id')
    .put(protect, updateInquiry);

module.exports = router;
