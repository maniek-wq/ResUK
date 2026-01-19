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

// Publiczne
router.get('/', getLocations);
router.get('/:id', mongoIdValidation, getLocation);
router.get('/:id/tables', mongoIdValidation, getLocationTables);

// Prywatne - tylko admin
router.post('/', protect, authorize('admin'), createLocation);
router.put('/:id', protect, authorize('admin'), mongoIdValidation, updateLocation);
router.delete('/:id', protect, authorize('admin'), mongoIdValidation, deleteLocation);

module.exports = router;
