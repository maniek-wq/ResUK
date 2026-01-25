# Debugowanie Web Push Notifications

## Problem: Service Worker nie jest zarejestrowany

### Krok 1: Sprawdź czy aplikacja działa
1. Uruchom frontend: `npm start` w folderze `frontend`
2. Otwórz aplikację w przeglądarce: `http://localhost:4200`
3. Otwórz DevTools (F12) → Console

### Krok 2: Sprawdź błędy w konsoli
Szukaj komunikatów:
- `[Main] Service Worker zarejestrowany` - sukces
- `[Main] Błąd rejestracji Service Workera` - błąd
- `Failed to register a ServiceWorker` - błąd

### Krok 3: Sprawdź czy plik sw.js jest dostępny
1. W przeglądarce otwórz: `http://localhost:4200/sw.js`
2. Powinieneś zobaczyć kod Service Workera
3. Jeśli widzisz 404, plik nie został skopiowany lub dev server wymaga restartu

### Krok 4: Sprawdź Service Workers w DevTools
1. DevTools → Application → Service Workers
2. Powinien być widoczny Service Worker dla `http://localhost:4200`
3. Status powinien być "activated and is running"

### Krok 5: Sprawdź Network tab
1. DevTools → Network
2. Odśwież stronę (F5)
3. Szukaj requestu do `/sw.js`
4. Status powinien być 200 (OK)

## Możliwe problemy i rozwiązania

### Problem 1: Plik sw.js nie jest dostępny (404)
**Rozwiązanie:**
- Plik `sw.js` powinien być w `src/sw.js` (root src folder)
- Sprawdź czy plik istnieje: `frontend/src/sw.js`
- W `angular.json` plik jest skonfigurowany do kopiowania do roota output
- **WAŻNE:** Zrestartuj dev server (`Ctrl+C` i `npm start`) po zmianach w `angular.json`
- W dev mode, Angular może wymagać pełnego restartu aby załadować nowe pliki z assets

### Problem 2: Service Worker nie rejestruje się automatycznie
**Rozwiązanie:**
- Sprawdź konsolę przeglądarki pod kątem błędów
- Upewnij się, że używasz HTTPS lub localhost (Service Worker wymaga bezpiecznego kontekstu)
- Sprawdź czy `'serviceWorker' in navigator` zwraca `true`

### Problem 3: Błąd "Service Worker registration failed"
**Możliwe przyczyny:**
- Błąd składni w `sw.js`
- Problem z CORS
- Service Worker już zarejestrowany z innym scope

**Rozwiązanie:**
1. Otwórz `/sw.js` w przeglądarce i sprawdź czy nie ma błędów składni
2. W DevTools → Application → Service Workers → Unregister wszystkie stare Service Workers
3. Odśwież stronę (Ctrl+Shift+R)

### Problem 4: Service Worker rejestruje się, ale nie aktywuje
**Rozwiązanie:**
- W DevTools → Application → Service Workers
- Kliknij "Update" przy Service Worker
- Lub kliknij "Unregister" i odśwież stronę

## Testowanie ręczne

### Test 1: Ręczna rejestracja Service Workera
Otwórz konsolę przeglądarki i wykonaj:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('✅ Zarejestrowano:', reg))
    .catch(err => console.error('❌ Błąd:', err));
} else {
  console.log('❌ Service Worker nie jest wspierany');
}
```

### Test 2: Sprawdź czy Service Worker jest aktywny
```javascript
navigator.serviceWorker.getRegistration()
  .then(reg => {
    if (reg) {
      console.log('✅ Service Worker zarejestrowany:', reg);
      console.log('Scope:', reg.scope);
      console.log('Active:', reg.active);
    } else {
      console.log('❌ Brak zarejestrowanego Service Workera');
    }
  });
```

### Test 3: Sprawdź uprawnienia do powiadomień
```javascript
Notification.requestPermission()
  .then(permission => console.log('Uprawnienia:', permission));
```

## Następne kroki po udanej rejestracji

1. **Zaloguj się jako admin** - powinno automatycznie zarejestrować push subscription
2. **Sprawdź w konsoli:**
   - `[PushService] Service Worker zarejestrowany`
   - `[PushService] Subscription zarejestrowane`
3. **Sprawdź w backendzie:**
   - Uruchom skrypt testowy: `.\test-push-endpoints.ps1`
   - Powinieneś zobaczyć zarejestrowane urządzenie

## Wsparcie

Jeśli problem nadal występuje:
1. Sprawdź pełny log z konsoli przeglądarki
2. Sprawdź logi backendu
3. Upewnij się, że backend działa i klucze VAPID są skonfigurowane
