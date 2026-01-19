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
  mongoIdValidation
} = require('../middleware/menuValidators');

// ========== PUBLIC ROUTES (Klienci) ==========

// Kategorie
router.get('/categories', getCategories);
router.get('/categories/:id', mongoIdValidation, getCategory);

// Pozycje menu
router.get('/items', getItems);
router.get('/items/:id', mongoIdValidation, getItem);
router.get('/items/category/:categoryId', mongoIdValidation, getItemsByCategory);

// ========== ADMIN/MANAGER ROUTES ==========

// Kategorie - zarządzanie
router.get('/categories/all', protect, authorize('admin', 'manager'), getAllCategories);
router.post('/categories', protect, authorize('admin', 'manager'), categoryValidation, createCategory);
router.put('/categories/:id', protect, authorize('admin', 'manager'), mongoIdValidation, categoryValidation, updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), mongoIdValidation, deleteCategory);
router.patch('/categories/reorder', protect, authorize('admin', 'manager'), reorderCategoriesValidation, reorderCategories);
router.patch('/categories/:id/toggle', protect, authorize('admin', 'manager'), mongoIdValidation, toggleCategory);

// Pozycje menu - zarządzanie
router.get('/items/all', protect, authorize('admin', 'manager'), getAllItems);
router.post('/items', protect, authorize('admin', 'manager'), menuItemValidation, createItem);
router.put('/items/:id', protect, authorize('admin', 'manager'), mongoIdValidation, menuItemValidation, updateItem);
router.delete('/items/:id', protect, authorize('admin', 'manager'), mongoIdValidation, deleteItem);
router.patch('/items/:id/toggle-availability', protect, authorize('admin', 'manager'), mongoIdValidation, toggleAvailability);
router.patch('/items/reorder', protect, authorize('admin', 'manager'), reorderItemsValidation, reorderItems);
router.post('/items/:id/duplicate', protect, authorize('admin', 'manager'), mongoIdValidation, duplicateItem);

module.exports = router;
