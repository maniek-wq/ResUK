# Konfiguracja Web Push Notifications

## Krok 1: Generowanie kluczy VAPID

Uruchom w terminalu (w folderze `backend`):

```bash
npx web-push generate-vapid-keys
```

**Wynik będzie wyglądał tak:**
```
=======================================

Public Key:
BElGCiBO3sLb3CMB2bivh25-KaXePmeowDV7V3VDBj2dCgvz8k2fO2k5Id6BU5s8VHQvMOL8dL6xUfL3xYF5mG

Private Key:
xyz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz

=======================================
```

## Krok 2: Dodanie kluczy do .env

Skopiuj wygenerowane klucze do pliku `.env` w folderze `backend`:

```env
# Web Push Notifications (VAPID Keys)
VAPID_PUBLIC_KEY=BElGCiBO3sLb3CMB2bivh25-KaXePmeowDV7V3VDBj2dCgvz8k2fO2k5Id6BU5s8VHQvMOL8dL6xUfL3xYF5mG
VAPID_PRIVATE_KEY=xyz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz
VAPID_SUBJECT=mailto:admin@restauracja.pl
```

**⚠️ WAŻNE:**
- `VAPID_PRIVATE_KEY` jest tajny - **NIGDY nie commitować do repo!**
- `VAPID_PUBLIC_KEY` jest bezpieczny do udostępnienia (używany w frontendzie)
- `VAPID_SUBJECT` to email kontaktowy (może być `mailto:` URL)

## Krok 3: Instalacja zależności

```bash
cd backend
npm install
```

To zainstaluje pakiet `web-push`, który został dodany do `package.json`.

## Krok 4: Restart serwera

Po dodaniu kluczy do `.env`, zrestartuj serwer backendu:

```bash
npm start
# lub
npm run dev
```

## Weryfikacja

Po uruchomieniu serwera powinieneś zobaczyć w konsoli:
```
✅ Web Push Notifications zainicjalizowane
```

Jeśli widzisz ostrzeżenie:
```
⚠️ VAPID keys nie są ustawione. Web Push Notifications nie będą działać.
```

To znaczy, że klucze nie zostały poprawnie dodane do `.env`.

## Testowanie endpointów

### ⚠️ Ważne: Najpierw zaloguj się!

Wszystkie endpointy push (oprócz `/public-key`) wymagają autoryzacji. Musisz najpierw zalogować się i uzyskać token JWT.

### PowerShell (Windows)

#### 0. Zaloguj się i uzyskaj token:
```powershell
# Zaloguj się (użyj danych admina z seed.js lub utworzonych przez Ciebie)
$loginBody = @{
    email = "admin@restauracja.pl"
    password = "Admin123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

# Token będzie w $loginResponse.token
$token = $loginResponse.token
Write-Host "Token: $token"
```

**Odpowiedź:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "data": {
    "id": "...",
    "email": "admin@restauracja.pl",
    ...
  }
}
```

#### 1. Pobierz publiczny klucz (publiczny endpoint - nie wymaga autoryzacji):

#### 1. Pobierz publiczny klucz (publiczny endpoint):
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/push/public-key" -Method Get
```

**Lub używając curl (alias dla Invoke-WebRequest):**
```powershell
curl http://localhost:3000/api/push/public-key
```

**Odpowiedź:**
```json
{
  "success": true,
  "publicKey": "BElGCi..."
}
```

#### 2. Zarejestruj subscription (wymaga autoryzacji):
```powershell
# Użyj tokenu z kroku 0, lub ustaw ręcznie:
# $token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    subscription = @{
        endpoint = "https://fcm.googleapis.com/..."
        keys = @{
            p256dh = "..."
            auth = "..."
        }
    }
    deviceInfo = "Chrome on iPhone 14"
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/push/subscribe" -Method Post -Body $body -Headers $headers
```

#### 3. Pobierz listę urządzeń (wymaga autoryzacji):
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/push/devices" -Method Get -Headers $headers
```

#### 4. Usuń subscription (wymaga autoryzacji):
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    endpoint = "https://fcm.googleapis.com/..."
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/push/unsubscribe" -Method Delete -Body $body -Headers $headers
```

### Bash/Linux/Mac

#### 0. Zaloguj się i uzyskaj token:
```bash
# Zaloguj się (użyj danych admina z seed.js lub utworzonych przez Ciebie)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restauracja.pl",
    "password": "Admin123!"
  }'
```

**Odpowiedź:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "data": {
    "id": "...",
    "email": "admin@restauracja.pl",
    ...
  }
}
```

**Zapisz token do zmiennej:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 1. Pobierz publiczny klucz (publiczny endpoint - nie wymaga autoryzacji):
```bash
curl http://localhost:3000/api/push/public-key
```

**Odpowiedź:**
```json
{
  "success": true,
  "publicKey": "BElGCi..."
}
```

#### 2. Zarejestruj subscription (wymaga autoryzacji):
```bash
# Użyj tokenu z kroku 0 ($TOKEN)
curl -X POST http://localhost:3000/api/push/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/...",
      "keys": {
        "p256dh": "...",
        "auth": "..."
      }
    },
    "deviceInfo": "Chrome on iPhone 14"
  }'
```

#### 3. Pobierz listę urządzeń (wymaga autoryzacji):
```bash
# Użyj tokenu z kroku 0 ($TOKEN)
curl -X GET http://localhost:3000/api/push/devices \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Usuń subscription (wymaga autoryzacji):
```bash
# Użyj tokenu z kroku 0 ($TOKEN)
curl -X DELETE http://localhost:3000/api/push/unsubscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/..."
  }'
```

## Następne kroki

Po skonfigurowaniu backendu, przejdź do implementacji frontendu:
1. Utworzenie Service Worker (`frontend/src/sw.js`)
2. Utworzenie serwisu push (`frontend/src/app/core/services/push.service.ts`)
3. Rejestracja subscription po logowaniu
4. Utworzenie Web App Manifest

Zobacz `WEB_PUSH_IMPLEMENTATION_PLAN.md` w głównym folderze projektu.
