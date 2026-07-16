const express = require('express');
const { getInquiries, createInquiry, updateInquiry, getMyInquiries } = require('../controllers/inquiryController');

const { protect, protectUser, attachCustomerIfPresent } = require('../middleware/auth');
const { inquiryLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router
    .route('/')
    .get(protect, getInquiries)
    .post(inquiryLimiter, attachCustomerIfPresent, createInquiry);

router.route('/mine').get(protectUser, getMyInquiries);

router
    .route('/:id')
    .put(protect, updateInquiry);

module.exports = router;
