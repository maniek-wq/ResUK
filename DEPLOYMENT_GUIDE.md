# 🚀 Przewodnik Deploymentu - U kelnerów

Przewodnik krok po kroku do wdrożenia aplikacji na Vercel (frontend), Render (backend) i MongoDB Atlas.

---

## 📋 WYMAGANIA WSTĘPNE

- Konto na [Vercel](https://vercel.com) (darmowe)
- Konto na [Render](https://render.com) (darmowe)
- Konto na [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (darmowe)
- Git repository (GitHub, GitLab, Bitbucket)
- Projekt skonfigurowany lokalnie i działający

---

## 🗄️ CZĘŚĆ 1: MONGODB ATLAS

### Krok 1.1: Utworzenie konta i klastra

1. Przejdź na [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Zaloguj się lub utwórz darmowe konto
3. Kliknij **"Create"** → **"Create a Deployment"**
4. Wybierz **"M0 FREE"** (Shared, Free tier)
5. Wybierz **Cloud Provider** (AWS, Google Cloud, Azure) i **Region** (najlepiej najbliższy Polsce, np. `eu-central-1` - Frankfurt)
6. Kliknij **"Create Deployment"**

### Krok 1.2: Konfiguracja bezpieczeństwa

1. **Database Access (Dostęp do bazy):**
   - W menu po lewej kliknij **"Database Access"**
   - Kliknij **"Add New Database User"**
   - Wybierz **"Password"** jako metodę autentykacji
   - Wprowadź:
     - **Username:** `restauracja-admin` (lub dowolna nazwa)
     - **Password:** Wygeneruj silne hasło (zapisz je!)
   - W **"Database User Privileges"** wybierz **"Atlas admin"** (lub **"Read and write to any database"**)
   - Kliknij **"Add User"**

2. **Network Access (Dostęp sieciowy):**
   - W menu po lewej kliknij **"Network Access"**
   - Kliknij **"Add IP Address"**
   - Kliknij **"Allow Access from Anywhere"** (dla uproszczenia) lub dodaj konkretne IP
   - Kliknij **"Confirm"**

### Krok 1.3: Pobranie connection string

1. W menu po lewej kliknij **"Database"**
2. Kliknij **"Connect"** przy swoim klastrze
3. Wybierz **"Connect your application"**
4. Wybierz **"Driver"**: `Node.js` i **"Version"**: `5.5 or later`
5. Skopiuj **Connection String** - będzie wyglądał tak:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **WAŻNE:** Zamień `<username>` i `<password>` na dane użytkownika utworzonego w kroku 1.2
7. Na końcu connection string dodaj nazwę bazy danych:
   ```
   mongodb+srv://restauracja-admin:TwojeHaslo@cluster0.xxxxx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority
   ```
8. **Zapisz ten connection string** - będzie potrzebny w Render!

---

## 🎨 CZĘŚĆ 2: VERCEL (FRONTEND)

### Krok 2.1: Przygotowanie projektu

Najpierw musimy zaktualizować konfigurację frontendu:

1. **Zaktualizuj `frontend/src/environments/environment.prod.ts`:**
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://twoj-backend.onrender.com/api' // Zaktualizuj po deploymencie backendu!
   };
   ```
   
   **UWAGA:** Po deploymencie backendu na Render, wróć do tego pliku i zaktualizuj URL na rzeczywisty URL z Render.

2. **Utwórz plik `frontend/vercel.json`:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist/frontend",
     "devCommand": "npm start",
     "installCommand": "npm install",
     "framework": "angular",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   
   **UWAGA:** Plik `vercel.json` został już utworzony w projekcie. Sprawdź czy ścieżka `outputDirectory` jest poprawna po pierwszym buildzie - może być `dist/frontend` lub `dist/frontend/browser` w zależności od wersji Angular.

### Krok 2.2: Deploy na Vercel

1. **Zaloguj się na Vercel:**
   - Przejdź na [vercel.com](https://vercel.com)
   - Zaloguj się przez GitHub/GitLab/Bitbucket

2. **Dodaj nowy projekt:**
   - Kliknij **"Add New..."** → **"Project"**
   - Wybierz swoje repozytorium z projektem
   - Jeśli nie widzisz repozytorium, kliknij **"Adjust GitHub App Permissions"** i udziel dostępu

3. **Konfiguracja projektu:**
   - **Framework Preset:** Angular (lub "Other")
   - **Root Directory:** `frontend` (WAŻNE!)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/frontend/browser`
   - **Install Command:** `npm install`

4. **Environment Variables (zmienne środowiskowe):**
   - Kliknij **"Environment Variables"**
   - Dodaj:
     - **Key:** `API_URL`
     - **Value:** `https://twoj-backend.onrender.com/api` (URL backendu z Render - zaktualizujesz po deploymencie backendu)
     - **Environment:** Production, Preview, Development
   - Kliknij **"Save"**

5. **Deploy:**
   - Kliknij **"Deploy"**
   - Poczekaj na zakończenie builda (2-5 minut)
   - Po zakończeniu otrzymasz URL: `https://twoj-projekt.vercel.app`

### Krok 2.3: Aktualizacja API_URL

Po deploymencie backendu na Render:
1. W Vercel przejdź do **Settings** → **Environment Variables**
2. Zaktualizuj `API_URL` na rzeczywisty URL z Render
3. Kliknij **"Redeploy"** przy najnowszym deploymencie

---

## ⚙️ CZĘŚĆ 3: RENDER (BACKEND)

### Krok 3.1: Przygotowanie projektu

1. **Utwórz plik `backend/render.yaml` (opcjonalnie, ale zalecane):**
   ```yaml
   services:
     - type: web
       name: restauracja-backend
       env: node
       plan: free
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGODB_URI
           sync: false
         - key: JWT_SECRET
           sync: false
         - key: FRONTEND_URL
           sync: false
         - key: PORT
           value: 10000
   ```

2. **Sprawdź czy `backend/package.json` ma skrypt `start`:**
   - Powinno być: `"start": "node src/server.js"`

### Krok 3.2: Deploy na Render

1. **Zaloguj się na Render:**
   - Przejdź na [render.com](https://render.com)
   - Zaloguj się przez GitHub/GitLab/Bitbucket

2. **Utwórz nową Web Service:**
   - Kliknij **"New +"** → **"Web Service"**
   - Wybierz swoje repozytorium
   - Jeśli nie widzisz, kliknij **"Configure account"** i udziel dostępu

3. **Konfiguracja usługi:**
   - **Name:** `restauracja-backend` (lub dowolna nazwa)
   - **Environment:** `Node`
   - **Region:** Wybierz najbliższy (np. `Frankfurt (EU)`)
   - **Branch:** `main` (lub `master`)
   - **Root Directory:** `backend` (WAŻNE!)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free` (lub wybierz płatny jeśli potrzebujesz)

4. **Environment Variables:**
   Kliknij **"Advanced"** i dodaj zmienne:
   
   | Key | Value | Opis |
   |-----|-------|------|
   | `NODE_ENV` | `production` | Środowisko produkcyjne |
   | `MONGODB_URI` | `mongodb+srv://...` | Connection string z MongoDB Atlas (z kroku 1.3) |
   | `JWT_SECRET` | `twoj-super-tajny-klucz-jwt-2024` | Losowy, długi string (min. 32 znaki) |
   | `FRONTEND_URL` | `https://twoj-projekt.vercel.app` | URL frontendu z Vercel |
   | `PORT` | `10000` | Port (Render ustawia automatycznie, ale można podać) |

   **Jak wygenerować JWT_SECRET:**
   ```bash
   # W terminalu:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy:**
   - Kliknij **"Create Web Service"**
   - Render zacznie buildować i deployować aplikację (5-10 minut)
   - Po zakończeniu otrzymasz URL: `https://restauracja-backend.onrender.com`

### Krok 3.3: Seedowanie bazy danych

Po deploymencie backendu musisz zaseedować bazę danych:

1. **Opcja A: Lokalnie (zalecane):**
   ```bash
   cd backend
   # Utwórz plik .env z production wartościami:
   MONGODB_URI=mongodb+srv://... (z MongoDB Atlas)
   JWT_SECRET=twoj-secret
   FRONTEND_URL=https://twoj-projekt.vercel.app
   PORT=3000
   
   npm run seed
   ```

2. **Opcja B: Przez Render Shell:**
   - W Render przejdź do swojej usługi
   - Kliknij **"Shell"** (w menu po lewej)
   - Wykonaj:
     ```bash
     cd backend
     npm run seed
     ```

### Krok 3.4: Aktualizacja CORS w backendzie

Upewnij się, że `backend/src/server.js` ma poprawnie skonfigurowany CORS:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
```

To powinno działać automatycznie, jeśli ustawiłeś `FRONTEND_URL` w zmiennych środowiskowych.

---

## ✅ WERYFIKACJA DEPLOYMENTU

### Test 1: Backend Health Check
Otwórz w przeglądarce:
```
https://twoj-backend.onrender.com/api/health
```
Powinieneś zobaczyć:
```json
{
  "status": "ok",
  "message": "Restauracja API działa",
  "timestamp": "..."
}
```

### Test 2: Frontend
Otwórz URL z Vercel i sprawdź czy:
- Strona się ładuje
- Menu się wyświetla
- Rezerwacje działają (sprawdź w DevTools → Network czy API calls idą do Render)

### Test 3: Admin Panel
1. Zaloguj się na panel admina
2. Sprawdź czy dashboard się ładuje
3. Sprawdź czy rezerwacje się wyświetlają

---

## 🔧 ROZWIĄZYWANIE PROBLEMÓW

### Problem: Frontend nie łączy się z backendem
- **Sprawdź:** Czy `API_URL` w Vercel jest poprawny (z `/api` na końcu)
- **Sprawdź:** Czy CORS w backendzie pozwala na domenę Vercel
- **Sprawdź:** W DevTools → Network czy są błędy CORS

### Problem: Backend nie łączy się z MongoDB
- **Sprawdź:** Czy connection string jest poprawny (z nazwą bazy danych)
- **Sprawdź:** Czy Network Access w MongoDB Atlas pozwala na Render IP
- **Sprawdź:** Logi w Render → Logs

### Problem: Build fails w Vercel
- **Sprawdź:** Czy `outputDirectory` w `vercel.json` jest poprawny
- **Sprawdź:** Czy `angular.json` ma poprawny `outputPath`
- **Sprawdź:** Logi builda w Vercel

### Problem: Backend się nie uruchamia w Render
- **Sprawdź:** Czy `startCommand` jest poprawny (`npm start`)
- **Sprawdź:** Czy wszystkie zmienne środowiskowe są ustawione
- **Sprawdź:** Logi w Render → Logs

---

## 📝 WAŻNE UWAGI

### Free Tier Limitations:

**Vercel:**
- 100 GB bandwidth/miesiąc
- 100 builds/dzień
- Funkcje serverless: 100 GB-hours/miesiąc

**Render:**
- Usługi mogą być "spin down" po 15 min nieaktywności
- 750 godzin/miesiąc łącznie
- 512 MB RAM
- Pierwszy request po spin down może być wolny (cold start)

**MongoDB Atlas:**
- 512 MB storage
- Shared RAM
- Wystarczy dla małych/średnich aplikacji

### Security Best Practices:

1. **JWT_SECRET:** Użyj długiego, losowego stringa (min. 32 znaki)
2. **MongoDB Password:** Silne hasło, nie udostępniaj publicznie
3. **Environment Variables:** Nigdy nie commituj `.env` do Git
4. **CORS:** Ogranicz do konkretnych domen w produkcji

---

## 🎉 GOTOWE!

Po wykonaniu wszystkich kroków masz:
- ✅ Frontend na Vercel
- ✅ Backend na Render
- ✅ Bazę danych na MongoDB Atlas
- ✅ Wszystko połączone i działające

**Następne kroki:**
1. Skonfiguruj custom domain (opcjonalnie)
2. Skonfiguruj monitoring i alerty
3. Skonfiguruj automatyczne backupy MongoDB

---

**Ostatnia aktualizacja:** 2024
**Wersja:** 1.0
