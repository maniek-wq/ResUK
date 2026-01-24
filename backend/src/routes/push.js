const express = require('express');
const router = express.Router();
const {
  getPublicKey,
  subscribe,
  unsubscribe,
  getDevices
} = require('../controllers/pushController');
const { protect } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');

// Publiczne - pobranie klucza VAPID
router.get('/public-key', getPublicKey);

// Prywatne - wymagają autoryzacji
router.post('/subscribe', protect, adminLimiter, subscribe);
router.delete('/unsubscribe', protect, adminLimiter, unsubscribe);
router.get('/devices', protect, adminLimiter, getDevices);

module.exports = router;
