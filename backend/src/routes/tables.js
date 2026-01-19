const express = require('express');
const router = express.Router();
const {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdValidation } = require('../middleware/validators');

// Prywatne - zarządzanie stolikami
router.get('/', protect, getTables);
router.get('/:id', protect, mongoIdValidation, getTable);
router.post('/', protect, authorize('admin', 'manager'), createTable);
router.put('/:id', protect, authorize('admin', 'manager'), mongoIdValidation, updateTable);
router.delete('/:id', protect, authorize('admin', 'manager'), mongoIdValidation, deleteTable);

module.exports = router;
