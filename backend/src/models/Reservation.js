const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Lokal jest wymagany']
  },
  // Typ rezerwacji: stolik/stoliki, wydarzenie, cały lokal
  type: {
    type: String,
    enum: ['table', 'event', 'full_venue'],
    required: [true, 'Typ rezerwacji jest wymagany'],
    default: 'table'
  },
  // Dla rezerwacji stolików
  tables: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  }],
  // Dane klienta
  customer: {
    firstName: {
      type: String,
      required: [true, 'Imię jest wymagane'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Nazwisko jest wymagane'],
      trim: true
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Numer telefonu jest wymagany']
    }
  },
  // Data i czas
  date: {
    type: Date,
    required: [true, 'Data rezerwacji jest wymagana']
  },
  timeSlot: {
    start: {
      type: String,
      required: [true, 'Godzina rozpoczęcia jest wymagana']
    },
    end: {
      type: String,
      required: [true, 'Godzina zakończenia jest wymagana']
    }
  },
  // Liczba gości
  guests: {
    type: Number,
    required: [true, 'Liczba gości jest wymagana'],
    min: [1, 'Minimum 1 gość']
  },
  // Dla wydarzeń
  eventDetails: {
    name: String,
    description: String,
    specialRequirements: String
  },
  // Status rezerwacji
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  // Notatki
  notes: {
    type: String,
    trim: true
  },
  // Kto potwierdził (admin)
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  confirmedAt: {
    type: Date
  },
  // Audyt - kto utworzył rezerwację
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  // Audyt - kto ostatnio edytował
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  // Historia zmian statusu
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    reason: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Indeksy dla szybkiego wyszukiwania
reservationSchema.index({ location: 1, date: 1 });
reservationSchema.index({ 'customer.email': 1 });
reservationSchema.index({ status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
