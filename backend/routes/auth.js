const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePreferences
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes (no token needed)
router.post('/register', register);
router.post('/login', login);

// Private routes (token required)
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);

module.exports = router;