const axios = require('axios');

/**
 * Middleware do weryfikacji Google reCAPTCHA v3
 * Weryfikuje token CAPTCHA przed przetworzeniem requestu
 */
const verifyRecaptcha = async (req, res, next) => {
  // Jeśli CAPTCHA nie jest wymagana (np. w development), pomiń weryfikację
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_RECAPTCHA === 'true') {
    return next();
  }

  const recaptchaToken = req.body.recaptchaToken;

  // Jeśli brak tokenu, zwróć błąd
  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'Weryfikacja CAPTCHA jest wymagana. Odśwież stronę i spróbuj ponownie.',
      requiresCaptcha: true
    });
  }

  // Jeśli brak klucza secret, pomiń weryfikację (ale loguj ostrzeżenie)
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.warn('⚠️ RECAPTCHA_SECRET_KEY nie jest ustawione - pomijam weryfikację CAPTCHA');
    return next();
  }

  try {
    // Weryfikuj token z Google
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await axios.post(verificationUrl, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
        remoteip: req.ip
      },
      timeout: 5000 // 5 sekund timeout
    });

    const { success, score, action, 'error-codes': errorCodes } = response.data;

    // Sprawdź czy weryfikacja się powiodła
    if (!success) {
      console.warn('❌ CAPTCHA verification failed:', errorCodes);
      return res.status(400).json({
        success: false,
        message: 'Weryfikacja CAPTCHA nie powiodła się. Odśwież stronę i spróbuj ponownie.',
        requiresCaptcha: true
      });
    }

    // Dla reCAPTCHA v3 sprawdź score (0.0 - 1.0, gdzie 1.0 = prawdopodobnie człowiek)
    // Domyślny próg: 0.5 (można dostosować w zmiennych środowiskowych)
    const scoreThreshold = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD || '0.5');
    
    if (score < scoreThreshold) {
      console.warn(`⚠️ CAPTCHA score too low: ${score} (threshold: ${scoreThreshold})`);
      return res.status(400).json({
        success: false,
        message: 'Weryfikacja CAPTCHA nie powiodła się. Odśwież stronę i spróbuj ponownie.',
        requiresCaptcha: true
      });
    }

    // Sprawdź czy action się zgadza (opcjonalnie)
    if (action && action !== 'login') {
      console.warn(`⚠️ CAPTCHA action mismatch: expected 'login', got '${action}'`);
      // Nie blokuj, ale loguj ostrzeżenie
    }

    // Weryfikacja zakończona pomyślnie
    next();
  } catch (error) {
    console.error('❌ CAPTCHA verification error:', error.message);
    
    // W przypadku błędu sieci, pozwól na kontynuację (aby nie blokować użytkowników)
    // W produkcji możesz chcieć być bardziej restrykcyjny
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        message: 'Błąd weryfikacji CAPTCHA. Spróbuj ponownie za chwilę.',
        requiresCaptcha: true
      });
    }
    
    // W development, pomiń weryfikację przy błędzie
    next();
  }
};

/**
 * Middleware do weryfikacji CAPTCHA tylko gdy wymagana
 * Używa informacji z rate limitera, aby określić czy CAPTCHA jest wymagana
 */
const verifyRecaptchaIfRequired = async (req, res, next) => {
  // Sprawdź czy CAPTCHA jest wymagana (np. po 3 nieudanych próbach)
  // Możesz użyć informacji z rate limitera lub własnego mechanizmu śledzenia
  
  // Dla uproszczenia, zawsze wymagaj CAPTCHA dla logowania
  // W przyszłości możesz dodać logikę: CAPTCHA tylko po X nieudanych próbach
  return verifyRecaptcha(req, res, next);
};

module.exports = {
  verifyRecaptcha,
  verifyRecaptchaIfRequired
};
