/**
 * Skrypt migracyjny - uzupełnia brakujące pola audytu w istniejących rezerwacjach
 * Uruchom: node src/scripts/migrateReservationAudit.js
 */

const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Admin = require('../models/Admin');
require('dotenv').config();

async function migrate() {
  try {
    // Połącz z bazą danych
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Połączono z MongoDB');

    // Znajdź pierwszego admina (użyjemy go jako domyślnego autora dla starych rezerwacji)
    const defaultAdmin = await Admin.findOne({ role: 'admin' });
    if (!defaultAdmin) {
      console.error('❌ Nie znaleziono żadnego admina w bazie');
      process.exit(1);
    }
    console.log(`📝 Użyję jako domyślny admin: ${defaultAdmin.firstName} ${defaultAdmin.lastName}`);

    // Znajdź wszystkie rezerwacje bez statusHistory
    const reservationsToUpdate = await Reservation.find({
      $or: [
        { statusHistory: { $exists: false } },
        { statusHistory: { $size: 0 } }
      ]
    });

    console.log(`\n📊 Znaleziono ${reservationsToUpdate.length} rezerwacji do aktualizacji`);

    let updated = 0;
    for (const reservation of reservationsToUpdate) {
      const updates = {};
      
      // Dodaj statusHistory jeśli nie istnieje
      if (!reservation.statusHistory || reservation.statusHistory.length === 0) {
        updates.statusHistory = [{
          status: reservation.status,
          changedBy: reservation.confirmedBy || defaultAdmin._id,
          changedAt: reservation.confirmedAt || reservation.createdAt,
          reason: 'Migracja danych - istniejąca rezerwacja'
        }];
      }

      // Ustaw createdBy jeśli nie istnieje
      if (!reservation.createdBy) {
        updates.createdBy = defaultAdmin._id;
      }

      // Ustaw updatedBy dla potwierdzonych rezerwacji
      if (reservation.status === 'confirmed' && reservation.confirmedBy && !reservation.updatedBy) {
        updates.updatedBy = reservation.confirmedBy;
      }

      // Aktualizuj rezerwację
      if (Object.keys(updates).length > 0) {
        await Reservation.findByIdAndUpdate(reservation._id, updates);
        updated++;
        console.log(`✅ Zaktualizowano rezerwację ${reservation._id} (${reservation.customer.firstName} ${reservation.customer.lastName})`);
      }
    }

    console.log(`\n🎉 Zakończono! Zaktualizowano ${updated} rezerwacji`);
    
    await mongoose.connection.close();
    console.log('👋 Rozłączono z MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd migracji:', error);
    process.exit(1);
  }
}

migrate();
