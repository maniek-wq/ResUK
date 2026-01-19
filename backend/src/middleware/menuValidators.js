const { body, param, query, validationResult } = require('express-validator');
const { handleValidation } = require('./validators');

// Walidacja kategorii menu
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nazwa kategorii jest wymagana')
    .isLength({ min: 2, max: 50 }).withMessage('Nazwa musi mieć 2-50 znaków'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Opis może mieć maksimum 200 znaków'),
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Kolejność musi być liczbą całkowitą >= 0'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive musi być wartością boolean'),
  body('imageUrl')
    .optional()
    .trim()
    .isURL().withMessage('imageUrl musi być prawidłowym URL'),
  handleValidation
];

// Walidacja pozycji menu
const menuItemValidation = [
  body('category')
    .notEmpty().withMessage('Kategoria jest wymagana')
    .isMongoId().withMessage('Nieprawidłowy ID kategorii'),
  body('name')
    .trim()
    .notEmpty().withMessage('Nazwa dania jest wymagana')
    .isLength({ min: 2, max: 100 }).withMessage('Nazwa musi mieć 2-100 znaków'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Opis może mieć maksimum 500 znaków'),
  body('price')
    .notEmpty().withMessage('Cena jest wymagana')
    .isFloat({ min: 0.01, max: 9999.99 }).withMessage('Cena musi być między 0.01 a 9999.99'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage('Waluta musi być kodem 3-literowym (np. PLN)'),
  body('tags')
    .optional()
    .isArray().withMessage('Tagi muszą być tablicą')
    .custom((tags) => {
      const allowedTags = ['vege', 'ostre', 'szef poleca', 'gluten-free', 'wegańskie', 'wegetariańskie', 'bez laktozy'];
      if (Array.isArray(tags)) {
        const invalidTags = tags.filter(tag => !allowedTags.includes(tag.toLowerCase()));
        if (invalidTags.length > 0) {
          throw new Error(`Nieprawidłowe tagi: ${invalidTags.join(', ')}`);
        }
      }
      return true;
    }),
  body('allergens')
    .optional()
    .isArray().withMessage('Alergeny muszą być tablicą')
    .custom((allergens) => {
      const allowedAllergens = ['gluten', 'laktoza', 'orzechy', 'jaja', 'ryby', 'skorupiaki', 'soja', 'seler', 'gorczyca', 'sezam'];
      if (Array.isArray(allergens)) {
        const invalidAllergens = allergens.filter(allergen => !allowedAllergens.includes(allergen.toLowerCase()));
        if (invalidAllergens.length > 0) {
          throw new Error(`Nieprawidłowe alergeny: ${invalidAllergens.join(', ')}`);
        }
      }
      return true;
    }),
  body('imageUrl')
    .optional()
    .trim()
    .isURL().withMessage('imageUrl musi być prawidłowym URL'),
  body('isAvailable')
    .optional()
    .isBoolean().withMessage('isAvailable musi być wartością boolean'),
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Kolejność musi być liczbą całkowitą >= 0'),
  body('prepTime')
    .optional()
    .isInt({ min: 1, max: 300 }).withMessage('Czas przygotowania musi być między 1 a 300 minut'),
  handleValidation
];

// Walidacja zmiany kolejności kategorii
const reorderCategoriesValidation = [
  body('categoryIds')
    .notEmpty().withMessage('categoryIds jest wymagane')
    .isArray().withMessage('categoryIds musi być tablicą')
    .custom((ids) => {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('categoryIds musi być niepustą tablicą');
      }
      return true;
    }),
  handleValidation
];

// Walidacja zmiany kolejności pozycji
const reorderItemsValidation = [
  body('categoryId')
    .notEmpty().withMessage('categoryId jest wymagane')
    .isMongoId().withMessage('Nieprawidłowy ID kategorii'),
  body('itemIds')
    .notEmpty().withMessage('itemIds jest wymagane')
    .isArray().withMessage('itemIds musi być tablicą')
    .custom((ids) => {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('itemIds musi być niepustą tablicą');
      }
      return true;
    }),
  handleValidation
];

// Walidacja MongoDB ID
const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Nieprawidłowy format ID'),
  handleValidation
];

module.exports = {
  categoryValidation,
  menuItemValidation,
  reorderCategoriesValidation,
  reorderItemsValidation,
  mongoIdValidation
};
