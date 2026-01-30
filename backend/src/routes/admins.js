const express = require('express');
const router = express.Router();
const {
  getAllAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  changePassword,
  getMe
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Wszystkie route wymagają autentykacji
router.use(protect);

// Profil zalogowanego admina
router.get('/me', getMe);

// CRUD dla adminów - tylko dla roli 'admin'
router.route('/')
  .get(restrictTo('admin'), getAllAdmins)
  .post(restrictTo('admin'), createAdmin);

router.route('/:id')
  .get(restrictTo('admin'), getAdmin)
  .put(restrictTo('admin'), updateAdmin)
  .delete(restrictTo('admin'), deleteAdmin);

// Zmiana hasła - admin może zmienić każdemu, inni tylko sobie
router.put('/:id/password', (req, res, next) => {
  // Jeśli to własne konto lub jest adminem, pozwól
  if (req.params.id === req.admin._id.toString() || req.admin.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Brak uprawnień do zmiany hasła'
    });
  }
}, changePassword);

module.exports = router;
