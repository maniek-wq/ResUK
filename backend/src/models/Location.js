const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nazwa lokalu jest wymagana'],
    trim: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Ulica jest wymagana']
    },
    city: {
      type: String,
      required: [true, 'Miasto jest wymagane'],
      default: 'Warszawa'
    },
    postalCode: {
      type: String,
      required: [true, 'Kod pocztowy jest wymagany']
    }
  },
  phone: {
    type: String,
    required: [true, 'Numer telefonu jest wymagany']
  },
  email: {
    type: String,
    required: [true, 'Email jest wymagany']
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  totalTables: {
    type: Number,
    required: true,
    default: 10
  },
  maxCapacity: {
    type: Number,
    required: true,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Location', locationSchema);
