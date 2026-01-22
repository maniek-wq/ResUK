const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Załaduj zmienne środowiskowe
dotenv.config();

// Połącz z bazą danych
connectDB();

const app = express();

// Middleware CORS
// Obsługuje zarówno lokalny development jak i produkcję (Vercel)
const allowedOrigins = [
  'http://localhost:4200', // Local development
  process.env.FRONTEND_URL   // Production (Vercel)
].filter(Boolean); // Usuwa undefined wartości

app.use(cors({
  origin: function (origin, callback) {
    // Pozwól na requesty bez origin (np. Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Sprawdź czy origin jest na liście dozwolonych
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/daily-reports', require('./routes/dailyReports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Restauracja API działa',
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
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Błąd serwera'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});
