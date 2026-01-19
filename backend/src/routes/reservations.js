const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation,
  updateReservationStatus,
  getAvailability
} = require('../controllers/reservationController');
const { protect, checkLocationAccess } = require('../middleware/auth');
const { reservationValidation, mongoIdValidation } = require('../middleware/validators');

// Publiczne
router.post('/', reservationValidation, createReservation);
router.get('/availability/:locationId', getAvailability);

// Prywatne (wymagają autoryzacji admina)
router.get('/', protect, getReservations);
router.get('/:id', protect, mongoIdValidation, getReservation);
router.put('/:id', protect, mongoIdValidation, updateReservation);
router.delete('/:id', protect, mongoIdValidation, deleteReservation);
router.patch('/:id/status', protect, mongoIdValidation, updateReservationStatus);

module.exports = router;
