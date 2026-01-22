const express = require('express');
const router = express.Router();
const {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  getTableAvailability,
  checkAvailability
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdValidation } = require('../middleware/validators');
const { adminLimiter, writeLimiter } = require('../middleware/rateLimiter');

// Prywatne - zarządzanie stolikami - z rate limitingiem
// UWAGA: Endpointy /availability i /:id/availability muszą być przed /:id, bo inaczej Express dopasuje 'availability' do :id
router.get('/', protect, adminLimiter, getTables);
router.get('/availability', protect, adminLimiter, checkAvailability);
router.get('/:id/availability', protect, adminLimiter, mongoIdValidation, getTableAvailability);
router.get('/:id', protect, adminLimiter, mongoIdValidation, getTable);
router.post('/', protect, authorize('admin', 'manager'), writeLimiter, createTable);
router.put('/:id', protect, authorize('admin', 'manager'), writeLimiter, mongoIdValidation, updateTable);
router.delete('/:id', protect, authorize('admin', 'manager'), writeLimiter, mongoIdValidation, deleteTable);

module.exports = router;
