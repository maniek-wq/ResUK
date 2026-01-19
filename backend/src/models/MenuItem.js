const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory',
    required: [true, 'Kategoria jest wymagana']
  },
  name: {
    type: String,
    required: [true, 'Nazwa dania jest wymagana'],
    trim: true,
    minlength: [2, 'Nazwa musi mieć minimum 2 znaki'],
    maxlength: [100, 'Nazwa może mieć maksimum 100 znaków']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Opis może mieć maksimum 500 znaków']
  },
  price: {
    type: Number,
    required: [true, 'Cena jest wymagana'],
    min: [0.01, 'Cena musi być większa od zera'],
    max: [9999.99, 'Cena nie może przekraczać 9999.99']
  },
  currency: {
    type: String,
    default: 'PLN',
    uppercase: true
  },
  tags: [{
    type: String,
    enum: ['vege', 'ostre', 'szef poleca', 'gluten-free', 'wegańskie', 'wegetariańskie', 'bez laktozy'],
    lowercase: true
  }],
  allergens: [{
    type: String,
    enum: ['gluten', 'laktoza', 'orzechy', 'jaja', 'ryby', 'skorupiaki', 'soja', 'seler', 'gorczyca', 'sezam']
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Kolejność musi być liczbą dodatnią lub zero']
  },
  prepTime: {
    type: Number,
    min: [1, 'Czas przygotowania musi być minimum 1 minuta'],
    max: [300, 'Czas przygotowania nie może przekraczać 300 minut']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indeksy
menuItemSchema.index({ category: 1, order: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ tags: 1 });
menuItemSchema.index({ 'name': 'text', 'description': 'text' }); // Wyszukiwanie pełnotekstowe

// Virtual - formatowana cena
menuItemSchema.virtual('formattedPrice').get(function() {
  return `${this.price.toFixed(2)} ${this.currency}`;
});

// Aktualizuj updatedAt przed zapisem
menuItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware - ustawienie kolejności jeśli nie podano
menuItemSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const maxOrder = await mongoose.model('MenuItem')
      .findOne({ category: this.category })
      .sort({ order: -1 })
      .select('order');
    
    this.order = maxOrder ? maxOrder.order + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
