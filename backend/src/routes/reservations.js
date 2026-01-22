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
const { publicLimiter, adminLimiter, writeLimiter } = require('../middleware/rateLimiter');

// Publiczne
router.post('/', publicLimiter, reservationValidation, createReservation);
router.get('/availability/:locationId', publicLimiter, getAvailability);

// Prywatne (wymagają autoryzacji admina) - z rate limitingiem
router.get('/', protect, adminLimiter, getReservations);
router.get('/:id', protect, adminLimiter, mongoIdValidation, getReservation);
router.put('/:id', protect, writeLimiter, mongoIdValidation, updateReservation);
router.delete('/:id', protect, writeLimiter, mongoIdValidation, deleteReservation);
router.patch('/:id/status', protect, writeLimiter, mongoIdValidation, updateReservationStatus);

module.exports = router;
