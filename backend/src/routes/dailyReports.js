const express = require('express');
const router = express.Router();
const {
  getDailyReports,
  getDailyReport,
  createOrUpdateDailyReport,
  deleteDailyReport,
  getStatisticsForDate
} = require('../controllers/dailyReportController');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdValidation } = require('../middleware/validators');
const { dailyReportValidation } = require('../middleware/dailyReportValidators');
const { adminLimiter, writeLimiter } = require('../middleware/rateLimiter');

// Prywatne - manager i admin - z rate limitingiem
// UWAGA: Route /statistics musi być przed /:locationId/:date, bo inaczej Express dopasuje 'statistics' do :locationId
router.get('/statistics/:locationId/:date', protect, authorize('admin', 'manager'), adminLimiter, mongoIdValidation, getStatisticsForDate);
router.get('/:locationId/:date', protect, authorize('admin', 'manager'), adminLimiter, mongoIdValidation, getDailyReport);
router.get('/', protect, authorize('admin', 'manager'), adminLimiter, getDailyReports);
router.post('/', protect, authorize('admin', 'manager'), writeLimiter, dailyReportValidation, createOrUpdateDailyReport);
router.delete('/:id', protect, authorize('admin'), writeLimiter, mongoIdValidation, deleteDailyReport);

module.exports = router;
