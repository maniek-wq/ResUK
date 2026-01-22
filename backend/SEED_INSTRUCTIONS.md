# 🌱 Instrukcje Seedowania Bazy Danych

## Lokalne Seedowanie (dla produkcji)

### Krok 1: Przygotuj plik .env

Zaktualizuj plik `backend/.env` z wartościami produkcyjnymi:

```env
# MongoDB Connection (z MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority

# JWT Secret (już wygenerowany)
JWT_SECRET=896400d0ad65a6e1f5c471b1319d6bcff122b4296f4b3e1a8c57f0ba33007d52f91993025490825ac6df6ce1c04f3ccf74797781038d88d64ee9152e81b8627b

# Server Port
PORT=3000

# Frontend URL (URL z Vercel po deploymencie)
FRONTEND_URL=https://twoj-projekt.vercel.app

# Admin credentials
ADMIN_EMAIL=admin@restauracja.pl
ADMIN_PASSWORD=Admin123!
```

### Krok 2: Uruchom seed

```bash
cd backend
npm run seed
```

### Krok 3: Weryfikacja

Po seedowaniu sprawdź czy:
- ✅ Lokale zostały utworzone (2 lokale)
- ✅ Stoliki zostały utworzone
- ✅ Konta admin zostały utworzone
- ✅ Menu zostało utworzone

Możesz sprawdzić w MongoDB Atlas → Collections.

---

## Seedowanie przez Render Shell

Alternatywnie możesz zaseedować przez Render:

1. W Render przejdź do swojej usługi
2. Kliknij **"Shell"** (w menu po lewej)
3. Wykonaj:
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
