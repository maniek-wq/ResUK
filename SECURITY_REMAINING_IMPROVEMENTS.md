# 🔒 Pozostałe pola do poprawy bezpieczeństwa

**Data analizy:** 2024  
**Status:** ⚠️ **DODATKOWE ULEPSZENIA**

---

## ✅ Co już zostało naprawione:

- ✅ CORS - blokowanie nieznanych originów w produkcji
- ✅ Helmet - bezpieczne nagłówki HTTP
- ✅ Ukrywanie szczegółów błędów w produkcji
- ✅ Seed endpoint - wyłączony w produkcji
- ✅ Logowanie wrażliwych danych - usunięte z authController
- ✅ Walidacja haseł - wzmocniona (12 znaków + złożoność)
- ✅ Rate limiting - wzmocniony
- ✅ MongoDB injection protection
- ✅ Compression
- ✅ Testy E2E bezpieczeństwa

---

## 🔴 KRYTYCZNE - Do naprawy natychmiast:

### 1. **Logowanie IP i ID w authController.js**

**Lokalizacja:** `backend/src/controllers/authController.js:32, 83`

**Problem:**
```javascript
console.log(`🔍 Login attempt from IP: ${req.ip}`);
console.log(`✅ Login successful for admin ID: ${admin._id}`);
```

**Ryzyko:**
- Ujawnianie IP użytkowników (RODO/GDPR)
- Ujawnianie ID użytkowników
- Możliwość śledzenia użytkowników

**Rozwiązanie:**
```javascript
// Usuń lub loguj tylko w development bez wrażliwych danych
if (isDevelopment) {
  console.log(`🔍 Login attempt`); // Bez IP i ID
}
```

**Priorytet:** 🔴 **NATYCHMIAST**

---

### 2. **Hardcoded hasła w seed.js**

**Lokalizacja:** `backend/src/seed.js:227-228`

**Problem:**
```javascript
console.log('📋 Dane logowania:');
console.log('   Admin: admin@restauracja.pl / Admin123!');
console.log('   Manager: manager@restauracja.pl / Manager123!');
```

**Ryzyko:**
- Hasła w logach (może być dostępne publicznie)
- Ułatwia ataki brute force

**Rozwiązanie:**
```javascript
// Usuń lub loguj tylko w development
if (process.env.NODE_ENV === 'development') {
  console.log('📋 Dane logowania (tylko development):');
  console.log('   Admin: admin@restauracja.pl / [hasło w .env]');
}
```

**Priorytet:** 🔴 **NATYCHMIAST**

---

### 3. **JWT Token - za długi czas życia (7 dni)**

**Lokalizacja:** `backend/src/controllers/authController.js:5-9`

**Problem:**
```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // ❌ Za długo!
  });
};
```

**Ryzyko:**
- Skradziony token działa przez 7 dni
- Brak możliwości szybkiego unieważnienia
- Kompromitacja konta

**Rozwiązanie:**
```javascript
// Skróć do 15 minut + dodaj refresh token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m' // 15 minut
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // 7 dni dla refresh token
  });
};
```

**Priorytet:** 🔴 **NATYCHMIAST**

---

## 🟠 WYSOKIE RYZYKO - Do naprawy w ciągu tygodnia:

### 4. **Brak refresh tokenów**

**Problem:**
- Tylko access token
- Brak mechanizmu odświeżania
- Użytkownik musi się logować co 7 dni (lub 15 min po zmianie)

**Rozwiązanie:**
- Dodaj endpoint `/api/auth/refresh`
- Zapisz refresh tokeny w bazie (z możliwością unieważnienia)
- Użyj osobnego `JWT_REFRESH_SECRET`

**Priorytet:** 🟠 **WYSOKIE**

---

### 5. **Brak CSRF protection**

**Problem:**
- Brak tokenów CSRF
- Możliwość ataków CSRF

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

### 6. **Brak audit logging**

**Problem:**
- Brak logowania operacji bezpieczeństwa
- Trudności w wykrywaniu ataków
- Brak audytu

**Rozwiązanie:**
```javascript
// Dodaj middleware audit logging
const auditLog = (req, res, next) => {
  const auditEvents = [
    '/auth/login',
    '/auth/password',
    '/auth/logout',
    '/seed'
  ];
  
  if (auditEvents.some(path => req.path.includes(path))) {
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      // NIE loguj: email, password, token
    };
    
    // Zapisz do pliku lub bazy danych
    console.log('[AUDIT]', JSON.stringify(logData));
  }
  
  next();
};

app.use(auditLog);
```

**Priorytet:** 🟠 **WYSOKIE**

---

### 7. **Brak weryfikacji email**

**Problem:**
- Brak weryfikacji email przy tworzeniu konta
- Możliwość użycia nieistniejących emaili

**Rozwiązanie:**
- Dodaj pole `emailVerified` w modelu Admin
- Dodaj endpoint weryfikacji email
- Wysyłaj email z tokenem weryfikacyjnym

**Priorytet:** 🟠 **WYSOKIE**

---

### 8. **Brak timeout dla requestów**

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

**Priorytet:** 🟠 **WYSOKIE**

---

## 🟡 ŚREDNIE RYZYKO - Do naprawy w ciągu miesiąca:

### 9. **Brak walidacji ObjectId w niektórych miejscach**

**Problem:**
- Nie wszystkie endpointy walidują ObjectId
- Możliwość błędów i ataków

**Rozwiązanie:**
- Dodaj walidację ObjectId wszędzie gdzie używane
- Użyj `mongoose.Types.ObjectId.isValid()`

**Priorytet:** 🟡 **ŚREDNIE**

---

### 10. **Brak wersjonowania API**

**Problem:**
- Brak wersjonowania endpointów
- Trudności w aktualizacji API

**Rozwiązanie:**
```javascript
app.use('/api/v1', require('./routes/auth'));
```

**Priorytet:** 🟡 **ŚREDNIE**

---

### 11. **Brak cache headers dla GET requestów**

**Problem:**
- Brak cache headers
- Niepotrzebne requesty

**Rozwiązanie:**
```javascript
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('/auth')) {
    res.set('Cache-Control', 'public, max-age=3600');
  }
  next();
});
```

**Priorytet:** 🟡 **ŚREDNIE**

---

### 12. **Brak HTTPS enforcement w produkcji**

**Problem:**
- Brak wymuszania HTTPS
- Możliwość ataków man-in-the-middle

**Rozwiązanie:**
```javascript
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

## 🟢 NISKIE RYZYKO - Opcjonalne ulepszenia:

### 13. **Brak rate limiting per user (dla zalogowanych)**

**Problem:**
- Rate limiting tylko per IP
- Zalogowani użytkownicy mogą omijać limity

**Rozwiązanie:**
- Użyj `keyGenerator` w rate limiterze (już częściowo zrobione)

**Priorytet:** 🟢 **NISKIE**

---

### 14. **Brak monitoring i alerting**

**Problem:**
- Brak monitoringu bezpieczeństwa
- Trudności w wykrywaniu ataków

**Rozwiązanie:**
- Dodaj monitoring (np. Sentry, LogRocket)
- Alerty dla podejrzanych aktywności

**Priorytet:** 🟢 **NISKIE**

---

## 📊 Podsumowanie:

### Krytyczne (3):
- 🔴 Logowanie IP i ID
- 🔴 Hardcoded hasła w logach
- 🔴 JWT token za długi (7 dni)

### Wysokie (5):
- 🟠 Brak refresh tokenów
- 🟠 Brak CSRF protection
- 🟠 Brak audit logging
- 🟠 Brak weryfikacji email
- 🟠 Brak timeout dla requestów

### Średnie (4):
- 🟡 Brak walidacji ObjectId
- 🟡 Brak wersjonowania API
- 🟡 Brak cache headers
- 🟡 Brak HTTPS enforcement

### Niskie (2):
- 🟢 Rate limiting per user
- 🟢 Monitoring i alerting

---

## 🎯 Rekomendowany plan działania:

### Tydzień 1 (Krytyczne):
1. Usuń logowanie IP i ID
2. Usuń hardcoded hasła z logów
3. Skróć JWT token do 15 minut

### Tydzień 2-3 (Wysokie):
4. Dodaj refresh tokeny
5. Dodaj CSRF protection
6. Dodaj audit logging

### Tydzień 4 (Średnie):
7. Dodaj timeout dla requestów
8. Dodaj HTTPS enforcement
9. Dodaj cache headers

---

**Status:** ⚠️ **3 KRYTYCZNE + 5 WYSOKICH do naprawy**
