const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// @desc    Pobierz wszystkich adminów
// @route   GET /api/admins
// @access  Private (tylko admin)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('locations', 'name address')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania listy administratorów'
    });
  }
};

// @desc    Pobierz pojedynczego admina
// @route   GET /api/admins/:id
// @access  Private (tylko admin)
exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .populate('locations', 'name address')
      .select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania administratora'
    });
  }
};

// @desc    Utwórz nowego admina
// @route   POST /api/admins
// @access  Private (tylko admin)
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, locations } = req.body;
    
    // Walidacja
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, hasło, imię i nazwisko są wymagane'
      });
    }
    
    // Sprawdź czy admin o tym emailu już istnieje
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Administrator o tym adresie email już istnieje'
      });
    }
    
    // Utwórz nowego admina
    const admin = await Admin.create({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || 'staff',
      locations: locations || [],
      isActive: true
    });
    
    // Zwróć bez hasła
    const adminData = await Admin.findById(admin._id)
      .populate('locations', 'name address')
      .select('-password');
    
    res.status(201).json({
      success: true,
      message: 'Administrator utworzony pomyślnie',
      data: adminData
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    
    // Obsługa błędów walidacji MongoDB
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Błąd tworzenia administratora'
    });
  }
};

// @desc    Aktualizuj admina
// @route   PUT /api/admins/:id
// @access  Private (tylko admin)
exports.updateAdmin = async (req, res) => {
  try {
    const { firstName, lastName, role, locations, isActive } = req.body;
    
    // Nie pozwalaj na zmianę własnego statusu isActive
    if (req.params.id === req.admin._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Nie możesz dezaktywować własnego konta'
      });
    }
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (role) updateData.role = role;
    if (locations !== undefined) updateData.locations = locations;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('locations', 'name address')
      .select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Administrator zaktualizowany pomyślnie',
      data: admin
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Błąd aktualizacji administratora'
    });
  }
};

// @desc    Zmień hasło admina
// @route   PUT /api/admins/:id/password
// @access  Private (tylko admin lub własne konto)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Walidacja
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Nowe hasło jest wymagane'
      });
    }
    
    // Sprawdź czy użytkownik zmienia własne hasło
    const isOwnAccount = req.params.id === req.admin._id.toString();
    
    // Jeśli zmienia własne hasło, wymagaj obecnego hasła
    if (isOwnAccount && !currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Obecne hasło jest wymagane'
      });
    }
    
    // Pobierz admina z hasłem
    const admin = await Admin.findById(req.params.id).select('+password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator nie znaleziony'
      });
    }
    
    // Weryfikuj obecne hasło jeśli zmienia własne
    if (isOwnAccount) {
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Obecne hasło jest nieprawidłowe'
        });
      }
    }
    
    // Ustaw nowe hasło (będzie zahashowane przez middleware)
    admin.password = newPassword;
    await admin.save();
    
    res.status(200).json({
      success: true,
      message: 'Hasło zostało zmienione pomyślnie'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Błąd zmiany hasła'
    });
  }
};

// @desc    Usuń admina (soft delete - dezaktywacja)
// @route   DELETE /api/admins/:id
// @access  Private (tylko admin)
exports.deleteAdmin = async (req, res) => {
  try {
    // Nie pozwalaj na usunięcie własnego konta
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Nie możesz usunąć własnego konta'
      });
    }
    
    // Soft delete - ustaw isActive na false
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Administrator został dezaktywowany',
      data: admin
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania administratora'
    });
  }
};

// @desc    Pobierz profil zalogowanego admina
// @route   GET /api/admins/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id)
      .populate('locations', 'name address')
      .select('-password');
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania profilu'
    });
  }
};
