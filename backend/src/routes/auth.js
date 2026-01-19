const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation } = require('../middleware/validators');

// Publiczne
router.post('/login', loginValidation, login);

// Prywatne (wymagają autoryzacji)
router.get('/me', protect, getMe);
router.put('/password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
