const express = require('express');
const { register, login } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);

module.exports = router;
