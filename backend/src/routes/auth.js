const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation } = require('../middleware/validators');
const { loginLimiter, adminLimiter } = require('../middleware/rateLimiter');

// Publiczne
router.post('/login', loginLimiter, loginValidation, login);

// Prywatne (wymagają autoryzacji) - z rate limitingiem dla admin/manager
router.get('/me', protect, adminLimiter, getMe);
router.put('/password', protect, adminLimiter, changePassword);
router.post('/logout', protect, adminLimiter, logout);

module.exports = router;
