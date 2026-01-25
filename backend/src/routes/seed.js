const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../controllers/seedController');
const { writeLimiter } = require('../middleware/rateLimiter');

// Endpoint do seedowania (tylko w development lub z specjalnym tokenem)
// W produkcji wyłączony dla bezpieczeństwa
// UWAGA: Route jest /seed, ale w server.js jest już /api/seed, więc tutaj tylko '/'
router.post('/', writeLimiter, async (req, res) => {
  try {
    // W produkcji - całkowicie wyłącz seedowanie
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Seedowanie wyłączone w produkcji'
      });
    }
    
    // Prosta ochrona - sprawdź czy jest specjalny token w body
    const { seedToken } = req.body;
    const expectedToken = process.env.SEED_TOKEN;
    
    // Jeśli SEED_TOKEN nie jest ustawiony, nie pozwól na seedowanie
    if (!expectedToken) {
      return res.status(403).json({
        success: false,
        message: 'Seedowanie nie jest skonfigurowane. Ustaw SEED_TOKEN w zmiennych środowiskowych.'
      });
    }
    
    if (seedToken !== expectedToken) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy token seedowania'
      });
    }
    
    await seedDatabase();
    
    res.json({
      success: true,
      message: 'Baza danych została zaseedowana'
    });
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.error('Seed error:', isDevelopment ? error : error.message);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas seedowania',
      ...(isDevelopment && { error: error.message })
    });
  }
});

module.exports = router;
