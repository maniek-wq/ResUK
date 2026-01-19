const { body, param, query, validationResult } = require('express-validator');
const { handleValidation } = require('./validators');

// Walidacja raportu dziennego
const dailyReportValidation = [
  body('location')
    .notEmpty().withMessage('Lokal jest wymagany')
    .isMongoId().withMessage('Nieprawidłowy format ID lokalu'),
  body('date')
    .notEmpty().withMessage('Data jest wymagana')
    .isISO8601().withMessage('Nieprawidłowy format daty (YYYY-MM-DD)'),
  body('revenue')
    .notEmpty().withMessage('Przychód jest wymagany')
    .isFloat({ min: 0 }).withMessage('Przychód musi być liczbą >= 0'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('Waluta musi być kodem 3-literowym (np. PLN)'),
  body('statistics.totalGuests')
    .optional()
    .isInt({ min: 0 }).withMessage('Liczba gości musi być liczbą całkowitą >= 0'),
  body('statistics.totalReservations')
    .optional()
    .isInt({ min: 0 }).withMessage('Liczba rezerwacji musi być liczbą całkowitą >= 0'),
  body('statistics.tablesOccupied')
    .optional()
    .isInt({ min: 0 }).withMessage('Liczba zajętych stolików musi być liczbą całkowitą >= 0'),
  body('statistics.confirmedReservations')
    .optional()
    .isInt({ min: 0 }).withMessage('Liczba potwierdzonych rezerwacji musi być liczbą całkowitą >= 0'),
  body('statistics.cancelledReservations')
    .optional()
    .isInt({ min: 0 }).withMessage('Liczba anulowanych rezerwacji musi być liczbą całkowitą >= 0'),
  body('statistics.completedReservations')
    .optional()
    .isInt({ min: 0 }).withMessage('Liczba ukończonych rezerwacji musi być liczbą całkowitą >= 0'),
  body('statistics.notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notatki mogą mieć maksimum 1000 znaków'),
  handleValidation
];

module.exports = {
  dailyReportValidation
};
