const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');

// Załaduj zmienne środowiskowe
dotenv.config();

// Walidacja wymaganych zmiennych środowiskowych
if (!process.env.JWT_SECRET) {
  console.error('❌ BŁĄD: JWT_SECRET nie jest ustawione!');
  process.exit(1);
}
if (!process.env.JWT_REFRESH_SECRET) {
  console.error('❌ BŁĄD: JWT_REFRESH_SECRET nie jest ustawione!');
  console.error('   Dodaj JWT_REFRESH_SECRET do pliku .env');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('❌ BŁĄD: MONGODB_URI nie jest ustawione!');
  process.exit(1);
}

// Połącz z bazą danych
connectDB();

// Inicjalizuj Web Push Notifications
const pushService = require('./services/pushNotification.service');
pushService.initialize();

// Inicjalizuj Email Service (Resend)
const emailService = require('./services/emailService');
emailService.initializeResend();

const app = express();

// Trust proxy - wymagane dla Render (używa X-Forwarded-For)
// MUSI być przed wszystkimi middleware, szczególnie przed rate limitingiem
app.set('trust proxy', 1);

// Security headers - Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false // Wyłącz dla API
}));

// Compression
app.use(compression());

// MongoDB injection protection
app.use(mongoSanitize());

// Middleware CORS
// Obsługuje zarówno lokalny development jak i produkcję (Vercel)
const allowedOrigins = [
  'http://localhost:4200', // Local development
  process.env.FRONTEND_URL   // Production (Vercel)
].filter(Boolean); // Usuwa undefined wartości

// Wzorzec dla Vercel preview deployments (np. res-abc123-maniek-wqs-projects.vercel.app)
const vercelPreviewPattern = /^https:\/\/res-[a-z0-9]+-maniek-wqs-projects\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    // Pozwól na requesty bez origin (np. Postman, curl, direct API calls, mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    // Sprawdź czy origin jest na liście dozwolonych
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Sprawdź czy origin pasuje do wzorca Vercel preview deployments
    if (vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }
    
    // W development (gdy FRONTEND_URL nie jest ustawione) pozwól na wszystko
    if (!process.env.FRONTEND_URL || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // W produkcji - BLOKUJ nieznane originy
    console.warn(`⚠️ CORS: Blocked request from unknown origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
// Body parser z limitami
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint - informacja o API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Restauracja Złota API',
    version: '1.0.0',
      endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      locations: '/api/locations',
      reservations: '/api/reservations',
      tables: '/api/tables',
      menu: '/api/menu',
      dailyReports: '/api/daily-reports',
      notifications: '/api/notifications'
    }
  });
});

// Routes
// UWAGA: Route /api/seed musi być przed innymi route'ami z parametrami dynamicznymi
app.use('/api/seed', require('./routes/seed'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/daily-reports', require('./routes/dailyReports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/push', require('./routes/push'));

// Health check
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: dbStatus === 'connected' ? 'ok' : 'error',
    message: 'Restauracja API działa',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint nie znaleziony'
  });
});

// Error handler
app.use((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Loguj pełny błąd tylko w development
  if (isDevelopment) {
    console.error('Error:', err);
  } else {
    // W produkcji loguj tylko podstawowe informacje
    console.error('Error:', {
      message: err.message,
      status: err.status || 500,
      path: req.path,
      method: req.method
    });
  }
  
  // Nie ujawniaj szczegółów błędów w produkcji
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Błąd serwera',
    ...(isDevelopment && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});
