const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const RefreshToken = require('../models/RefreshToken');

// Generowanie access tokenu JWT (krótki czas życia - 15 minut)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m' // 15 minut - krótki czas życia dla bezpieczeństwa
  });
};

// Generowanie refresh tokenu (długi czas życia - 7 dni)
const generateRefreshToken = (id) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET nie jest ustawione w zmiennych środowiskowych');
  }
  
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // 7 dni dla refresh tokenu
  });
};

// @desc    Logowanie admina
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;
    
    // recaptchaToken jest weryfikowany przez middleware verifyRecaptcha
    // Jeśli dotarliśmy tutaj, weryfikacja się powiodła
    
    // Walidacja danych wejściowych
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email i hasło są wymagane'
      });
    }
    
    // Normalizuj email
    const normalizedEmail = email.toLowerCase().trim();
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Loguj tylko w development (bez wrażliwych danych jak IP, ID)
    // NIE loguj: IP, email, ID użytkownika (RODO/GDPR)
    if (isDevelopment) {
      console.log(`🔍 Login attempt`);
    }
    
    // Znajdź admina z hasłem - użyj case-insensitive search
    // Mongoose powinien automatycznie konwertować na lowercase, ale na wszelki wypadek użyj regex
    let admin = await Admin.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    }).select('+password');
    
    // Jeśli nie znaleziono, spróbuj dokładnego matcha
    if (!admin) {
      admin = await Admin.findOne({ email: normalizedEmail }).select('+password');
    }
    
    // Jeśli nadal nie znaleziono - zwróć ten sam komunikat (ochrona przed enumeration)
    if (!admin) {
      if (isDevelopment) {
        console.log(`❌ Login failed: Admin not found`);
      }
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy email lub hasło'
      });
    }
    
    // Sprawdź czy konto aktywne
    if (!admin.isActive) {
      if (isDevelopment) {
        console.log(`❌ Login failed: Account inactive`);
      }
      return res.status(401).json({
        success: false,
        message: 'Konto zostało dezaktywowane'
      });
    }
    
    // Sprawdź hasło
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      if (isDevelopment) {
        console.log(`❌ Login failed: Invalid password`);
      }
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy email lub hasło'
      });
    }
    
    // Loguj tylko udane logowanie w development
    if (isDevelopment) {
      console.log(`✅ Login successful`);
    }
    
    // Aktualizuj ostatnie logowanie
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    
    // Generuj access token (15 minut)
    const token = generateToken(admin._id);
    
    // Generuj refresh token (7 dni)
    const refreshToken = generateRefreshToken(admin._id);
    
    // Zapisz refresh token w bazie danych
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dni od teraz
    
    await RefreshToken.create({
      token: refreshToken,
      admin: admin._id,
      expiresAt: expiresAt,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(200).json({
      success: true,
      token, // Access token (15 minut)
      refreshToken, // Refresh token (7 dni)
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
    
    // Walidacja nowego hasła - wymagania złożoności
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Hasło musi zawierać: minimum 12 znaków, wielką literę, małą literę, cyfrę i znak specjalny (@$!%*?&)'
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

// @desc    Odśwież access token używając refresh tokenu
// @route   POST /api/auth/refresh
// @access  Public (ale wymaga refresh tokenu)
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token jest wymagany'
      });
    }
    
    if (!process.env.JWT_REFRESH_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Konfiguracja serwera nieprawidłowa'
      });
    }
    
    // Weryfikuj refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy lub wygasły refresh token'
      });
    }
    
    // Sprawdź czy token istnieje w bazie i nie jest unieważniony
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      admin: decoded.id,
      revoked: false
    });
    
    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token nie istnieje lub został unieważniony'
      });
    }
    
    // Sprawdź czy token nie wygasł
    if (tokenDoc.expiresAt < new Date()) {
      // Oznacz jako unieważniony
      tokenDoc.revoked = true;
      tokenDoc.revokedAt = new Date();
      await tokenDoc.save();
      
      return res.status(401).json({
        success: false,
        message: 'Refresh token wygasł'
      });
    }
    
    // Sprawdź czy admin istnieje i jest aktywny
    const admin = await Admin.findById(decoded.id);
    
    if (!admin || !admin.isActive) {
      // Unieważnij wszystkie refresh tokeny tego użytkownika
      await RefreshToken.updateMany(
        { admin: decoded.id, revoked: false },
        { revoked: true, revokedAt: new Date() }
      );
      
      return res.status(401).json({
        success: false,
        message: 'Użytkownik nie istnieje lub konto zostało dezaktywowane'
      });
    }
    
    // Generuj nowy access token
    const newAccessToken = generateToken(admin._id);
    
    res.status(200).json({
      success: true,
      token: newAccessToken,
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
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera'
    });
  }
};

// @desc    Wylogowanie - unieważnij refresh tokeny
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Jeśli podano refresh token, unieważnij go
    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken, admin: req.admin._id },
        { revoked: true, revokedAt: new Date() }
      );
    } else {
      // Unieważnij wszystkie refresh tokeny użytkownika
      await RefreshToken.updateMany(
        { admin: req.admin._id, revoked: false },
        { revoked: true, revokedAt: new Date() }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Wylogowano pomyślnie'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera'
    });
  }
};
