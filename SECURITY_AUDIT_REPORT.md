# 🔒 Raport Audytu Bezpieczeństwa - Restauracja Złota

**Data audytu:** 2024  
**Wersja aplikacji:** 1.0.0  
**Status:** ⚠️ WYMAGA POPRAWEK

---

## 📋 Spis treści

1. [Podsumowanie wykonawcze](#podsumowanie)
2. [Krytyczne problemy bezpieczeństwa](#krytyczne)
3. [Wysokie ryzyko](#wysokie)
4. [Średnie ryzyko](#srednie)
5. [Niskie ryzyko](#niskie)
6. [Rekomendacje naprawy](#rekomendacje)
7. [Checklist implementacji](#checklist)

---

## 1. PODSUMOWANIE WYKONAWCZE {#podsumowanie}

### Statystyki:
- **Krytyczne problemy:** 5
- **Wysokie ryzyko:** 8
- **Średnie ryzyko:** 6
- **Niskie ryzyko:** 4
- **Ogólna ocena:** ⚠️ **WYMAGA NATYCHMIASTOWYCH POPRAWEK**

### Główne obszary problemów:
1. ❌ CORS pozwala na wszystkie originy w produkcji
2. ❌ Brak middleware bezpieczeństwa (Helmet)
3. ❌ Ujawnianie szczegółów błędów w produkcji
4. ❌ Słaba walidacja haseł
5. ❌ Brak ochrony przed XSS/CSRF
6. ❌ Logowanie wrażliwych danych
7. ❌ Brak refresh tokenów
8. ❌ Endpoint seedowania dostępny publicznie

---

## 2. KRYTYCZNE PROBLEMY BEZPIECZEŃSTWA {#krytyczne}

### 🔴 **KRYTYCZNE #1: CORS pozwala na wszystkie originy w produkcji**

**Lokalizacja:** `backend/src/server.js:47-55`

**Problem:**
```javascript
// W produkcji - loguj ale pozwól (dla debugowania)
// TODO: W produkcji powinno blokować nieznane originy
console.log(`CORS: Unknown origin: ${origin}, allowing for now`);
return callback(null, true);

// W produkcji blokuj nieznane originy (odkomentuj po testach)
// callback(new Error('Not allowed by CORS'));
```

**Ryzyko:**
- Każda strona może wykonać requesty do API
- Możliwość ataków CSRF
- Kradzież danych użytkowników
- Nieautoryzowany dostęp do API

**Rozwiązanie:**
```javascript
// W produkcji - BLOKUJ nieznane originy
if (!process.env.FRONTEND_URL) {
  return callback(null, true); // Tylko w development
}

if (allowedOrigins.indexOf(origin) !== -1) {
  return callback(null, true);
}

// BLOKUJ nieznane originy w produkcji
callback(new Error('Not allowed by CORS'));
```

**Priorytet:** 🔴 **NATYCHMIAST**

---

### 🔴 **KRYTYCZNE #2: Brak middleware bezpieczeństwa (Helmet)**

**Lokalizacja:** `backend/src/server.js` - brak importu Helmet

**Problem:**
- Brak nagłówków bezpieczeństwa HTTP
- Brak ochrony przed XSS
- Brak ochrony przed clickjacking
- Brak ochrony przed MIME type sniffing

**Ryzyko:**
- Ataki XSS
- Clickjacking
- MIME type confusion attacks

**Rozwiązanie:**
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

**Priorytet:** 🔴 **NATYCHMIAST**

---

### 🔴 **KRYTYCZNE #3: Ujawnianie szczegółów błędów w produkcji**

**Lokalizacja:** `backend/src/server.js:115-121`, `backend/src/routes/seed.js:36-41`

**Problem:**
```javascript
// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Błąd serwera'  // ❌ Ujawnia szczegóły
  });
});
```

**Ryzyko:**
- Ujawnianie struktury bazy danych
- Ujawnianie ścieżek plików
- Ujawnianie logiki aplikacji
- Ułatwia ataki

**Rozwiązanie:**
```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Błąd serwera',
    ...(isDevelopment && { stack: err.stack })
  });
});
```

**Priorytet:** 🔴 **NATYCHMIAST**

---

### 🔴 **KRYTYCZNE #4: Endpoint seedowania dostępny publicznie**

**Lokalizacja:** `backend/src/routes/seed.js:8-43`

**Problem:**
- Endpoint `/api/seed` jest dostępny publicznie
- Ochrona tylko przez `SEED_TOKEN` w body (słaba)
- Może być użyty do ataku DoS (wypełnienie bazy danych)

**Ryzyko:**
- Atak DoS przez wypełnienie bazy danych
- Nadpisanie danych produkcyjnych
- Usunięcie danych

**Rozwiązanie:**
```javascript
// 1. Wyłącz w produkcji
if (process.env.NODE_ENV === 'production') {
  router.post('/', (req, res) => {
    return res.status(403).json({
      success: false,
      message: 'Seedowanie wyłączone w produkcji'
    });
  });
}

// 2. Dodaj rate limiting
router.post('/', writeLimiter, async (req, res) => {
  // ...
});

// 3. Dodaj IP whitelist (opcjonalnie)
const allowedIPs = process.env.SEED_ALLOWED_IPS?.split(',') || [];
if (allowedIPs.length > 0 && !allowedIPs.includes(req.ip)) {
  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
}
```

**Priorytet:** 🔴 **NATYCHMIAST**

---

### 🔴 **KRYTYCZNE #5: Logowanie wrażliwych danych**

**Lokalizacja:** `backend/src/controllers/authController.js:28-53`

**Problem:**
```javascript
console.log(`🔍 Login attempt for email: "${email}" (normalized: "${normalizedEmail}")`);
console.log(`✅ Admin found: ${admin.email} (ID: ${admin._id})`);
console.log(`📋 All admins in database:`, allAdmins.map(a => a.email));
```

**Ryzyko:**
- Emails adminów w logach (może być dostępne publicznie)
- ID użytkowników w logach
- Ułatwia ataki brute force
- Naruszenie RODO/GDPR

**Rozwiązanie:**
```javascript
// Usuń logowanie wrażliwych danych w produkcji
if (process.env.NODE_ENV === 'development') {
  console.log(`🔍 Login attempt for email: "${email}"`);
}

// NIE loguj:
// - Emaili użytkowników
// - ID użytkowników
// - Haszy haseł
// - Tokenów JWT
```

**Priorytet:** 🔴 **NATYCHMIAST**

---

## 3. WYSOKIE RYZYKO {#wysokie}

### 🟠 **WYSOKIE #1: Słaba walidacja haseł**

**Lokalizacja:** `backend/src/models/Admin.js:15`, `backend/src/controllers/authController.js:155`

**Problem:**
```javascript
minlength: [8, 'Hasło musi mieć minimum 8 znaków']
// ❌ Brak wymagań dotyczących:
// - Wielkich liter
// - Małych liter
// - Cyfr
// - Znaków specjalnych
```

**Ryzyko:**
- Słabe hasła łatwe do złamania
- Ataki brute force
- Kompromitacja kont

**Rozwiązanie:**
```javascript
// W modelu Admin.js
password: {
  type: String,
  required: [true, 'Hasło jest wymagane'],
  minlength: [12, 'Hasło musi mieć minimum 12 znaków'],
  validate: {
    validator: function(v) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(v);
    },
    message: 'Hasło musi zawierać: min. 12 znaków, wielką literę, małą literę, cyfrę i znak specjalny'
  },
  select: false
}
```

**Priorytet:** 🟠 **WYSOKIE**

---

### 🟠 **WYSOKIE #2: Brak refresh tokenów**

**Lokalizacja:** `backend/src/controllers/authController.js:5-8`

**Problem:**
- Tylko access token (7 dni)
- Brak mechanizmu odświeżania tokenów
- Długi czas życia tokenu (7 dni)

**Ryzyko:**
- Skradziony token działa przez 7 dni
- Brak możliwości unieważnienia tokenu
- Kompromitacja konta

**Rozwiązanie:**
```javascript
// 1. Skróć czas życia access tokenu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m' // 15 minut
  });
};

// 2. Dodaj refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

// 3. Zapisz refresh token w bazie (z możliwością unieważnienia)
```

**Priorytet:** 🟠 **WYSOKIE**

---

### 🟠 **WYSOKIE #3: Brak ochrony przed XSS**

**Lokalizacja:** Wszystkie endpointy przyjmujące dane użytkownika

**Problem:**
- Brak sanitizacji danych wejściowych
- Brak escape'owania danych wyjściowych
- Możliwość wstrzyknięcia skryptów

**Ryzyko:**
- Ataki XSS
- Kradzież sesji
- Manipulacja danymi

**Rozwiązanie:**
```bash
npm install express-validator express-mongo-sanitize
```

```javascript
const mongoSanitize = require('express-mongo-sanitize');

// Sanityzacja MongoDB
app.use(mongoSanitize());

// W validators - dodaj escape
body('firstName')
  .trim()
  .escape() // Escape HTML
  .notEmpty()
```

**Priorytet:** 🟠 **WYSOKIE**

---

### 🟠 **WYSOKIE #4: Brak ochrony przed CSRF**

**Lokalizacja:** Wszystkie endpointy modyfikujące dane

**Problem:**
- Brak tokenów CSRF
- CORS pozwala na wszystkie originy
- Brak weryfikacji origin

**Ryzyko:**
- Ataki CSRF
- Nieautoryzowane akcje
- Manipulacja danymi

**Rozwiązanie:**
```bash
npm install csurf
```

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Dla operacji modyfikujących
app.use('/api', csrfProtection);
```

**Priorytet:** 🟠 **WYSOKIE**

---

### 🟠 **WYSOKIE #5: Rate limiting dla logowania zbyt słaby**

**Lokalizacja:** `backend/src/middleware/rateLimiter.js:18-28`

**Problem:**
```javascript
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuta (dla testów - zmień na 15 minut w produkcji)
  max: 5, // maksymalnie 5 prób logowania
  // ...
});
```

**Ryzyko:**
- Ataki brute force
- Kompromitacja kont
- DoS

**Rozwiązanie:**
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // 5 prób
  skipSuccessfulRequests: true, // Nie licz udanych logowań
  standardHeaders: true,
  legacyHeaders: false,
  // Blokuj IP po przekroczeniu limitu
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.',
      retryAfter: Math.ceil(15 * 60)
    });
  }
});
```

**Priorytet:** 🟠 **WYSOKIE**

---

### 🟠 **WYSOKIE #6: Brak walidacji długości danych wejściowych**

**Lokalizacja:** `backend/src/middleware/validators.js`

**Problem:**
- Niektóre pola nie mają limitu długości
- Możliwość ataków DoS przez duże payloady
- Możliwość przepełnienia bazy danych

**Ryzyko:**
- Ataki DoS
- Przepełnienie bazy danych
- Problemy z wydajnością

**Rozwiązanie:**
```javascript
// Dodaj limity długości do wszystkich pól
body('firstName')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Imię musi mieć 2-50 znaków'),

// Dodaj limit rozmiaru body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

**Priorytet:** 🟠 **WYSOKIE**

---

### 🟠 **WYSOKIE #7: Brak weryfikacji email**

**Lokalizacja:** `backend/src/models/Admin.js:5-11`

**Problem:**
- Brak weryfikacji email przy rejestracji
- Możliwość użycia nieistniejących emaili
- Brak potwierdzenia email

**Ryzyko:**
- Fałszywe konta
- Problemy z odzyskiwaniem hasła
- Spam

**Rozwiązanie:**
```javascript
// Dodaj pole emailVerified
emailVerified: {
  type: Boolean,
  default: false
},

// Dodaj endpoint weryfikacji
// Wysyłaj email z tokenem weryfikacyjnym
```

**Priorytet:** 🟠 **WYSOKIE**

---

### 🟠 **WYSOKIE #8: Brak logowania operacji bezpieczeństwa**

**Lokalizacja:** Wszystkie endpointy autoryzacji

**Problem:**
- Brak logowania prób logowania
- Brak logowania zmian hasła
- Brak logowania operacji admina

**Ryzyko:**
- Brak możliwości wykrycia ataków
- Brak audytu bezpieczeństwa
- Trudności w śledzeniu incydentów

**Rozwiązanie:**
```javascript
// Dodaj middleware logowania
const auditLog = (req, res, next) => {
  if (req.path.includes('/auth/login')) {
    console.log(`[AUDIT] Login attempt: ${req.ip} at ${new Date().toISOString()}`);
  }
  if (req.path.includes('/auth/password')) {
    console.log(`[AUDIT] Password change: ${req.admin?.email} at ${new Date().toISOString()}`);
  }
  next();
};

app.use(auditLog);
```

**Priorytet:** 🟠 **WYSOKIE**

---

## 4. ŚREDNIE RYZYKO {#srednie}

### 🟡 **ŚREDNIE #1: Brak HTTPS enforcement**

**Lokalizacja:** `backend/src/server.js`

**Problem:**
- Brak wymuszania HTTPS
- Możliwość ataków man-in-the-middle
- Przechwytywanie danych

**Rozwiązanie:**
```javascript
// W produkcji wymuś HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

**Priorytet:** 🟡 **ŚREDNIE**

---

### 🟡 **ŚREDNIE #2: Brak timeout dla requestów**

**Lokalizacja:** `backend/src/server.js`

**Problem:**
- Brak timeout dla długich requestów
- Możliwość ataków DoS

**Rozwiązanie:**
```bash
npm install express-timeout-handler
```

```javascript
const timeout = require('express-timeout-handler');

app.use(timeout.handler({
  timeout: 30000, // 30 sekund
  onTimeout: (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Request timeout'
    });
  }
}));
```

**Priorytet:** 🟡 **ŚREDNIE**

---

### 🟡 **ŚREDNIE #3: Brak walidacji MongoDB ObjectId**

**Lokalizacja:** `backend/src/middleware/validators.js:69-73`

**Problem:**
- Walidacja tylko w niektórych miejscach
- Możliwość ataków NoSQL injection

**Rozwiązanie:**
```javascript
// Użyj mongoSanitize (już w WYSOKIE #3)
// Dodaj walidację wszędzie gdzie używasz ObjectId
```

**Priorytet:** 🟡 **ŚREDNIE**

---

### 🟡 **ŚREDNIE #4: Brak rate limiting dla endpointu seed**

**Lokalizacja:** `backend/src/routes/seed.js`

**Problem:**
- Endpoint seed nie ma rate limitingu
- Możliwość ataków DoS

**Rozwiązanie:**
```javascript
router.post('/', writeLimiter, async (req, res) => {
  // ...
});
```

**Priorytet:** 🟡 **ŚREDNIE**

---

### 🟡 **ŚREDNIE #5: Brak walidacji typów danych**

**Lokalizacja:** Wszystkie endpointy

**Problem:**
- Niektóre pola nie mają walidacji typu
- Możliwość wstrzyknięcia nieprawidłowych danych

**Rozwiązanie:**
```javascript
// Dodaj walidację typu do wszystkich pól
body('guests')
  .isInt({ min: 1, max: 200 })
  .withMessage('Liczba gości musi być liczbą całkowitą 1-200'),
```

**Priorytet:** 🟡 **ŚREDNIE**

---

### 🟡 **ŚREDNIE #6: Brak ochrony przed enumeration attacks**

**Lokalizacja:** `backend/src/controllers/authController.js:47-50`

**Problem:**
- Różne komunikaty dla nieistniejącego użytkownika i złego hasła
- Możliwość wyliczenia istniejących użytkowników

**Rozwiązanie:**
```javascript
// Zawsze zwracaj ten sam komunikat
return res.status(401).json({
  success: false,
  message: 'Nieprawidłowy email lub hasło'
});
```

**Priorytet:** 🟡 **ŚREDNIE**

---

## 5. NISKIE RYZYKO {#niskie}

### 🟢 **NISKIE #1: Brak wersjonowania API**

**Lokalizacja:** `backend/src/server.js`

**Problem:**
- Brak wersjonowania endpointów
- Trudności w aktualizacji API

**Rozwiązanie:**
```javascript
app.use('/api/v1', require('./routes/auth'));
```

**Priorytet:** 🟢 **NISKIE**

---

### 🟢 **NISKIE #2: Brak health check z szczegółami**

**Lokalizacja:** `backend/src/server.js:98-104`

**Problem:**
- Podstawowy health check
- Brak informacji o stanie bazy danych

**Rozwiązanie:**
```javascript
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'error',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});
```

**Priorytet:** 🟢 **NISKIE**

---

### 🟢 **NISKIE #3: Brak kompresji odpowiedzi**

**Lokalizacja:** `backend/src/server.js`

**Problem:**
- Brak kompresji odpowiedzi
- Większe zużycie bandwidth

**Rozwiązanie:**
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

**Priorytet:** 🟢 **NISKIE**

---

### 🟢 **NISKIE #4: Brak cache headers**

**Lokalizacja:** Wszystkie endpointy GET

**Problem:**
- Brak cache headers
- Niepotrzebne requesty

**Rozwiązanie:**
```javascript
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=3600');
  }
  next();
});
```

**Priorytet:** 🟢 **NISKIE**

---

## 6. REKOMENDACJE NAPRAWY {#rekomendacje}

### Priorytet 1 (NATYCHMIAST):
1. ✅ Napraw CORS - blokuj nieznane originy w produkcji
2. ✅ Dodaj Helmet middleware
3. ✅ Ukryj szczegóły błędów w produkcji
4. ✅ Zabezpiecz endpoint seedowania
5. ✅ Usuń logowanie wrażliwych danych

### Priorytet 2 (WYSOKIE):
6. ✅ Wzmocnij walidację haseł
7. ✅ Dodaj refresh tokeny
8. ✅ Dodaj ochronę przed XSS
9. ✅ Dodaj ochronę przed CSRF
10. ✅ Wzmocnij rate limiting dla logowania
11. ✅ Dodaj walidację długości danych
12. ✅ Dodaj weryfikację email
13. ✅ Dodaj logowanie operacji bezpieczeństwa

### Priorytet 3 (ŚREDNIE):
14. ✅ Wymuś HTTPS w produkcji
15. ✅ Dodaj timeout dla requestów
16. ✅ Dodaj rate limiting dla seed
17. ✅ Dodaj walidację typów danych
18. ✅ Ochrona przed enumeration attacks

### Priorytet 4 (NISKIE):
19. ✅ Dodaj wersjonowanie API
20. ✅ Ulepsz health check
21. ✅ Dodaj kompresję
22. ✅ Dodaj cache headers

---

## 7. CHECKLIST IMPLEMENTACJI {#checklist}

### Backend - Bezpieczeństwo:

- [ ] **CORS:** Napraw konfigurację - blokuj nieznane originy w produkcji
- [ ] **Helmet:** Zainstaluj i skonfiguruj Helmet
- [ ] **Error handling:** Ukryj szczegóły błędów w produkcji
- [ ] **Seed endpoint:** Wyłącz w produkcji lub dodaj silną ochronę
- [ ] **Logowanie:** Usuń logowanie wrażliwych danych
- [ ] **Hasła:** Wzmocnij walidację (min. 12 znaków, wymagania złożoności)
- [ ] **JWT:** Skróć czas życia tokenu, dodaj refresh tokeny
- [ ] **XSS:** Dodaj sanitizację danych (express-validator, mongo-sanitize)
- [ ] **CSRF:** Dodaj ochronę CSRF (csurf)
- [ ] **Rate limiting:** Wzmocnij dla logowania (15 min, 5 prób)
- [ ] **Walidacja:** Dodaj limity długości do wszystkich pól
- [ ] **Email verification:** Dodaj weryfikację email
- [ ] **Audit log:** Dodaj logowanie operacji bezpieczeństwa
- [ ] **HTTPS:** Wymuś HTTPS w produkcji
- [ ] **Timeout:** Dodaj timeout dla requestów
- [ ] **Enumeration:** Ujednolic komunikaty błędów logowania

### MongoDB - Bezpieczeństwo:

- [ ] **IP Whitelist:** Skonfiguruj poprawnie (0.0.0.0/0 tylko jeśli konieczne)
- [ ] **Connection string:** Upewnij się że nie jest w logach
- [ ] **Database user:** Użyj użytkownika z ograniczonymi uprawnieniami
- [ ] **Network encryption:** Włącz w MongoDB Atlas

### Zmienne środowiskowe:

- [ ] **JWT_SECRET:** Użyj silnego, losowego klucza (min. 32 znaki)
- [ ] **JWT_REFRESH_SECRET:** Dodaj osobny klucz dla refresh tokenów
- [ ] **MONGODB_URI:** Upewnij się że nie jest w kodzie
- [ ] **SEED_TOKEN:** Użyj silnego tokenu lub wyłącz w produkcji
- [ ] **NODE_ENV:** Ustaw na `production` w produkcji

---

## 📝 Notatki

- Wszystkie zmiany powinny być przetestowane przed wdrożeniem
- Rozważ użycie narzędzi do skanowania bezpieczeństwa (np. Snyk, npm audit)
- Regularnie aktualizuj zależności (`npm audit fix`)
- Rozważ użycie WAF (Web Application Firewall) w produkcji

---

**Data ostatniej aktualizacji:** 2024  
**Następny przegląd:** Po implementacji poprawek
