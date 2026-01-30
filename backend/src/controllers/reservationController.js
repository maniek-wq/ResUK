const Reservation = require('../models/Reservation');
const Location = require('../models/Location');
const Table = require('../models/Table');
const { createNotification } = require('./notificationController');
const pushService = require('../services/pushNotification.service');
const emailService = require('../services/emailService');

/**
 * Wybiera optymalną kombinację stolików dla danej liczby gości
 * Algorytm zachłanny - wybiera największe stoliki aż do osiągnięcia wymaganej pojemności
 * @param {Array} availableTables - dostępne stoliki
 * @param {number} guestCount - liczba gości
 * @returns {Array|null} - wybrane stoliki lub null jeśli brak wystarczającej pojemności
 */
function selectOptimalTables(availableTables, guestCount) {
  if (!availableTables || availableTables.length === 0) {
    return null;
  }
  
  // Sortuj stoliki od największego do najmniejszego
  const sorted = [...availableTables].sort((a, b) => b.seats - a.seats);
  
  const selected = [];
  let totalSeats = 0;
  
  // Wybieraj stoliki od największego aż do osiągnięcia wymaganej pojemności
  for (const table of sorted) {
    if (totalSeats >= guestCount) break;
    selected.push(table);
    totalSeats += table.seats;
  }
  
  // Sprawdź czy udało się zebrać wystarczającą pojemność
  return totalSeats >= guestCount ? selected : null;
}

/**
 * Pobiera ID stolików zarezerwowanych w danym czasie
 * @param {string} locationId - ID lokalu
 * @param {Date} date - data rezerwacji
 * @param {Object} timeSlot - slot czasowy {start, end}
 * @returns {Promise<Array<string>>} - tablica ID zarezerwowanych stolików
 */
async function getReservedTableIds(locationId, date, timeSlot) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const reservations = await Reservation.find({
    location: locationId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] }
  });
  
  // Znajdź stoliki zarezerwowane w nakładającym się czasie
  const reservedTableIds = reservations
    .filter(r => {
      return r.timeSlot.start < timeSlot.end && r.timeSlot.end > timeSlot.start;
    })
    .flatMap(r => r.tables.map(t => t.toString()));
  
  return reservedTableIds;
}

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
      .populate('confirmedBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('statusHistory.changedBy', 'firstName lastName email');
    
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
    
    // Automatyczne przypisywanie stolików dla rezerwacji typu 'table'
    let assignedTables = tables;
    
    if (type === 'table' && (!assignedTables || assignedTables.length === 0)) {
      // Pobierz wszystkie aktywne stoliki lokalu
      const allTables = await Table.find({ location, isActive: true });
      
      // Pobierz ID stolików zarezerwowanych w tym czasie
      const reservedTableIds = await getReservedTableIds(location, date, timeSlot);
      
      // Znajdź dostępne stoliki
      const availableTables = allTables.filter(t => 
        !reservedTableIds.includes(t._id.toString())
      );
      
      // Wybierz optymalne stoliki dla liczby gości
      const guestCount = parseInt(guests) || 1;
      const optimalTables = selectOptimalTables(availableTables, guestCount);
      
      if (!optimalTables) {
        return res.status(400).json({
          success: false,
          message: `Brak dostępnych stolików dla ${guestCount} gości w wybranym terminie`
        });
      }
      
      assignedTables = optimalTables.map(t => t._id);
      console.log(`[Reservation] Automatycznie przypisano stoliki: ${optimalTables.map(t => `#${t.tableNumber} (${t.seats} miejsc)`).join(', ')}`);
    }
    
    // Utwórz rezerwację z przypisanymi stolikami
    const reservationData = {
      ...req.body,
      tables: assignedTables || [],
      // Zapisz kto utworzył (jeśli admin)
      createdBy: req.admin ? req.admin._id : null,
      // Utwórz pierwszy wpis w historii statusu
      statusHistory: [{
        status: 'pending',
        changedBy: req.admin ? req.admin._id : null,
        changedAt: new Date(),
        reason: 'Utworzenie rezerwacji'
      }]
    };
    const reservation = await Reservation.create(reservationData);
    
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
    
    // Wyślij email potwierdzenia do klienta
    try {
      if (emailService.isInitialized() && req.body.customer?.email) {
        const emailResult = await emailService.sendReservationConfirmationEmail(
          { ...req.body, _id: reservation._id },
          locationDoc
        );
        if (emailResult.success) {
          console.log('[Reservation] ✅ Email potwierdzenia wysłany pomyślnie');
        } else {
          console.warn('[Reservation] ⚠️ Nie udało się wysłać emaila:', emailResult.error);
        }
      }
    } catch (emailError) {
      // Nie przerywaj procesu - email to dodatek
      console.error('[Reservation] ❌ Error sending email:', emailError);
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
    const { status, reason } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowy status'
      });
    }
    
    // Pobierz poprzedni status
    const previousReservation = await Reservation.findById(req.params.id);
    const previousStatus = previousReservation?.status;
    
    if (!previousReservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie znaleziona'
      });
    }
    
    const updateData = { 
      status,
      updatedBy: req.admin._id,
      $push: {
        statusHistory: {
          status: status,
          changedBy: req.admin._id,
          changedAt: new Date(),
          reason: reason || `Zmiana statusu z ${previousStatus} na ${status}`
        }
      }
    };
    
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
      .populate('tables', 'tableNumber seats')
      .populate('updatedBy', 'firstName lastName')
      .populate('statusHistory.changedBy', 'firstName lastName');
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie znaleziona'
      });
    }
    
    // Wyślij email jeśli status zmienił się na 'confirmed'
    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      try {
        if (emailService.isInitialized() && reservation.customer?.email) {
          console.log('[Reservation] Wysyłam email o potwierdzeniu do:', reservation.customer.email);
          const emailResult = await emailService.sendReservationApprovedEmail(
            reservation,
            reservation.location
          );
          if (emailResult.success) {
            console.log('[Reservation] ✅ Email o potwierdzeniu wysłany');
          } else {
            console.warn('[Reservation] ⚠️ Nie udało się wysłać emaila:', emailResult.error);
          }
        }
      } catch (emailError) {
        console.error('[Reservation] ❌ Error sending confirmation email:', emailError);
      }
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
    
    // Parsuj liczbę gości (domyślnie 1)
    const guestsNum = parseInt(guests) || 1;
    
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
    
    // Oblicz maksymalną pojemność lokalu
    const maxCapacity = tables.reduce((sum, t) => sum + t.seats, 0);
    
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
        
        // Znajdź stoliki zarezerwowane w tym slocie
        const reservedTableIds = reservations
          .filter(r => {
            return r.timeSlot.start < endTimeStr && r.timeSlot.end > timeStr;
          })
          .flatMap(r => r.tables.map(t => t.toString()));
        
        // Znajdź dostępne stoliki
        const availableTables = tables.filter(t => 
          !reservedTableIds.includes(t._id.toString())
        );
        
        // Oblicz łączną pojemność dostępnych stolików
        const totalSeats = availableTables.reduce((sum, t) => sum + t.seats, 0);
        
        // Slot jest dostępny tylko jeśli łączna pojemność >= liczba gości
        const canAccommodate = totalSeats >= guestsNum;
        
        slots.push({
          time: timeStr,
          available: canAccommodate,
          availableTables: availableTables.length,
          totalSeats,
          canAccommodate
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        location: location.name,
        date,
        slots,
        maxCapacity,
        requestedGuests: guestsNum
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
