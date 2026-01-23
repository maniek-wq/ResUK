# 🔍 Analiza problemów backendu

## Problem 1: Rate Limiting - X-Forwarded-For Error

### Przyczyna:
- Render używa proxy (X-Forwarded-For header)
- Express-rate-limit wymaga `trust proxy` PRZED jego użyciem
- Trust proxy jest ustawione w `server.js`, ale rate limiting jest inicjalizowany w `rateLimiter.js` PRZED załadowaniem routes

### Rozwiązanie:
Trust proxy jest już ustawione w `server.js` (linia 15), ale może być problem z kolejnością inicjalizacji. Rate limiting używa `req.ip`, który wymaga trust proxy.

## Problem 2: 401 Unauthorized przy logowaniu

### Możliwe przyczyny:

1. **Admin nie istnieje w bazie**
   - Seed nie został uruchomiony na Render
   - Admin został usunięty z bazy

2. **Nieprawidłowe hasło**
   - Hasło w bazie jest zahashowane inaczej
   - Hasło w requestcie jest inne niż w bazie

3. **JWT_SECRET nie jest ustawione**
   - Brak zmiennej środowiskowej JWT_SECRET na Render
   - JWT_SECRET jest inne niż przy seedowaniu

4. **Problem z porównywaniem haseł**
   - Bcrypt nie może porównać haseł
   - Hasło nie jest poprawnie zahashowane

## Problem 3: Kolejność middleware

### Obecna kolejność w server.js:
1. Trust proxy (linia 15) ✅
2. CORS (linia 24)
3. express.json() (linia 55)
4. Routes (linia 78) - tutaj jest rate limiting

### Problem:
Rate limiting jest używany w routes, które są załadowane PO trust proxy, więc powinno działać. Ale express-rate-limit może sprawdzać trust proxy w momencie inicjalizacji, nie w momencie użycia.

## Rozwiązania:

### 1. Upewnij się że trust proxy jest PRZED wszystkimi middleware
### 2. Dodaj walidację JWT_SECRET przy starcie
### 3. Dodaj lepsze logowanie błędów w authController
### 4. Sprawdź czy admin istnieje w bazie
