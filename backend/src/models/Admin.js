const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Hasło jest wymagane'],
    minlength: [12, 'Hasło musi mieć minimum 12 znaków'],
    validate: {
      validator: function(v) {
        // Wymagania: min. 12 znaków, wielka litera, mała litera, cyfra, znak specjalny
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(v);
      },
      message: 'Hasło musi zawierać: minimum 12 znaków, wielką literę, małą literę, cyfrę i znak specjalny (@$!%*?&)'
    },
    select: false // Domyślnie nie pobieraj hasła
  },
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
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff'],
    default: 'staff'
  },
  // Dostęp do lokali (puste = wszystkie)
  locations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Push subscriptions dla Web Push Notifications
  pushSubscriptions: [{
    endpoint: {
      type: String,
      required: true
    },
    keys: {
      p256dh: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      }
    },
    deviceInfo: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash hasła przed zapisem
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metoda do porównania haseł
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Metoda do uzyskania pełnego imienia
adminSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

module.exports = mongoose.model('Admin', adminSchema);
