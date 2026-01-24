const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { mongoIdValidation } = require('../middleware/validators');

// Wszystkie endpointy wymagają autoryzacji
router.get('/', protect, adminLimiter, getNotifications);
router.get('/unread/count', protect, adminLimiter, getUnreadCount);
router.patch('/:id/read', protect, adminLimiter, mongoIdValidation, markAsRead);
router.patch('/read-all', protect, adminLimiter, markAllAsRead);
router.delete('/:id', protect, adminLimiter, mongoIdValidation, deleteNotification);

module.exports = router;
