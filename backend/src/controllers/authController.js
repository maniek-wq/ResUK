const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generowanie tokenu JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Logowanie admina
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Znajdź admina z hasłem
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy email lub hasło'
      });
    }
    
    // Sprawdź czy konto aktywne
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Konto zostało dezaktywowane'
      });
    }
    
    // Sprawdź hasło
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy email lub hasło'
      });
    }
    
    // Aktualizuj ostatnie logowanie
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    
    // Generuj token
    const token = generateToken(admin._id);
    
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        locations: admin.locations
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera'
    });
  }
};

// @desc    Pobierz aktualnego admina
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).populate('locations');
    
    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        locations: admin.locations,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd serwera'
    });
  }
};

// @desc    Zmiana hasła
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Pobierz admina z hasłem
    const admin = await Admin.findById(req.admin._id).select('+password');
    
    // Sprawdź aktualne hasło
    const isMatch = await admin.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowe aktualne hasło'
      });
    }
    
    // Walidacja nowego hasła
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Nowe hasło musi mieć minimum 8 znaków'
      });
    }
    
    // Zapisz nowe hasło
    admin.password = newPassword;
    await admin.save();
    
    res.status(200).json({
      success: true,
      message: 'Hasło zostało zmienione'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd serwera'
    });
  }
};

// @desc    Wylogowanie (po stronie klienta - usunięcie tokenu)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wylogowano pomyślnie'
  });
};
