# 🔧 Podsumowanie problemów i rozwiązań

## Problem 1: ❌ Admin nie istnieje w bazie (GŁÓWNY PROBLEM)

**Logi pokazują:**
```
❌ Login failed: Admin not found for email: admin@restauracja.pl
```

**Rozwiązanie:** Zaseeduj bazę danych przez API endpoint.

### Szybkie rozwiązanie:

1. **Sprawdź czy SEED_TOKEN jest ustawiony na Render:**
   - Render Dashboard → Twój backend service → Environment
   - Sprawdź czy istnieje `SEED_TOKEN`

2. **Jeśli nie ma - dodaj SEED_TOKEN:**
   - Key: `SEED_TOKEN`
   - Value: `14285a6a06a437c2de35afb2272a14a03339aed193fdb090d39fb046ce1a2bb2` (lub wygeneruj nowy)

3. **Wywołaj endpoint seedowania:**
   ```bash
   curl -X POST https://restauracja-backend.onrender.com/api/seed \
     -H "Content-Type: application/json" \
     -d '{"seedToken": "14285a6a06a437c2de35afb2272a14a03339aed193fdb090d39fb046ce1a2bb2"}'
   ```

4. **Po seedowaniu spróbuj zalogować się:**
   - Email: `admin@restauracja.pl`
   - Hasło: `Admin123!`

5. **⚠️ WAŻNE: Po seedowaniu usuń SEED_TOKEN z Render!**

---

## Problem 2: ⚠️ Rate Limiting - X-Forwarded-For Error

**Logi pokazują:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Status:** ✅ Naprawione w kodzie (trust proxy ustawione w linii 26 w server.js)

**Jeśli błąd nadal występuje:**
- Może to być stary log z przed redeploy
- Sprawdź czy najnowszy kod został wypushowany
- Sprawdź czy redeploy się ukończył

**Jeśli błąd nadal występuje po redeploy:**
- Trust proxy jest ustawione jako `app.set('trust proxy', 1)` w linii 26
- To powinno wystarczyć dla Render
- Jeśli problem się utrzymuje, może być problem z wersją express-rate-limit

---

## Problem 3: ✅ CORS - Unknown origin

**Logi pokazują:**
```
CORS: Unknown origin: https://res-ahb93svay-maniek-wqs-projects.vercel.app, allowing for now
```

**Status:** ✅ To nie jest błąd - to tylko logowanie

**Wyjaśnienie:**
- Vercel używa preview URLs (z hash)
- CORS pozwala na te requesty (linia 44 w server.js)
- W produkcji powinieneś dodać wszystkie możliwe Vercel URLs do `allowedOrigins`

**Opcjonalna poprawka:**
Dodaj do `server.js` w `allowedOrigins`:
```javascript
const allowedOrigins = [
  'http://localhost:4200',
  process.env.FRONTEND_URL,
  /^https:\/\/res-.*\.vercel\.app$/, // Vercel preview URLs
].filter(Boolean);
```

Ale to wymaga zmiany logiki CORS, więc na razie zostaw jak jest.

---

## ✅ Co zostało naprawione:

1. ✅ Trust proxy ustawione przed wszystkimi middleware
2. ✅ Walidacja JWT_SECRET i MONGODB_URI przy starcie
3. ✅ Lepsze logowanie błędów w authController
4. ✅ Normalizacja emaila (lowercase + trim)

---

## 📋 Następne kroki:

1. **Zaseeduj bazę przez API** (patrz Problem 1)
2. **Sprawdź czy redeploy się ukończył** (Render Dashboard)
3. **Spróbuj zalogować się** po seedowaniu
4. **Sprawdź logi Render** - powinny pokazywać szczegółowe błędy

---

## 🔍 Debugowanie:

Jeśli nadal masz problemy:

1. **Sprawdź logi Render:**
   - Render Dashboard → Twój service → Logs
   - Szukaj błędów i warningów

2. **Sprawdź MongoDB Atlas:**
   - Czy admin istnieje w kolekcji `admins`?
   - Czy email to `admin@restauracja.pl` (lowercase)?

3. **Sprawdź zmienne środowiskowe na Render:**
   - `JWT_SECRET` - czy jest ustawione?
   - `MONGODB_URI` - czy wskazuje na właściwą bazę?
   - `FRONTEND_URL` - czy jest ustawione?
   - `SEED_TOKEN` - czy jest ustawione (jeśli chcesz seedować)?

4. **Testuj endpoint seedowania:**
   ```bash
   curl -X POST https://restauracja-backend.onrender.com/api/seed \
     -H "Content-Type: application/json" \
     -d '{"seedToken": "TWÓJ_TOKEN"}'
   ```
