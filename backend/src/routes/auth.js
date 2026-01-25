const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, logout, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation } = require('../middleware/validators');
const { loginLimiter, adminLimiter, publicLimiter } = require('../middleware/rateLimiter');
// const { verifyRecaptcha } = require('../middleware/recaptcha'); // ZAKOMENTOWANE - do dodania później

// Publiczne
// CAPTCHA jest wymagana dla logowania (ochrona przed botami i brute force)
// TODO: Odkomentuj gdy klient się zdecyduje na CAPTCHA
router.post('/login', loginLimiter, /* verifyRecaptcha, */ loginValidation, login);
router.post('/refresh', publicLimiter, refreshToken); // Refresh token endpoint

// Prywatne (wymagają autoryzacji) - z rate limitingiem dla admin/manager
router.get('/me', protect, adminLimiter, getMe);
router.put('/password', protect, adminLimiter, changePassword);
router.post('/logout', protect, adminLimiter, logout);

module.exports = router;
