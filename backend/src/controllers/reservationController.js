const Reservation = require('../models/Reservation');
const Location = require('../models/Location');
const Table = require('../models/Table');
const { createNotification } = require('./notificationController');
const pushService = require('../services/pushNotification.service');

// @desc    Pobierz wszystkie rezerwacje (admin)
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    const { location, status, date, dateFrom, dateTo, type } = req.query;
    
    // Buduj query
    let query = {};
    
    // Filtr lokalu
    if (location) {
      query.location = location;
    } else if (req.admin.role !== 'admin' && req.admin.locations.length > 0) {
      // Ogranicz do lokali przypisanych do użytkownika
      query.location = { $in: req.admin.locations };
    }
    
    // Filtr statusu
    if (status) {
      query.status = status;
    }
    
    // Filtr typu
    if (type) {
      query.type = type;
    }
    
    // Filtr daty
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (dateFrom || dateTo) {
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
    
    const reservations = await Reservation.find(query)
      .populate('location', 'name address')
      .populate('tables', 'tableNumber seats zone')
      .populate('confirmedBy', 'firstName lastName')
      .sort({ date: 1, 'timeSlot.start': 1 });
    
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania rezerwacji'
    });
  }
};

// @desc    Pobierz pojedynczą rezerwację
// @route   GET /api/reservations/:id
// @access  Private
exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('location')
      .populate('tables')
      .populate('confirmedBy', 'firstName lastName');
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania rezerwacji'
    });
  }
};

// @desc    Utwórz rezerwację (publiczne - klient)
// @route   POST /api/reservations
// @access  Public
exports.createReservation = async (req, res) => {
  try {
    const { location, type, date, timeSlot, guests, tables } = req.body;
    
    // Sprawdź czy lokal istnieje
    const locationDoc = await Location.findById(location);
    if (!locationDoc || !locationDoc.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Lokal nie znaleziony'
      });
    }
    
    // Sprawdź dostępność dla rezerwacji całego lokalu
    if (type === 'full_venue') {
      const existingReservations = await Reservation.find({
        location,
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(date).setHours(23, 59, 59, 999))
        },
        status: { $in: ['pending', 'confirmed'] }
      });
      
      if (existingReservations.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Lokal jest już zarezerwowany na ten dzień'
        });
      }
    }
    
    // Sprawdź dostępność stolików
    if (type === 'table' && tables && tables.length > 0) {
      const conflictingReservations = await Reservation.find({
        location,
        tables: { $in: tables },
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(date).setHours(23, 59, 59, 999))
        },
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          {
            'timeSlot.start': { $lt: timeSlot.end },
            'timeSlot.end': { $gt: timeSlot.start }
          }
        ]
      });
      
      if (conflictingReservations.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Wybrane stoliki są już zarezerwowane w tym czasie'
        });
      }
    }
    
    // Utwórz rezerwację
    const reservation = await Reservation.create(req.body);
    
    // Pobierz pełne dane
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('location', 'name address')
      .populate('tables', 'tableNumber seats');
    
    // Utwórz powiadomienie dla adminów o nowej rezerwacji
    try {
      const customerName = `${req.body.customer?.firstName || ''} ${req.body.customer?.lastName || ''}`.trim();
      const locationName = locationDoc.name;
      const dateStr = new Date(date).toLocaleDateString('pl-PL');
      const timeStr = timeSlot?.start || '';
      
      await createNotification({
        type: 'reservation_new',
        title: 'Nowa rezerwacja',
        message: `Nowa rezerwacja od ${customerName} na ${dateStr} o ${timeStr} w lokalu ${locationName}`,
        reservation: reservation._id,
        location: location,
        recipient: null, // Dla wszystkich adminów
        metadata: {
          customerName,
          date: date,
          timeSlot: timeSlot,
          guests: req.body.guests,
          locationName
        }
      });

      // Wyślij Web Push Notification do wszystkich adminów
      console.log('[Reservation] Sprawdzam czy push service jest zainicjalizowany:', pushService.isInitialized());
      if (pushService.isInitialized()) {
        try {
          console.log('[Reservation] Wysyłam push notification o nowej rezerwacji...');
          const pushResult = await pushService.sendToAllAdmins({
            title: 'Nowa rezerwacja',
            body: `Nowa rezerwacja od ${customerName} na ${dateStr} o ${timeStr} w lokalu ${locationName}`,
            icon: '/assets/icons/icon-192x192.svg',
            badge: '/assets/icons/badge-72x72.svg',
            data: {
              url: `/admin/reservations?reservationId=${reservation._id}`,
              reservationId: reservation._id.toString(),
              type: 'reservation_new',
              notificationId: reservation._id.toString()
            },
            requireInteraction: false,
            tag: `reservation-${reservation._id}`,
            timestamp: Date.now()
          });
          console.log('[Reservation] Wynik wysyłania push:', pushResult);
        } catch (pushError) {
          // Nie przerywaj procesu jeśli push się nie powiódł
          console.error('[Reservation] ❌ Error sending push notification:', pushError);
        }
      } else {
        console.log('[Reservation] ⚠️ Push service nie jest zainicjalizowany');
      }
    } catch (notificationError) {
      // Nie przerywaj procesu tworzenia rezerwacji jeśli powiadomienie się nie powiodło
      console.error('Error creating notification:', notificationError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Rezerwacja została utworzona. Oczekuje na potwierdzenie.',
      data: populatedReservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd tworzenia rezerwacji'
    });
  }
};

// @desc    Aktualizuj rezerwację (admin)
// @route   PUT /api/reservations/:id
// @access  Private
exports.updateReservation = async (req, res) => {
  try {
    let reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie znaleziona'
      });
    }
    
    // Jeśli zmiana statusu na confirmed
    if (req.body.status === 'confirmed' && reservation.status !== 'confirmed') {
      req.body.confirmedBy = req.admin._id;
      req.body.confirmedAt = new Date();
    }
    
    reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('location', 'name address')
      .populate('tables', 'tableNumber seats')
      .populate('confirmedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd aktualizacji rezerwacji'
    });
  }
};

// @desc    Usuń rezerwację
// @route   DELETE /api/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie znaleziona'
      });
    }
    
    await reservation.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Rezerwacja została usunięta'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd usuwania rezerwacji'
    });
  }
};

// @desc    Zmień status rezerwacji
// @route   PATCH /api/reservations/:id/status
// @access  Private
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowy status'
      });
    }
    
    const updateData = { status };
    
    if (status === 'confirmed') {
      updateData.confirmedBy = req.admin._id;
      updateData.confirmedAt = new Date();
    }
    
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('location', 'name address')
      .populate('tables', 'tableNumber seats');
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd zmiany statusu'
    });
  }
};

// @desc    Pobierz dostępne sloty czasowe
// @route   GET /api/reservations/availability/:locationId
// @access  Public
exports.getAvailability = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { date, guests } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Data jest wymagana'
      });
    }
    
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Lokal nie znaleziony'
      });
    }
    
    // Pobierz wszystkie stoliki lokalu
    const tables = await Table.find({ location: locationId, isActive: true });
    
    // Pobierz rezerwacje na dany dzień
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const reservations = await Reservation.find({
      location: locationId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // Generuj sloty czasowe (co 30 min od 12:00 do 22:00)
    const slots = [];
    for (let hour = 12; hour < 22; hour++) {
      for (let min of [0, 30]) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const endHour = min === 30 ? hour + 1 : hour;
        const endMin = min === 30 ? 0 : 30;
        const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
        
        // Znajdź dostępne stoliki
        const reservedTableIds = reservations
          .filter(r => {
            return r.timeSlot.start < endTimeStr && r.timeSlot.end > timeStr;
          })
          .flatMap(r => r.tables.map(t => t.toString()));
        
        const availableTables = tables.filter(t => 
          !reservedTableIds.includes(t._id.toString())
        );
        
        const totalSeats = availableTables.reduce((sum, t) => sum + t.seats, 0);
        
        slots.push({
          time: timeStr,
          available: availableTables.length > 0,
          availableTables: availableTables.length,
          totalSeats
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        location: location.name,
        date,
        slots
      }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd sprawdzania dostępności'
    });
  }
};
