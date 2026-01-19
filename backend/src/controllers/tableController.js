const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

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

// @desc    Sprawdź dostępne stoliki dla daty, godziny i liczby miejsc
// @route   GET /api/tables/availability?location=id&date=YYYY-MM-DD&time=HH:MM&guests=N
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { location, date, time, guests } = req.query;
    
    if (!location || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Lokal, data i godzina są wymagane'
      });
    }
    
    const guestsNum = guests ? parseInt(guests) : 1;
    
    // Pobierz wszystkie aktywne stoliki w lokalu
    const tables = await Table.find({ 
      location, 
      isActive: true 
    }).sort({ seats: 1, tableNumber: 1 });
    
    // Parsuj datę i godzinę
    const targetDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    const reservationStart = new Date(targetDate);
    reservationStart.setHours(hours, minutes, 0, 0);
    
    // Standardowy czas rezerwacji (2 godziny) - można rozszerzyć
    const reservationEnd = new Date(reservationStart);
    reservationEnd.setHours(reservationStart.getHours() + 2);
    
    const timeStart = time;
    const timeEnd = `${reservationEnd.getHours().toString().padStart(2, '0')}:${reservationEnd.getMinutes().toString().padStart(2, '0')}`;
    
    // Pobierz wszystkie rezerwacje dla tego lokalu w danym dniu
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const reservations = await Reservation.find({
      location,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          'timeSlot.start': { $lt: timeEnd },
          'timeSlot.end': { $gt: timeStart }
        }
      ]
    }).select('tables timeSlot customer status guests');
    
    // Znajdź zajęte stoliki w tym czasie
    const reservedTableIds = new Set();
    reservations.forEach(reservation => {
      reservation.tables.forEach(tableId => {
        reservedTableIds.add(tableId.toString());
      });
    });
    
    // Filtruj dostępne stoliki (nie zajęte i mające wystarczającą liczbę miejsc)
    const availableTables = tables
      .filter(table => {
        const tableIdStr = table._id.toString();
        return !reservedTableIds.has(tableIdStr) && table.seats >= guestsNum;
      })
      .map(table => ({
        _id: table._id,
        tableNumber: table.tableNumber,
        seats: table.seats,
        zone: table.zone,
        description: table.description
      }));
    
    // Statystyki
    const totalSeats = availableTables.reduce((sum, t) => sum + t.seats, 0);
    const suitableTables = availableTables.filter(t => t.seats >= guestsNum && t.seats <= guestsNum + 2); // Stoliki idealne (dokładnie lub max 2 miejsca więcej)
    
    res.status(200).json({
      success: true,
      data: {
        location,
        date,
        time: timeStart,
        guests: guestsNum,
        availableTables,
        suitableTables,
        statistics: {
          total: tables.length,
          available: availableTables.length,
          occupied: tables.length - availableTables.length,
          totalSeats,
          suitable: suitableTables.length
        },
        reservations: reservations.map(r => ({
          _id: r._id,
          customer: r.customer,
          timeSlot: r.timeSlot,
          status: r.status,
          guests: r.guests
        }))
      }
    });
  } catch (error) {
    console.error('Błąd sprawdzania dostępności:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd sprawdzania dostępności',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Sprawdź dostępność stolika dla danej daty
// @route   GET /api/tables/:id/availability?date=YYYY-MM-DD
// @access  Private
exports.getTableAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const tableId = req.params.id;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Data jest wymagana (parametr: date=YYYY-MM-DD)'
      });
    }
    
    // Sprawdź czy stolik istnieje
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Stolik nie znaleziony'
      });
    }
    
    // Parsuj datę
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Pobierz wszystkie rezerwacje dla tego stolika w danym dniu
    // Rezerwacje z statusem 'pending' lub 'confirmed' blokują stolik
    const reservations = await Reservation.find({
      tables: tableId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot customer status');
    
    // Generuj sloty czasowe (co 30 minut, od 10:00 do 22:00)
    const timeSlots = [];
    const startHour = 10;
    const endHour = 22;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push({
          time: timeStr,
          available: true,
          reservation: null
        });
      }
    }
    
    // Oznacz zajęte sloty
    reservations.forEach(reservation => {
      const { start, end } = reservation.timeSlot;
      
      timeSlots.forEach(slot => {
        // Sprawdź czy slot koliduje z rezerwacją
        if (slot.time >= start && slot.time < end) {
          slot.available = false;
          slot.reservation = {
            _id: reservation._id,
            customer: reservation.customer,
            status: reservation.status,
            timeSlot: reservation.timeSlot
          };
        }
      });
    });
    
    // Grupuj dostępne i zajęte sloty
    const available = timeSlots.filter(slot => slot.available).map(slot => slot.time);
    const occupied = timeSlots.filter(slot => !slot.available);
    
    res.status(200).json({
      success: true,
      data: {
        table: {
          _id: table._id,
          tableNumber: table.tableNumber,
          seats: table.seats,
          location: table.location
        },
        date: date,
        timeSlots: timeSlots,
        available: available,
        occupied: occupied,
        statistics: {
          total: timeSlots.length,
          available: available.length,
          occupied: occupied.length
        }
      }
    });
  } catch (error) {
    console.error('Błąd sprawdzania dostępności stolika:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd sprawdzania dostępności stolika',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
