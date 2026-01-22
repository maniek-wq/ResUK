const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationTables
} = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdValidation } = require('../middleware/validators');
const { publicLimiter, adminLimiter, writeLimiter } = require('../middleware/rateLimiter');

// Publiczne
router.get('/', publicLimiter, getLocations);
router.get('/:id', publicLimiter, mongoIdValidation, getLocation);
router.get('/:id/tables', publicLimiter, mongoIdValidation, getLocationTables);

// Prywatne - tylko admin - z rate limitingiem
router.post('/', protect, authorize('admin'), writeLimiter, createLocation);
router.put('/:id', protect, authorize('admin'), writeLimiter, mongoIdValidation, updateLocation);
router.delete('/:id', protect, authorize('admin'), writeLimiter, mongoIdValidation, deleteLocation);

module.exports = router;
