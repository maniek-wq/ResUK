const Location = require('../models/Location');
const Table = require('../models/Table');

// @desc    Pobierz wszystkie lokale
// @route   GET /api/locations
// @access  Public
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });
    
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania lokali'
    });
  }
};

// @desc    Pobierz pojedynczy lokal
// @route   GET /api/locations/:id
// @access  Public
exports.getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Lokal nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania lokalu'
    });
  }
};

// @desc    Utwórz nowy lokal
// @route   POST /api/locations
// @access  Private/Admin
exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    
    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lokal o tej nazwie już istnieje'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Błąd tworzenia lokalu'
    });
  }
};

// @desc    Aktualizuj lokal
// @route   PUT /api/locations/:id
// @access  Private/Admin
exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Lokal nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd aktualizacji lokalu'
    });
  }
};

// @desc    Usuń lokal (soft delete)
// @route   DELETE /api/locations/:id
// @access  Private/Admin
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Lokal nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lokal został dezaktywowany'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania lokalu'
    });
  }
};

// @desc    Pobierz stoliki lokalu
// @route   GET /api/locations/:id/tables
// @access  Public
exports.getLocationTables = async (req, res) => {
  try {
    const tables = await Table.find({ 
      location: req.params.id,
      isActive: true 
    }).sort('tableNumber');
    
    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania stolików'
    });
  }
};
