const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Lokal jest wymagany']
  },
  tableNumber: {
    type: Number,
    required: [true, 'Numer stolika jest wymagany']
  },
  seats: {
    type: Number,
    required: [true, 'Liczba miejsc jest wymagana'],
    min: [1, 'Stolik musi mieć minimum 1 miejsce'],
    max: [20, 'Stolik może mieć maksimum 20 miejsc']
  },
  zone: {
    type: String,
    enum: ['sala_glowna', 'ogrodek', 'vip', 'bar'],
    default: 'sala_glowna'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Unikalny numer stolika w ramach lokalu
tableSchema.index({ location: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
