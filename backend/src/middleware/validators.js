const { body, param, query, validationResult } = require('express-validator');

// Obsługa błędów walidacji
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Błędy walidacji',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Walidacja rezerwacji
const reservationValidation = [
  body('location')
    .notEmpty().withMessage('Lokal jest wymagany')
    .isMongoId().withMessage('Nieprawidłowy ID lokalu'),
  body('type')
    .isIn(['table', 'event', 'full_venue']).withMessage('Nieprawidłowy typ rezerwacji'),
  body('customer.firstName')
    .trim()
    .notEmpty().withMessage('Imię jest wymagane')
    .isLength({ min: 2, max: 50 }).withMessage('Imię musi mieć 2-50 znaków'),
  body('customer.lastName')
    .trim()
    .notEmpty().withMessage('Nazwisko jest wymagane')
    .isLength({ min: 2, max: 50 }).withMessage('Nazwisko musi mieć 2-50 znaków'),
  body('customer.email')
    .optional()
    .trim()
    .isEmail().withMessage('Nieprawidłowy format email'),
  body('customer.phone')
    .trim()
    .notEmpty().withMessage('Numer telefonu jest wymagany')
    .matches(/^[\d\s+()-]{9,15}$/).withMessage('Nieprawidłowy format telefonu'),
  body('date')
    .notEmpty().withMessage('Data jest wymagana')
    .isISO8601().withMessage('Nieprawidłowy format daty'),
  body('timeSlot.start')
    .notEmpty().withMessage('Godzina rozpoczęcia jest wymagana')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Format: HH:MM'),
  body('timeSlot.end')
    .notEmpty().withMessage('Godzina zakończenia jest wymagana')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Format: HH:MM'),
  body('guests')
    .notEmpty().withMessage('Liczba gości jest wymagana')
    .isInt({ min: 1, max: 200 }).withMessage('Liczba gości: 1-200'),
  handleValidation
];

// Walidacja logowania
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email jest wymagany')
    .isEmail().withMessage('Nieprawidłowy format email'),
  body('password')
    .notEmpty().withMessage('Hasło jest wymagane'),
  handleValidation
];

// Walidacja MongoDB ID
const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Nieprawidłowy format ID'),
  handleValidation
];

module.exports = {
  handleValidation,
  reservationValidation,
  loginValidation,
  mongoIdValidation
};
