# 🔄 Reset Rate Limiting

## Problem:
Testy E2E wywołały zbyt wiele prób logowania i teraz endpoint jest zablokowany na 15 minut.

**Komunikat:** "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut."

---

## ✅ Rozwiązania:

### 1. **Poczekaj 15 minut** (najprostsze)
Rate limiting wygaśnie automatycznie po 15 minutach.

---

### 2. **Zrestartuj backend** (szybkie rozwiązanie)
Rate limiting jest przechowywany w pamięci (in-memory), więc restart serwera wyczyści wszystkie limity.

```bash
# Zatrzymaj backend (Ctrl+C)
# Uruchom ponownie
cd backend
npm run start
```

**Uwaga:** To wyczyści rate limiting dla WSZYSTKICH użytkowników.

---

### 3. **Użyj innego IP** (dla testów)
Jeśli testujesz lokalnie, możesz użyć innego IP lub zmienić `keyGenerator` w testach.

---

### 4. **Zmniejsz timeout rate limitingu w development** (dla testów)
Możesz zmodyfikować `backend/src/middleware/rateLimiter.js`:

```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5,
  // Dla development - zmniejsz timeout
  ...(process.env.NODE_ENV === 'development' && {
    windowMs: 1 * 60 * 1000, // 1 minuta w development
  }),
  // ...
});
```

---

### 5. **Wyłącz rate limiting w testach** (tylko dla testów E2E)
Możesz dodać warunek w `rateLimiter.js`:

```javascript
const loginLimiter = process.env.DISABLE_RATE_LIMIT === 'true' 
  ? (req, res, next) => next() // Bypass rate limiting
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      // ...
    });
```

I uruchomić testy z:
```bash
DISABLE_RATE_LIMIT=true npm run test:e2e:security
```

---

## 🎯 Rekomendacja:

**Dla testów E2E:** Użyj opcji 2 (restart backend) lub opcji 5 (wyłącz rate limiting w testach).

**Dla produkcji:** Zostaw rate limiting włączony - to ważne zabezpieczenie!

---

**Status:** ✅ **Rate limiting działa poprawnie - to dobrze!**
