const rateLimit = require('express-rate-limit');

// Rate limiting dla endpointów publicznych (rezerwacje, menu)
// UWAGA: Trust proxy MUSI być ustawione w server.js PRZED użyciem rate limitingu
// Trust proxy jest ustawione w server.js (linia 15), więc rate limiting będzie działał poprawnie
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // maksymalnie 100 requestów na IP w oknie czasowym
  message: {
    success: false,
    message: 'Zbyt wiele requestów z tego adresu IP. Spróbuj ponownie za 15 minut.'
  },
  standardHeaders: true, // Zwraca informacje o limicie w nagłówkach `RateLimit-*`
  legacyHeaders: false // Wyłącza nagłówki `X-RateLimit-*`
});

// Rate limiting dla logowania (bardziej restrykcyjny)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuta (dla testów - zmień na 15 minut w produkcji)
  max: 5, // maksymalnie 5 prób logowania na IP w oknie czasowym
  message: {
    success: false,
    message: 'Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.'
  },
  skipSuccessfulRequests: false, // Liczy wszystkie próby (również nieudane)
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting dla endpointów admin/manager (umiarkowany)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 200, // maksymalnie 200 requestów na IP w oknie czasowym
  message: {
    success: false,
    message: 'Zbyt wiele requestów. Spróbuj ponownie za 15 minut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Użyj user ID zamiast IP dla zalogowanych użytkowników
  keyGenerator: (req) => {
    // Jeśli użytkownik jest zalogowany, użyj jego ID
    if (req.admin && req.admin._id) {
      return req.admin._id.toString();
    }
    // W przeciwnym razie użyj IP
    return req.ip;
  }
});

// Rate limiting dla operacji zapisu (POST, PUT, PATCH, DELETE) - bardziej restrykcyjny
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 50, // maksymalnie 50 operacji zapisu na IP w oknie czasowym
  message: {
    success: false,
    message: 'Zbyt wiele operacji zapisu. Spróbuj ponownie za 15 minut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.admin && req.admin._id) {
      return req.admin._id.toString();
    }
    return req.ip;
  }
});

module.exports = {
  publicLimiter,
  loginLimiter,
  adminLimiter,
  writeLimiter
};
