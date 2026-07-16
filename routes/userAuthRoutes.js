const express = require('express');
const { loginUser, getAllUsers } = require('../controllers/userAuthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginUser);
router.get('/', protect, getAllUsers);

module.exports = router;
