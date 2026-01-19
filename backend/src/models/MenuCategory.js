const mongoose = require('mongoose');

const menuCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nazwa kategorii jest wymagana'],
    trim: true,
    minlength: [2, 'Nazwa musi mieć minimum 2 znaki'],
    maxlength: [50, 'Nazwa może mieć maksimum 50 znaków']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Opis może mieć maksimum 200 znaków']
  },
  order: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Kolejność musi być liczbą dodatnią lub zero']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indeksy
menuCategorySchema.index({ order: 1 });
menuCategorySchema.index({ isActive: 1 });

// Virtual - liczba pozycji w kategorii
menuCategorySchema.virtual('itemCount', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual - aktywne pozycje
menuCategorySchema.virtual('activeItemCount', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'category',
  count: true,
  match: { isAvailable: true }
});

// Aktualizuj updatedAt przed zapisem
menuCategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MenuCategory', menuCategorySchema);
