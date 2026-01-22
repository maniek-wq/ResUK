# 🌱 Seedowanie bazy danych na Render

## Problem
Backend zwraca 401 "Nieprawidłowy email lub hasło" przy logowaniu, ponieważ baza danych nie jest zaseedowana.

## Rozwiązanie - Seed przez Render Shell

### Krok 1: Przejdź do Render Shell

1. Zaloguj się na [render.com](https://render.com)
2. Przejdź do swojej usługi backend (`restauracja-backend`)
3. W menu po lewej kliknij **"Shell"**

### Krok 2: Uruchom seed

W Shell wykonaj:

```bash
cd backend
npm run seed
```

### Krok 3: Weryfikacja

Po seedowaniu powinieneś zobaczyć komunikaty:
- ✅ MongoDB połączono
- 🗑️ Usunięto istniejące dane
- ✅ Utworzono lokale
- ✅ Utworzono stoliki
- ✅ Utworzono konta admin

### Krok 4: Test logowania

Spróbuj zalogować się z:
- **Email:** `admin@restauracja.pl`
- **Hasło:** `Admin123!`

---

## Alternatywnie - Seed lokalnie

Jeśli Shell nie działa, możesz zaseedować lokalnie:

1. **Zaktualizuj `backend/.env`** z production wartościami:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority
   JWT_SECRET=896400d0ad65a6e1f5c471b1319d6bcff122b4296f4b3e1a8c57f0ba33007d52f91993025490825ac6df6ce1c04f3ccf74797781038d88d64ee9152e81b8627b
   FRONTEND_URL=https://res-uk.vercel.app
   PORT=3000
   ADMIN_EMAIL=admin@restauracja.pl
   ADMIN_PASSWORD=Admin123!
   ```

2. **Uruchom seed:**
   ```bash
   cd backend
   npm run seed
   ```

---

## Domyślne konta po seedowaniu

| Rola | Email | Hasło |
|------|-------|-------|
| Admin | admin@restauracja.pl | Admin123! |
| Manager | manager@restauracja.pl | Manager123! |

**⚠️ WAŻNE:** Zmień hasła po pierwszym logowaniu w produkcji!
