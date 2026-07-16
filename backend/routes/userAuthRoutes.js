const express = require('express');
const { loginUser, getAllUsers } = require('../controllers/userAuthController');
const { protect } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', loginLimiter, loginUser);
router.get('/', protect, getAllUsers);

module.exports = router;
