const Table = require('../models/Table');

// @desc    Pobierz wszystkie stoliki
// @route   GET /api/tables
// @access  Private
exports.getTables = async (req, res) => {
  try {
    const { location } = req.query;
    
    let query = { isActive: true };
    if (location) {
      query.location = location;
    }
    
    const tables = await Table.find(query)
      .populate('location', 'name')
      .sort({ location: 1, tableNumber: 1 });
    
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

// @desc    Pobierz pojedynczy stolik
// @route   GET /api/tables/:id
// @access  Private
exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('location');
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Stolik nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania stolika'
    });
  }
};

// @desc    Utwórz stolik
// @route   POST /api/tables
// @access  Private/Admin
exports.createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    
    const populatedTable = await Table.findById(table._id).populate('location', 'name');
    
    res.status(201).json({
      success: true,
      data: populatedTable
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Stolik o tym numerze już istnieje w tym lokalu'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Błąd tworzenia stolika'
    });
  }
};

// @desc    Aktualizuj stolik
// @route   PUT /api/tables/:id
// @access  Private/Admin
exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('location', 'name');
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Stolik nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd aktualizacji stolika'
    });
  }
};

// @desc    Usuń stolik (soft delete)
// @route   DELETE /api/tables/:id
// @access  Private/Admin
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Stolik nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Stolik został dezaktywowany'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania stolika'
    });
  }
};
