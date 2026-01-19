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

// Prywatne - zarządzanie stolikami
// UWAGA: Endpointy /availability i /:id/availability muszą być przed /:id, bo inaczej Express dopasuje 'availability' do :id
router.get('/', protect, getTables);
router.get('/availability', protect, checkAvailability);
router.get('/:id/availability', protect, mongoIdValidation, getTableAvailability);
router.get('/:id', protect, mongoIdValidation, getTable);
router.post('/', protect, authorize('admin', 'manager'), createTable);
router.put('/:id', protect, authorize('admin', 'manager'), mongoIdValidation, updateTable);
router.delete('/:id', protect, authorize('admin', 'manager'), mongoIdValidation, deleteTable);

module.exports = router;
