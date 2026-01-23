# ✅ Checklist zmiennych środowiskowych dla Render

## Wymagane zmienne środowiskowe (MUSZĄ być ustawione):

### 1. MONGODB_URI ✅
- **Opis:** Connection string do MongoDB Atlas
- **Format:** `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority`
- **Gdzie używane:** 
  - `src/config/database.js` - połączenie z bazą
  - `src/seed.js` - seedowanie
  - `src/controllers/seedController.js` - seedowanie przez API
- **Status:** ✅ Ustawione

### 2. JWT_SECRET ✅
- **Opis:** Sekretny klucz do podpisywania tokenów JWT
- **Format:** Długi losowy string (min. 32 znaki)
- **Gdzie używane:**
  - `src/middleware/auth.js` - weryfikacja tokenów
  - `src/controllers/authController.js` - generowanie tokenów
- **Status:** ✅ Ustawione

### 3. FRONTEND_URL ✅
- **Opis:** URL frontendu z Vercel (dla CORS)
- **Format:** `https://res-uk.vercel.app`
- **Gdzie używane:**
  - `src/server.js` - konfiguracja CORS
- **Status:** ✅ Ustawione

## Opcjonalne zmienne środowiskowe:

### 4. NODE_ENV ✅
- **Opis:** Środowisko aplikacji (development/production)
- **Format:** `production` lub `development`
- **Gdzie używane:**
  - Wszystkie controllery - do pokazywania szczegółowych błędów tylko w development
- **Domyślna wartość:** Render automatycznie ustawia na `production`
- **Status:** ✅ Ustawione (automatycznie przez Render)

### 5. PORT
- **Opis:** Port na którym działa serwer
- **Format:** Numer portu (np. `3000`)
- **Gdzie używane:**
  - `src/server.js` - `app.listen(PORT)`
- **Domyślna wartość:** `3000` (lub Render automatycznie ustawia `10000`)
- **Status:** ⚠️ Nie wymagane - Render ustawia automatycznie

### 6. SEED_TOKEN ✅
- **Opis:** Token do seedowania bazy przez API
- **Format:** Długi losowy string
- **Gdzie używane:**
  - `src/routes/seed.js` - weryfikacja tokenu przed seedowaniem
- **Status:** ✅ Ustawione (jeśli chcesz użyć seedowania przez API)

## Nie wymagane na Render (tylko lokalnie):

### 7. ADMIN_EMAIL
- **Opis:** Email admina do seedowania
- **Format:** `admin@restauracja.pl`
- **Gdzie używane:**
  - `src/seed.js` - tylko przy lokalnym seedowaniu
- **Status:** ❌ Nie wymagane na Render

### 8. ADMIN_PASSWORD
- **Opis:** Hasło admina do seedowania
- **Format:** `Admin123!`
- **Gdzie używane:**
  - `src/seed.js` - tylko przy lokalnym seedowaniu
- **Status:** ❌ Nie wymagane na Render

---

## 📋 Podsumowanie dla Render:

### Wymagane (3):
- ✅ `MONGODB_URI`
- ✅ `JWT_SECRET`
- ✅ `FRONTEND_URL`

### Opcjonalne (2):
- ✅ `NODE_ENV` (automatycznie ustawiane przez Render)
- ✅ `SEED_TOKEN` (tylko jeśli chcesz seedować przez API)

### Nie wymagane:
- ❌ `PORT` (Render ustawia automatycznie)
- ❌ `ADMIN_EMAIL` (tylko lokalnie)
- ❌ `ADMIN_PASSWORD` (tylko lokalnie)

---

## ✅ Wszystkie wymagane zmienne są ustawione!

Nie potrzebujesz więcej plików środowiskowych. Wszystkie wymagane zmienne są już skonfigurowane na Render.
