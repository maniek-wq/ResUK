const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Lokal jest wymagany']
  },
  date: {
    type: Date,
    required: [true, 'Data jest wymagana']
  },
  // Przychód
  revenue: {
    type: Number,
    required: [true, 'Przychód jest wymagany'],
    min: [0, 'Przychód nie może być ujemny']
  },
  currency: {
    type: String,
    default: 'PLN',
    maxlength: 3
  },
  // Statystyki
  statistics: {
    // Liczba gości
    totalGuests: {
      type: Number,
      min: 0,
      default: 0
    },
    // Liczba rezerwacji
    totalReservations: {
      type: Number,
      min: 0,
      default: 0
    },
    // Liczba stolików zajętych
    tablesOccupied: {
      type: Number,
      min: 0
    },
    // Średnia liczba gości na rezerwację
    averageGuestsPerReservation: {
      type: Number,
      min: 0
    },
    // Średni przychód na gościa
    averageRevenuePerGuest: {
      type: Number,
      min: 0
    },
    // Liczba rezerwacji potwierdzonych
    confirmedReservations: {
      type: Number,
      min: 0,
      default: 0
    },
    // Liczba rezerwacji anulowanych
    cancelledReservations: {
      type: Number,
      min: 0,
      default: 0
    },
    // Liczba rezerwacji ukończonych
    completedReservations: {
      type: Number,
      min: 0,
      default: 0
    },
    // Dodatkowe notatki
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  // Kto dodał raport (manager/admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  // Kto ostatnio edytował
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Unikalny raport dla lokalu w danym dniu
dailyReportSchema.index({ location: 1, date: 1 }, { unique: true });

// Indeks dla szybkiego wyszukiwania
dailyReportSchema.index({ location: 1, date: -1 });
dailyReportSchema.index({ date: -1 });

// Virtual dla formatowanego przychodu
dailyReportSchema.virtual('formattedRevenue').get(function() {
  return `${this.revenue.toFixed(2)} ${this.currency}`;
});

module.exports = mongoose.model('DailyReport', dailyReportSchema);
