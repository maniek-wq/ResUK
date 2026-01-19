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

// Prywatne - manager i admin
// UWAGA: Route /statistics musi być przed /:locationId/:date, bo inaczej Express dopasuje 'statistics' do :locationId
router.get('/statistics/:locationId/:date', protect, authorize('admin', 'manager'), mongoIdValidation, getStatisticsForDate);
router.get('/:locationId/:date', protect, authorize('admin', 'manager'), mongoIdValidation, getDailyReport);
router.get('/', protect, authorize('admin', 'manager'), getDailyReports);
router.post('/', protect, authorize('admin', 'manager'), dailyReportValidation, createOrUpdateDailyReport);
router.delete('/:id', protect, authorize('admin'), mongoIdValidation, deleteDailyReport);

module.exports = router;
