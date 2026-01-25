# 🔧 Naprawa TC-SEC-007 - Zawieszenie testu

## Problem:
Test `TC-SEC-007` zawiesza się podczas czekania na komunikat błędu.

## Przyczyna:
- Test czeka na element `.text-red-400` bez timeoutu
- Jeśli backend nie odpowiada, test się zawiesza
- Brak sprawdzenia czy aplikacja działa

## Rozwiązanie:

### 1. ✅ Dodane sprawdzenie dostępności aplikacji
```typescript
const response = await page.goto(`${BASE_URL}/admin/login`, { 
  waitUntil: 'networkidle', 
  timeout: 10000 
});
if (!response || !response.ok()) {
  throw new Error(`Aplikacja nie jest dostępna...`);
}
```

### 2. ✅ Dodane timeouty do wszystkich akcji
```typescript
await page.fill('input[type="email"]', '...', { timeout: 5000 });
await page.waitForSelector('.text-red-400', { timeout: 10000 });
```

### 3. ✅ Lepsze error handling
- Sprawdzanie czy komunikat się pojawił
- Sprawdzanie czy tekst został pobrany
- Lepsze komunikaty błędów

### 4. ✅ Poprawione również:
- `TC-SEC-008`: Dodane timeouty
- `TC-SEC-012`: Dodane sprawdzenie dostępności
- `TC-SEC-013`: Dodane sprawdzenie dostępności

---

## Uruchom ponownie:

```bash
npm run test:e2e:security
```

**Jeśli nadal się zawiesza:**
1. Sprawdź czy frontend działa: `http://localhost:4200`
2. Sprawdź czy backend działa: `http://localhost:3000/api/health`
3. Uruchom tylko ten test: `npx playwright test e2e/security -g "TC-SEC-007"`

---

**Status:** ✅ **NAPRAWIONE - Dodane timeouty i sprawdzenia!**
