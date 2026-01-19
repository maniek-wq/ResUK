const DailyReport = require('../models/DailyReport');
const Location = require('../models/Location');
const Reservation = require('../models/Reservation');

// @desc    Pobierz wszystkie raporty dzienne (z filtrami)
// @route   GET /api/daily-reports
// @access  Private/Manager/Admin
exports.getDailyReports = async (req, res) => {
  try {
    const { location, dateFrom, dateTo } = req.query;
    
    let query = {};
    
    // Filtr lokalu
    if (location) {
      query.location = location;
    } else if (req.admin.role !== 'admin' && req.admin.locations.length > 0) {
      // Ogranicz do lokali przypisanych do użytkownika
      query.location = { $in: req.admin.locations };
    }
    
    // Filtr daty
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        query.date.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.date.$lte = to;
      }
    }
    
    const reports = await DailyReport.find(query)
      .populate('location', 'name address')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ date: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get daily reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania raportów dziennych',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Pobierz raport dzienny dla lokalu i daty
// @route   GET /api/daily-reports/:locationId/:date
// @access  Private/Manager/Admin
exports.getDailyReport = async (req, res) => {
  try {
    const { locationId, date } = req.params;
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const report = await DailyReport.findOne({
      location: locationId,
      date: { $gte: targetDate, $lte: endDate }
    })
      .populate('location', 'name address')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Raport dzienny nie znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get daily report error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania raportu dziennego',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Utwórz lub zaktualizuj raport dzienny
// @route   POST /api/daily-reports
// @access  Private/Manager/Admin
exports.createOrUpdateDailyReport = async (req, res) => {
  try {
    const { location, date, revenue, currency, statistics } = req.body;
    
    // Walidacja
    if (!location || !date || revenue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Lokal, data i przychód są wymagane'
      });
    }
    
    // Sprawdź czy lokal istnieje
    const locationDoc = await Location.findById(location);
    if (!locationDoc) {
      return res.status(404).json({
        success: false,
        message: 'Lokal nie znaleziony'
      });
    }
    
    // Sprawdź uprawnienia - manager może tylko dla swoich lokali
    if (req.admin.role !== 'admin' && !req.admin.locations.includes(location)) {
      return res.status(403).json({
        success: false,
        message: 'Brak uprawnień do tego lokalu'
      });
    }
    
    // Parsuj datę
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    // Sprawdź czy raport już istnieje
    const existingReport = await DailyReport.findOne({
      location,
      date: { $gte: targetDate, $lte: endDate }
    });
    
    const reportData = {
      location,
      date: targetDate,
      revenue,
      currency: currency || 'PLN',
      statistics: statistics || {},
      createdBy: existingReport ? existingReport.createdBy : req.admin.id,
      updatedBy: req.admin.id
    };
    
    let report;
    if (existingReport) {
      // Aktualizuj istniejący raport
      report = await DailyReport.findByIdAndUpdate(
        existingReport._id,
        reportData,
        { new: true, runValidators: true }
      )
        .populate('location', 'name address')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');
    } else {
      // Utwórz nowy raport
      report = await DailyReport.create(reportData);
      report = await DailyReport.findById(report._id)
        .populate('location', 'name address')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');
    }
    
    res.status(existingReport ? 200 : 201).json({
      success: true,
      data: report,
      message: existingReport ? 'Raport zaktualizowany' : 'Raport utworzony'
    });
  } catch (error) {
    console.error('Create/Update daily report error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Raport dla tego lokalu i daty już istnieje'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Błąd zapisywania raportu dziennego',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Usuń raport dzienny
// @route   DELETE /api/daily-reports/:id
// @access  Private/Admin
exports.deleteDailyReport = async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Raport nie znaleziony'
      });
    }
    
    // Tylko admin może usuwać raporty
    if (req.admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Brak uprawnień do usunięcia raportu'
      });
    }
    
    await DailyReport.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Raport został usunięty'
    });
  } catch (error) {
    console.error('Delete daily report error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania raportu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Pobierz statystyki z rezerwacji dla danego dnia (helper do uzupełnienia raportu)
// @route   GET /api/daily-reports/statistics/:locationId/:date
// @access  Private/Manager/Admin
exports.getStatisticsForDate = async (req, res) => {
  try {
    const { locationId, date } = req.params;
    
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Pobierz wszystkie rezerwacje dla tego lokalu w danym dniu
    const reservations = await Reservation.find({
      location: locationId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Oblicz statystyki
    const totalGuests = reservations.reduce((sum, r) => sum + (r.guests || 0), 0);
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
    const completedReservations = reservations.filter(r => r.status === 'completed').length;
    
    // Pobierz unikalne stoliki zajęte
    const tablesOccupiedSet = new Set();
    reservations.forEach(r => {
      if (r.tables && r.tables.length > 0) {
        r.tables.forEach(tableId => tablesOccupiedSet.add(tableId.toString()));
      }
    });
    
    const statistics = {
      totalGuests,
      totalReservations: reservations.length,
      tablesOccupied: tablesOccupiedSet.size,
      averageGuestsPerReservation: reservations.length > 0 ? (totalGuests / reservations.length).toFixed(2) : 0,
      confirmedReservations,
      cancelledReservations,
      completedReservations
    };
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania statystyk',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
