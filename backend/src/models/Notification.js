const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Typ powiadomienia
  type: {
    type: String,
    enum: ['reservation_new', 'reservation_confirmed', 'reservation_cancelled', 'reservation_updated', 'system'],
    required: [true, 'Typ powiadomienia jest wymagany'],
    default: 'reservation_new'
  },
  // Tytuł powiadomienia
  title: {
    type: String,
    required: [true, 'Tytuł jest wymagany'],
    trim: true
  },
  // Treść powiadomienia
  message: {
    type: String,
    required: [true, 'Treść powiadomienia jest wymagana'],
    trim: true
  },
  // Powiązana rezerwacja (jeśli dotyczy)
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  // Lokal związany z powiadomieniem
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  // Dla kogo jest powiadomienie (null = dla wszystkich adminów)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  // Czy powiadomienie zostało odczytane
  isRead: {
    type: Boolean,
    default: false
  },
  // Kiedy zostało odczytane
  readAt: {
    type: Date
  },
  // Kto odczytał
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  // Dodatkowe dane (np. dane klienta, szczegóły rezerwacji)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indeksy dla szybkiego wyszukiwania
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ location: 1, createdAt: -1 });
notificationSchema.index({ reservation: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
