const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../controllers/seedController');

// Endpoint do seedowania (tylko w development lub z specjalnym tokenem)
// W produkcji powinien być chroniony!
router.post('/seed', async (req, res) => {
  try {
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
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas seedowania',
      error: error.message
    });
  }
});

module.exports = router;
