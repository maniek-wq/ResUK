const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');

// @desc    Pobierz wszystkie aktywne pozycje menu (publiczne)
// @route   GET /api/menu/items
// @access  Public
exports.getItems = async (req, res) => {
  try {
    const { category, tags, search } = req.query;
    
    let query = { isAvailable: true };
    
    // Filtr kategorii
    if (category) {
      query.category = category;
    }
    
    // Filtr tagów
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    // Wyszukiwanie pełnotekstowe
    if (search) {
      query.$text = { $search: search };
    }
    
    const items = await MenuItem.find(query)
      .populate('category', 'name')
      .sort({ order: 1 })
      .select('-createdAt -updatedAt');
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania pozycji menu'
    });
  }
};

// @desc    Pobierz wszystkie pozycje menu (admin - w tym niedostępne)
// @route   GET /api/menu/items/all
// @access  Private/Admin/Manager
exports.getAllItems = async (req, res) => {
  try {
    const { category, isAvailable } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }
    
    const items = await MenuItem.find(query)
      .populate('category', 'name description')
      .populate('createdBy', 'firstName lastName')
      .sort({ 'category.order': 1, order: 1 });
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania pozycji menu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Pobierz pozycje w danej kategorii
// @route   GET /api/menu/items/category/:categoryId
// @access  Public
exports.getItemsByCategory = async (req, res) => {
  try {
    const items = await MenuItem.find({
      category: req.params.categoryId,
      isAvailable: true
    })
      .sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania pozycji menu'
    });
  }
};

// @desc    Pobierz pojedynczą pozycję menu
// @route   GET /api/menu/items/:id
// @access  Public
exports.getItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('category', 'name description');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pozycja menu nie znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania pozycji menu'
    });
  }
};

// @desc    Utwórz pozycję menu
// @route   POST /api/menu/items
// @access  Private/Admin/Manager
exports.createItem = async (req, res) => {
  try {
    // Sprawdź czy kategoria istnieje
    const category = await MenuCategory.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoria nie znaleziona'
      });
    }
    
    // Jeśli nie podano order, ustaw jako ostatnią w kategorii
    if (req.body.order === undefined) {
      const maxOrder = await MenuItem.findOne({ category: req.body.category })
        .sort({ order: -1 })
        .select('order');
      req.body.order = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    // Dodaj informację o twórcy
    req.body.createdBy = req.admin._id;
    
    const item = await MenuItem.create(req.body);
    
    const populatedItem = await MenuItem.findById(item._id)
      .populate('category', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Pozycja menu o tej nazwie już istnieje w tej kategorii'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Błąd tworzenia pozycji menu'
    });
  }
};

// @desc    Aktualizuj pozycję menu
// @route   PUT /api/menu/items/:id
// @access  Private/Admin/Manager
exports.updateItem = async (req, res) => {
  try {
    // Jeśli zmieniana jest kategoria, sprawdź czy istnieje
    if (req.body.category) {
      const category = await MenuCategory.findById(req.body.category);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategoria nie znaleziona'
        });
      }
    }
    
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('createdBy', 'firstName lastName');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pozycja menu nie znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd aktualizacji pozycji menu'
    });
  }
};

// @desc    Usuń pozycję menu
// @route   DELETE /api/menu/items/:id
// @access  Private/Admin/Manager
exports.deleteItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pozycja menu nie znaleziona'
      });
    }
    
    await item.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Pozycja menu została usunięta'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania pozycji menu'
    });
  }
};

// @desc    Zmień dostępność pozycji menu
// @route   PATCH /api/menu/items/:id/toggle-availability
// @access  Private/Admin/Manager
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pozycja menu nie znaleziona'
      });
    }
    
    item.isAvailable = !item.isAvailable;
    await item.save();
    
    const populatedItem = await MenuItem.findById(item._id)
      .populate('category', 'name');
    
    res.status(200).json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd zmiany dostępności'
    });
  }
};

// @desc    Zmień kolejność pozycji w kategorii
// @route   PATCH /api/menu/items/reorder
// @access  Private/Admin/Manager
exports.reorderItems = async (req, res) => {
  try {
    const { categoryId, itemIds } = req.body; // Array of item IDs in new order
    
    if (!categoryId || !Array.isArray(itemIds)) {
      return res.status(400).json({
        success: false,
        message: 'categoryId i itemIds (tablica) są wymagane'
      });
    }
    
    // Aktualizuj kolejność dla każdej pozycji
    const updatePromises = itemIds.map((itemId, index) => {
      return MenuItem.findByIdAndUpdate(
        itemId,
        { order: index + 1 },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Kolejność pozycji została zaktualizowana'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd zmiany kolejności pozycji'
    });
  }
};

// @desc    Duplikuj pozycję menu
// @route   POST /api/menu/items/:id/duplicate
// @access  Private/Admin/Manager
exports.duplicateItem = async (req, res) => {
  try {
    const originalItem = await MenuItem.findById(req.params.id);
    
    if (!originalItem) {
      return res.status(404).json({
        success: false,
        message: 'Pozycja menu nie znaleziona'
      });
    }
    
    // Utwórz kopię bez _id, createdAt, updatedAt
    const itemData = originalItem.toObject();
    delete itemData._id;
    delete itemData.createdAt;
    delete itemData.updatedAt;
    
    // Zmień nazwę (dodaj "Kopia")
    itemData.name = `${itemData.name} (Kopia)`;
    
    // Ustaw jako ostatnią w kategorii
    const maxOrder = await MenuItem.findOne({ category: itemData.category })
      .sort({ order: -1 })
      .select('order');
    itemData.order = maxOrder ? maxOrder.order + 1 : 1;
    
    // Ustaw twórcę jako aktualnego admina
    itemData.createdBy = req.admin._id;
    
    const duplicatedItem = await MenuItem.create(itemData);
    
    const populatedItem = await MenuItem.findById(duplicatedItem._id)
      .populate('category', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      data: populatedItem,
      message: 'Pozycja menu została zduplikowana'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd duplikowania pozycji menu'
    });
  }
};
