# 🔄 Implementacja Refresh Tokenów - Kompletny przewodnik

## ✅ Co zostało zaimplementowane:

### 1. **Model RefreshToken**
- ✅ Nowy model w `backend/src/models/RefreshToken.js`
- ✅ Automatyczne usuwanie wygasłych tokenów (TTL index)
- ✅ Możliwość unieważniania tokenów
- ✅ Przechowywanie IP i User-Agent

### 2. **Skrócony Access Token**
- ✅ Access token: **15 minut** (było 7 dni)
- ✅ Refresh token: **7 dni**
- ✅ Osobny `JWT_REFRESH_SECRET`

### 3. **Nowy endpoint `/api/auth/refresh`**
- ✅ Weryfikacja refresh tokenu
- ✅ Sprawdzanie czy token nie jest unieważniony
- ✅ Generowanie nowego access tokenu
- ✅ Rate limiting (publicLimiter)

### 4. **Ulepszone wylogowanie**
- ✅ Unieważnianie refresh tokenów przy logout
- ✅ Możliwość unieważnienia wszystkich tokenów użytkownika

### 5. **Walidacja zmiennych środowiskowych**
- ✅ Sprawdzanie `JWT_REFRESH_SECRET` przy starcie
- ✅ Komunikat błędu jeśli brakuje

---

## 📋 Wymagane zmiany w .env:

Dodaj do `backend/.env`:

```env
# JWT Secrets - użyj różnych kluczy!
JWT_SECRET=twoj_super_tajny_klucz_jwt_min_32_znaki
JWT_REFRESH_SECRET=twoj_super_tajny_klucz_refresh_min_32_znaki
```

**Generowanie bezpiecznych kluczy:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🔄 Jak to działa:

### 1. **Logowanie:**
```javascript
POST /api/auth/login
{
  "email": "admin@restauracja.pl",
  "password": "Password123!"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...", // Access token (15 min)
  "refreshToken": "eyJhbGc...", // Refresh token (7 dni)
  "admin": { ... }
}
```

### 2. **Odświeżanie tokenu:**
```javascript
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "success": true,
  "token": "eyJhbGc...", // Nowy access token (15 min)
  "admin": { ... }
}
```

### 3. **Wylogowanie:**
```javascript
POST /api/auth/logout
Headers: { "Authorization": "Bearer <access_token>" }
Body: { "refreshToken": "eyJhbGc..." } // Opcjonalne

Response:
{
  "success": true,
  "message": "Wylogowano pomyślnie"
}
```

---

## 🔒 Bezpieczeństwo:

### ✅ Zalety:
- **Krótki czas życia access tokenu** (15 min) - mniejsze ryzyko przy kradzieży
- **Refresh tokeny w bazie** - możliwość unieważnienia
- **Automatyczne czyszczenie** - wygasłe tokeny są usuwane
- **Śledzenie IP/User-Agent** - możliwość wykrycia podejrzanych aktywności
- **Unieważnianie przy logout** - bezpieczne wylogowanie

### ⚠️ Uwagi:
- **JWT_REFRESH_SECRET** musi być różny od JWT_SECRET
- **Refresh tokeny** są przechowywane w bazie - możliwość unieważnienia
- **Access tokeny** są stateless - nie można ich unieważnić (ale są krótkie)

---

## 🧪 Testowanie:

### 1. **Test logowania:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restauracja.pl","password":"Admin123!"}'
```

### 2. **Test refresh:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token>"}'
```

### 3. **Test logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token>"}'
```

---

## 📝 Frontend - Wymagane zmiany:

### 1. **Zapisz refresh token:**
```typescript
// Po logowaniu
localStorage.setItem('refreshToken', response.refreshToken);
```

### 2. **Automatyczne odświeżanie:**
```typescript
// Interceptor dla 401 - automatyczne odświeżanie
if (error.status === 401) {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    // Wywołaj /api/auth/refresh
    // Zapisz nowy access token
    // Powtórz oryginalny request
  }
}
```

### 3. **Wylogowanie:**
```typescript
// Przy logout wyślij refresh token do unieważnienia
await http.post('/api/auth/logout', { refreshToken });
localStorage.removeItem('refreshToken');
```

---

## ⚠️ WAŻNE:

1. **Dodaj JWT_REFRESH_SECRET do .env** - bez tego aplikacja nie uruchomi się
2. **Użyj różnych kluczy** - JWT_SECRET i JWT_REFRESH_SECRET muszą być różne
3. **Zaktualizuj frontend** - żeby używał refresh tokenów
4. **Przetestuj** - sprawdź czy wszystko działa

---

## 🎯 Następne kroki:

1. ✅ Refresh tokeny - **ZROBIONE**
2. ⏭️ CSRF protection
3. ⏭️ Audit logging
4. ⏭️ Weryfikacja email
5. ⏭️ Timeout dla requestów

---

**Status:** ✅ **REFRESH TOKENY ZAIMPLEMENTOWANE**

**Następny krok:** Dodaj `JWT_REFRESH_SECRET` do `.env` i przetestuj!
