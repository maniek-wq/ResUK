# 💻 Praca lokalna vs Produkcja

## 🔧 Konfiguracja środowisk

### Frontend

Aplikacja używa dwóch plików środowiskowych:

1. **`frontend/src/environments/environment.ts`** - Lokalne środowisko (development)
   ```typescript
   apiUrl: 'http://localhost:3000/api'
   ```

2. **`frontend/src/environments/environment.prod.ts`** - Produkcja (Vercel)
   ```typescript
   apiUrl: 'https://restauracja-backend.onrender.com/api'
   ```

### Backend

Backend używa zmiennych środowiskowych z pliku `.env`:

1. **Lokalnie** - plik `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/restauracja
   JWT_SECRET=twoj_lokalny_secret
   PORT=3000
   FRONTEND_URL=http://localhost:4200
   ```

2. **Na Render** - zmienne środowiskowe w Render Dashboard:
   ```env
   MONGODB_URI=mongodb+srv://...@cluster0...mongodb.net/restauracja-zlota?...
   JWT_SECRET=produkcyjny_secret
   PORT=10000 (automatycznie ustawiane przez Render)
   FRONTEND_URL=https://res-uk.vercel.app
   ```

---

## 🚀 Praca lokalna

### Krok 1: Uruchom backend lokalnie

```bash
cd backend
npm install
npm run dev
```

Backend będzie działał na: `http://localhost:3000`

### Krok 2: Uruchom frontend lokalnie

```bash
cd frontend
npm install
ng serve
```

Frontend będzie działał na: `http://localhost:4200`

### Krok 3: Sprawdź konfigurację

- Frontend automatycznie używa `environment.ts` (localhost:3000)
- Backend używa `.env` z lokalnymi ustawieniami

---

## 📦 Deploy na produkcję

### Frontend (Vercel)

1. **Zbuduj aplikację:**
   ```bash
   cd frontend
   ng build --configuration production
   ```

2. **Push do Git:**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push
   ```

3. **Vercel automatycznie:**
   - Wykryje push
   - Zbuduje aplikację z `environment.prod.ts`
   - Zdeployuje na produkcję

### Backend (Render)

1. **Push do Git:**
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push
   ```

2. **Render automatycznie:**
   - Wykryje push
   - Zbuduje aplikację
   - Użyje zmiennych środowiskowych z Render Dashboard
   - Zdeployuje na produkcję

---

## 🔄 Przełączanie między lokalnym a produkcją

### Frontend

**Lokalnie:**
```bash
ng serve
# Używa environment.ts → localhost:3000
```

**Produkcja (lokalnie dla testów):**
```bash
ng serve --configuration production
# Używa environment.prod.ts → produkcja
```

**Build produkcyjny:**
```bash
ng build --configuration production
# Tworzy build z environment.prod.ts
```

### Backend

**Lokalnie:**
```bash
npm run dev
# Używa .env → localhost:3000
```

**Produkcja:**
- Automatycznie na Render
- Używa zmiennych środowiskowych z Render Dashboard

---

## 📝 Zmiana portu backendu lokalnie

Jeśli chcesz użyć portu 10000 lokalnie (jak na Render):

1. **Zaktualizuj `backend/.env`:**
   ```env
   PORT=10000
   ```

2. **Zaktualizuj `frontend/src/environments/environment.ts`:**
   ```typescript
   apiUrl: 'http://localhost:10000/api'
   ```

3. **Uruchom ponownie:**
   ```bash
   # Backend
   npm run dev
   
   # Frontend
   ng serve
   ```

---

## ✅ Checklist przed deployem

### Frontend:
- [ ] `environment.prod.ts` ma poprawny URL backendu
- [ ] Build produkcyjny działa: `ng build --configuration production`
- [ ] Wszystkie zmiany są scommitowane

### Backend:
- [ ] Wszystkie zmienne środowiskowe są ustawione na Render
- [ ] `MONGODB_URI` ma nazwę bazy danych
- [ ] `JWT_SECRET` jest ustawione
- [ ] `FRONTEND_URL` wskazuje na Vercel
- [ ] Wszystkie zmiany są scommitowane

---

## 🐛 Debugowanie

### Problem: Frontend nie łączy się z backendem lokalnie

**Sprawdź:**
1. Czy backend działa: `http://localhost:3000/api/health`
2. Czy `environment.ts` ma poprawny URL
3. Czy port backendu jest zgodny z `environment.ts`

### Problem: Frontend na produkcji nie łączy się z backendem

**Sprawdź:**
1. Czy `environment.prod.ts` ma poprawny URL
2. Czy backend na Render działa
3. Czy CORS jest skonfigurowany poprawnie

### Problem: Backend nie łączy się z bazą danych

**Sprawdź:**
1. Czy `MONGODB_URI` ma nazwę bazy danych
2. Czy connection string jest poprawny
3. Czy MongoDB Atlas pozwala na połączenia z Twojego IP

---

## 📚 Przydatne komendy

```bash
# Frontend - development
ng serve

# Frontend - production build
ng build --configuration production

# Backend - development
npm run dev

# Backend - production (lokalnie)
npm start

# Seed bazy danych (lokalnie)
npm run seed
```
