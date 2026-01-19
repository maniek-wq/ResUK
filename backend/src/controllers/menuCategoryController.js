const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');

// @desc    Pobierz wszystkie aktywne kategorie (publiczne)
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find({ isActive: true })
      .sort({ order: 1 })
      .select('-createdAt -updatedAt');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania kategorii'
    });
  }
};

// @desc    Pobierz wszystkie kategorie (admin - w tym nieaktywne)
// @route   GET /api/menu/categories/all
// @access  Private/Admin/Manager
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find()
      .sort({ order: 1 })
      .populate({
        path: 'itemCount',
        select: '_id'
      });
    
    // Dodaj liczbę pozycji do każdej kategorii
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await MenuItem.countDocuments({ category: category._id });
        const activeItemCount = await MenuItem.countDocuments({ 
          category: category._id, 
          isAvailable: true 
        });
        
        return {
          ...category.toObject(),
          itemCount,
          activeItemCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania kategorii'
    });
  }
};

// @desc    Pobierz pojedynczą kategorię
// @route   GET /api/menu/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoria nie znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania kategorii'
    });
  }
};

// @desc    Utwórz kategorię
// @route   POST /api/menu/categories
// @access  Private/Admin/Manager
exports.createCategory = async (req, res) => {
  try {
    // Jeśli nie podano order, ustaw jako ostatnią
    if (req.body.order === undefined) {
      const maxOrder = await MenuCategory.findOne().sort({ order: -1 }).select('order');
      req.body.order = maxOrder ? maxOrder.order + 1 : 0;
    }
    
    const category = await MenuCategory.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Kategoria o tej nazwie już istnieje'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Błąd tworzenia kategorii'
    });
  }
};

// @desc    Aktualizuj kategorię
// @route   PUT /api/menu/categories/:id
// @access  Private/Admin/Manager
exports.updateCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoria nie znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd aktualizacji kategorii'
    });
  }
};

// @desc    Usuń kategorię (soft delete)
// @route   DELETE /api/menu/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoria nie znaleziona'
      });
    }
    
    // Sprawdź czy kategoria ma pozycje
    const itemCount = await MenuItem.countDocuments({ category: category._id });
    
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Nie można usunąć kategorii. Zawiera ${itemCount} pozycji menu.`,
        itemCount
      });
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Kategoria została usunięta'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania kategorii'
    });
  }
};

// @desc    Zmień kolejność kategorii
// @route   PATCH /api/menu/categories/reorder
// @access  Private/Admin/Manager
exports.reorderCategories = async (req, res) => {
  try {
    const { categoryIds } = req.body; // Array of IDs in new order
    
    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({
        success: false,
        message: 'categoryIds musi być tablicą'
      });
    }
    
    // Aktualizuj kolejność dla każdej kategorii
    const updatePromises = categoryIds.map((categoryId, index) => {
      return MenuCategory.findByIdAndUpdate(
        categoryId,
        { order: index },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Kolejność kategorii została zaktualizowana'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd zmiany kolejności kategorii'
    });
  }
};

// @desc    Deaktywuj kategorię (soft delete)
// @route   PATCH /api/menu/categories/:id/toggle
// @access  Private/Admin/Manager
exports.toggleCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoria nie znaleziona'
      });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd zmiany statusu kategorii'
    });
  }
};
