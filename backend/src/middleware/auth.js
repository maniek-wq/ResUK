const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware sprawdzający token JWT
const protect = async (req, res, next) => {
  let token;
  
  // Sprawdź nagłówek Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Brak autoryzacji. Zaloguj się.'
    });
  }
  
  try {
    // Weryfikuj token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Znajdź admina
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Użytkownik nie istnieje.'
      });
    }
    
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Konto zostało dezaktywowane.'
      });
    }
    
    // Dodaj admina do request
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Nieprawidłowy token.'
    });
  }
};

// Middleware sprawdzający rolę
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Brak uprawnień do wykonania tej akcji.'
      });
    }
    next();
  };
};

// Middleware sprawdzający dostęp do lokalu
const checkLocationAccess = async (req, res, next) => {
  const locationId = req.params.locationId || req.body.location;
  
  // Admin ma dostęp do wszystkich lokali
  if (req.admin.role === 'admin') {
    return next();
  }
  
  // Sprawdź czy użytkownik ma dostęp do lokalu
  if (req.admin.locations.length > 0 && locationId) {
    const hasAccess = req.admin.locations.some(
      loc => loc.toString() === locationId.toString()
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Brak dostępu do tego lokalu.'
      });
    }
  }
  
  next();
};

module.exports = { protect, authorize, checkLocationAccess };
