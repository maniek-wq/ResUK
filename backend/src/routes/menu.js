const express = require('express');
const router = express.Router();

// Controllers
const {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  toggleCategory
} = require('../controllers/menuCategoryController');

const {
  getItems,
  getAllItems,
  getItemsByCategory,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  toggleAvailability,
  reorderItems,
  duplicateItem
} = require('../controllers/menuItemController');

// Middleware
const { protect, authorize } = require('../middleware/auth');
const {
  categoryValidation,
  menuItemValidation,
  reorderCategoriesValidation,
  reorderItemsValidation,
  mongoIdValidation,
  categoryIdValidation
} = require('../middleware/menuValidators');
const { publicLimiter, adminLimiter, writeLimiter } = require('../middleware/rateLimiter');

// ========== ADMIN/MANAGER ROUTES ==========
// UWAGA: Chronione route'y muszą być PRZED publicznymi z parametrami dynamicznymi
// Express dopasowuje route'y w kolejności - /all musi być przed /:id

// Kategorie - zarządzanie - z rate limitingiem
router.get('/categories/all', protect, authorize('admin', 'manager'), adminLimiter, getAllCategories);
router.post('/categories', protect, authorize('admin', 'manager'), writeLimiter, categoryValidation, createCategory);
router.put('/categories/:id', protect, authorize('admin', 'manager'), writeLimiter, mongoIdValidation, categoryValidation, updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), writeLimiter, mongoIdValidation, deleteCategory);
router.patch('/categories/reorder', protect, authorize('admin', 'manager'), writeLimiter, reorderCategoriesValidation, reorderCategories);
router.patch('/categories/:id/toggle', protect, authorize('admin', 'manager'), writeLimiter, mongoIdValidation, toggleCategory);

// Pozycje menu - zarządzanie - z rate limitingiem
router.get('/items/all', protect, authorize('admin', 'manager'), adminLimiter, getAllItems);
router.post('/items', protect, authorize('admin', 'manager'), writeLimiter, menuItemValidation, createItem);
router.put('/items/:id', protect, authorize('admin', 'manager'), writeLimiter, mongoIdValidation, menuItemValidation, updateItem);
router.delete('/items/:id', protect, authorize('admin', 'manager'), writeLimiter, mongoIdValidation, deleteItem);
router.patch('/items/:id/toggle-availability', protect, authorize('admin', 'manager'), writeLimiter, mongoIdValidation, toggleAvailability);
router.patch('/items/reorder', protect, authorize('admin', 'manager'), writeLimiter, reorderItemsValidation, reorderItems);
router.post('/items/:id/duplicate', protect, authorize('admin', 'manager'), writeLimiter, mongoIdValidation, duplicateItem);

// ========== PUBLIC ROUTES (Klienci) ==========
// Publiczne route'y po chronionych (aby /categories/:id nie przechwytywało /categories/all)

// Kategorie - publiczne z rate limitingiem
router.get('/categories', publicLimiter, getCategories);
router.get('/categories/:id', publicLimiter, mongoIdValidation, getCategory);

// Pozycje menu - publiczne z rate limitingiem
router.get('/items', publicLimiter, getItems);
router.get('/items/category/:categoryId', publicLimiter, categoryIdValidation, getItemsByCategory);
router.get('/items/:id', publicLimiter, mongoIdValidation, getItem);

module.exports = router;
