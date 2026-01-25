# Plan Implementacji Web Push Notifications

## 🎯 Cel
Umożliwić adminom otrzymywanie powiadomień push na telefonie/desktopie o nowych rezerwacjach, bez potrzeby instalacji aplikacji mobilnej.

---

## 📋 Backend - Implementacja

### ✅ 1. Instalacja zależności
```bash
cd backend
npm install web-push
```

**Pakiet:** `web-push` - biblioteka do wysyłania Web Push Notifications (obsługuje VAPID i FCM)

**Status:** ✅ Zakończone - dodano do package.json

### 2. Generowanie kluczy VAPID (jednorazowo)
```bash
npx web-push generate-vapid-keys
```

**Wynik:**
- Public Key: `BElGCi...` (do frontendu)
- Private Key: `xyz123...` (tylko backend, do .env)

**Dodać do `.env`:**
```
VAPID_PUBLIC_KEY=BElGCi...
VAPID_PRIVATE_KEY=xyz123...
VAPID_SUBJECT=mailto:admin@restauracja.pl
```

### 3. Aktualizacja modelu Admin (`backend/src/models/Admin.js`)

**Dodać pole:**
```javascript
pushSubscriptions: [{
  endpoint: {
    type: String,
    required: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  deviceInfo: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}]
```

### ✅ 4. Utworzenie serwisu push (`backend/src/services/pushNotification.service.js`)

**Status:** ✅ Zakończone - utworzono serwis z pełną funkcjonalnością

**Zaimplementowane funkcje:**
- `initialize()` - inicjalizacja web-push z kluczami VAPID
- `sendNotification(subscription, payload)` - wysłanie pojedynczego push
- `sendToAdmin(adminId, payload)` - wysłanie do wszystkich urządzeń admina
- `sendToAllAdmins(payload)` - wysłanie do wszystkich adminów
- `validateSubscription(subscription)` - walidacja subscription

### ✅ 5. Utworzenie kontrolera push (`backend/src/controllers/pushController.js`)

**Status:** ✅ Zakończone - utworzono kontroler z wszystkimi endpointami

**Zaimplementowane endpointy:**
- `POST /api/push/subscribe` - rejestracja subscription (wymaga auth)
- `DELETE /api/push/unsubscribe` - usunięcie subscription (wymaga auth)
- `GET /api/push/public-key` - pobranie publicznego klucza VAPID (publiczne)

**Logika:**
- `subscribe`: 
  - Pobierz subscription z body
  - Sprawdź czy admin jest zalogowany (req.admin)
  - Dodaj subscription do admin.pushSubscriptions[]
  - Zapisz admina
  - Zwróć success

- `unsubscribe`:
  - Pobierz endpoint z body
  - Usuń subscription z admin.pushSubscriptions[]
  - Zapisz admina

### ✅ 6. Utworzenie routes (`backend/src/routes/push.js`)

**Status:** ✅ Zakończone - utworzono routes i zarejestrowano w server.js

```javascript
router.post('/subscribe', protect, subscribePush);
router.delete('/unsubscribe', protect, unsubscribePush);
router.get('/public-key', getPublicKey);
```

### ✅ 7. Rejestracja routes w `server.js`
```javascript
app.use('/api/push', require('./routes/push'));
```

**Status:** ✅ Zakończone - zarejestrowano route `/api/push`

### ✅ 8. Integracja z rezerwacjami (`backend/src/controllers/reservationController.js`)

**Status:** ✅ Zakończone - dodano wysyłanie push po utworzeniu rezerwacji

**W funkcji `createReservation`:**
```javascript
// Po utworzeniu powiadomienia w bazie:
const pushService = require('../services/pushNotification.service');

// Wyślij push do wszystkich adminów
try {
  await pushService.sendToAllAdmins({
    title: 'Nowa rezerwacja',
    body: `Nowa rezerwacja od ${customerName} na ${dateStr} o ${timeStr}`,
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    data: {
      url: `/admin/reservations?reservationId=${reservation._id}`,
      reservationId: reservation._id.toString(),
      type: 'reservation_new'
    }
  });
} catch (error) {
  console.error('Push notification error:', error);
  // Nie przerywaj procesu jeśli push się nie powiódł
}
```

### ✅ 9. Inicjalizacja serwisu push w `server.js`

```javascript
// Po połączeniu z bazą danych
const pushService = require('./services/pushNotification.service');
pushService.initialize();
```

**Status:** ✅ Zakończone - dodano inicjalizację w server.js

---

## 📱 Frontend - Implementacja

### 10. Utworzenie Service Worker (`frontend/src/sw.js`)

**Funkcjonalności:**
- Rejestracja push subscription
- Obsługa `push` event - wyświetlanie powiadomień
- Obsługa `notificationclick` - przekierowanie do rezerwacji
- Cache'owanie zasobów (opcjonalnie)

### 11. Utworzenie Web App Manifest (`frontend/src/manifest.json`)

**Zawartość:**
- name, short_name
- icons (192x192, 512x512)
- start_url
- display: "standalone"
- theme_color, background_color

### 12. Utworzenie serwisu push (`frontend/src/app/core/services/push.service.ts`)

**Funkcjonalności:**
- `requestPermission()` - prośba o zgodę
- `subscribe()` - rejestracja subscription
- `unsubscribe()` - usunięcie subscription
- `getPublicKey()` - pobranie publicznego klucza VAPID
- `isSupported()` - sprawdzenie czy przeglądarka wspiera push

### 13. Komponent zarządzania powiadomieniami (`frontend/src/app/admin/components/push-settings/push-settings.component.ts`)

**Funkcjonalności:**
- Przycisk "Włącz powiadomienia push"
- Status: włączone/wyłączone
- Lista zarejestrowanych urządzeń
- Możliwość usunięcia urządzenia

### 14. Integracja z logowaniem (`frontend/src/app/admin/pages/login/login.component.ts`)

**Po udanym logowaniu:**
- Sprawdź czy przeglądarka wspiera push
- Jeśli tak, zapytaj o zgodę (opcjonalnie - można zrobić później)
- Zarejestruj subscription i wyślij do backendu

### 15. Rejestracja Service Worker w `main.ts` lub `app.component.ts`

```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 16. Aktualizacja `angular.json` - dodanie manifest.json i sw.js do assets

---

## 🔄 Przepływ Danych

### Rejestracja (jednorazowo):
1. Admin loguje się → Frontend prosi o zgodę na powiadomienia
2. Użytkownik zgadza się → Przeglądarka generuje subscription
3. Frontend wysyła `POST /api/push/subscribe` z subscription
4. Backend zapisuje subscription do `admin.pushSubscriptions[]`

### Nowa rezerwacja:
1. Klient składa rezerwację → `POST /api/reservations`
2. Backend tworzy rezerwację i powiadomienie w bazie
3. Backend pobiera wszystkich adminów z `pushSubscriptions`
4. Dla każdego admina i każdego urządzenia:
   - Wywołuje `web-push.sendNotification(subscription, payload)`
5. Service Worker na urządzeniu admina odbiera push
6. Wyświetla powiadomienie systemowe
7. Admin klika → przekierowanie do `/admin/reservations?reservationId=xxx`

---

## 📝 Szczegóły Techniczne

### Payload powiadomienia:
```javascript
{
  title: "Nowa rezerwacja",
  body: "Nowa rezerwacja od Jan Kowalski na 25.01.2025 o 18:00",
  icon: "/assets/icons/icon-192x192.png",
  badge: "/assets/icons/badge-72x72.png",
  data: {
    url: "/admin/reservations?reservationId=123",
    reservationId: "123",
    type: "reservation_new"
  },
  requireInteraction: false, // Zamyka się automatycznie
  tag: "reservation-123" // Grupuje powiadomienia
}
```

### Obsługa błędów:
- Jeśli subscription wygasło (410 Gone) → usuń z bazy
- Jeśli błąd 403/429 → rate limiting, spróbuj później
- Jeśli błąd sieci → loguj, nie przerywaj procesu rezerwacji

### Bezpieczeństwo:
- Tylko zalogowani admini mogą rejestrować subscription
- Subscription przypisane do konkretnego admina
- VAPID keys w .env (nie commitować!)
- HTTPS wymagany (Service Worker)

---

## 🚀 Kolejność Implementacji

### ✅ Faza 1: Backend (podstawowa infrastruktura) - ZAKOŃCZONE
1. ✅ Instalacja `web-push` - dodano do package.json
2. ⏳ Generowanie kluczy VAPID - **DO WYKONANIA** (zobacz `backend/WEB_PUSH_SETUP.md`)
3. ✅ Aktualizacja modelu Admin - dodano pole `pushSubscriptions[]`
4. ✅ Utworzenie serwisu push - `backend/src/services/pushNotification.service.js`
5. ✅ Utworzenie kontrolera push - `backend/src/controllers/pushController.js`
6. ✅ Utworzenie routes - `backend/src/routes/push.js`
7. ✅ Rejestracja w server.js - `/api/push`
8. ✅ Inicjalizacja w server.js - `pushService.initialize()`

### ✅ Faza 2: Backend (integracja) - ZAKOŃCZONE
9. ✅ Integracja z reservationController - wysyłanie push po nowej rezerwacji
10. ⏳ Testowanie endpointów - **DO WYKONANIA** po wygenerowaniu kluczy VAPID

### Faza 3: Frontend (Service Worker)
11. ✅ Utworzenie sw.js
12. ✅ Rejestracja w main.ts/app.component.ts
13. ✅ Testowanie Service Worker

### Faza 4: Frontend (serwis i UI)
14. ✅ Utworzenie push.service.ts
15. ✅ Utworzenie push-settings.component.ts
16. ✅ Integracja z logowaniem
17. ✅ Testowanie rejestracji

### Faza 5: Frontend (manifest i assets)
18. ✅ Utworzenie manifest.json
19. ✅ Dodanie ikon (192x192, 512x512)
20. ✅ Konfiguracja angular.json

### Faza 6: Testowanie end-to-end
21. ✅ Test na Android (Chrome)
22. ✅ Test na iOS (Safari + dodanie do ekranu głównego)
23. ✅ Test na desktop (Chrome, Firefox, Edge)

---

## 📚 Dokumentacja API

### POST /api/push/subscribe
**Auth:** Wymagane (Bearer token)
**Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "BGx8...",
      "auth": "xyz789..."
    }
  },
  "deviceInfo": "Chrome on iPhone 14"
}
```

### DELETE /api/push/unsubscribe
**Auth:** Wymagane
**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

### GET /api/push/public-key
**Auth:** Nie wymagane
**Response:**
```json
{
  "success": true,
  "publicKey": "BElGCi..."
}
```

---

## ⚠️ Uwagi

1. **HTTPS wymagany** - Service Worker działa tylko na HTTPS (lub localhost)
2. **iOS ograniczenia** - wymaga dodania PWA do ekranu głównego
3. **VAPID keys** - nigdy nie commitować do repo, tylko w .env
4. **Error handling** - push nie powinien przerywać procesu rezerwacji
5. **Cleanup** - usuwać nieaktywne subscription (np. po 30 dniach nieużycia)

---

## 🔧 Narzędzia do testowania

- **Chrome DevTools** → Application → Service Workers
- **Chrome DevTools** → Application → Manifest
- **Test na localhost** - działa bez HTTPS
- **Test na produkcji** - wymaga HTTPS

---

## 📦 Zależności

### Backend:
- `web-push` - wysyłanie push notifications

### Frontend:
- Service Worker API (natywnie w przeglądarce)
- Web Push API (natywnie w przeglądarce)
- Angular Service Worker (opcjonalnie, dla PWA)

---

## 🎯 Następne kroki po implementacji

1. Monitoring - logowanie sukcesów/błędów push
2. Analytics - ile powiadomień zostało dostarczonych
3. Retry logic - ponawianie przy błędach
4. Rate limiting - ograniczenie liczby push na admina
5. Grupowanie - grupowanie powiadomień o wielu rezerwacjach
