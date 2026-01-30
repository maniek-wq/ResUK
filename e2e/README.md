# 🧪 Testy E2E Bezpieczeństwa

## 📋 Opis

Testy end-to-end bezpieczeństwa dla aplikacji U kelnerów. Testy sprawdzają:

- ✅ Ochronę przed atakami brute force
- ✅ Ochronę przed enumeration attacks
- ✅ CORS i bezpieczeństwo API
- ✅ Autoryzację i dostęp do panelu admina
- ✅ Rate limiting
- ✅ Walidację danych wejściowych
- ✅ Ochronę przed XSS/CSRF
- ✅ Bezpieczeństwo endpointów

---

## 🚀 Instalacja

```bash
# Zainstaluj Playwright
npm install -D @playwright/test

# Zainstaluj przeglądarki
npx playwright install
```

---

## ▶️ Uruchomienie testów

### Wszystkie testy bezpieczeństwa:
```bash
npm run test:e2e:security
```

### Konkretny test:
```bash
npx playwright test security/security.e2e.spec.ts
```

### Z UI mode (interaktywny):
```bash
npx playwright test --ui
```

### W trybie debug:
```bash
npx playwright test --debug
```

### Tylko w Chrome:
```bash
npx playwright test --project=chromium
```

---

## ⚙️ Konfiguracja

### Zmienne środowiskowe:

Utwórz plik `.env.e2e`:

```env
# Frontend URL
E2E_BASE_URL=http://localhost:4200

# Backend API URL
E2E_API_URL=http://localhost:3000

# Testowe dane (NIE używaj prawdziwych!)
E2E_TEST_ADMIN_EMAIL=admin@test.com
E2E_TEST_ADMIN_PASSWORD=TestPassword123!@#
```

### W `package.json` dodaj:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:security": "playwright test e2e/security",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 📝 Test Cases

### TC-SEC-001: Link do panelu admina NIE powinien być widoczny w footerze
**Cel:** Sprawdzenie czy link do panelu admina nie jest widoczny publicznie

### TC-SEC-002: Bezpośredni dostęp do /admin/login
**Cel:** Sprawdzenie czy bezpośredni URL działa

### TC-SEC-005: Rate limiting - blokada po 5 próbach
**Cel:** Sprawdzenie czy rate limiting działa poprawnie

### TC-SEC-007: Ochrona przed enumeration
**Cel:** Sprawdzenie czy komunikaty błędów są identyczne

### TC-SEC-009: CORS - blokowanie nieznanych originów
**Cel:** Sprawdzenie czy CORS działa w produkcji

### TC-SEC-010: Bezpieczne nagłówki HTTP
**Cel:** Sprawdzenie czy Helmet działa poprawnie

### TC-SEC-015: Ochrona przed NoSQL injection
**Cel:** Sprawdzenie czy dane są sanitizowane

### TC-SEC-020: Rate limiting API
**Cel:** Sprawdzenie czy rate limiting działa na API

---

## 🔍 Interpretacja wyników

### ✅ Test passed
- Funkcjonalność bezpieczeństwa działa poprawnie

### ❌ Test failed
- **Krytyczne:** Natychmiast napraw (np. brak rate limiting)
- **Wysokie:** Napraw w ciągu 24h (np. ujawnianie błędów)
- **Średnie:** Napraw w ciągu tygodnia (np. brak walidacji)

---

## 📊 Raporty

Po uruchomieniu testów:

```bash
# Otwórz HTML report
npx playwright show-report
```

---

## ⚠️ Uwagi

1. **Nie używaj prawdziwych danych produkcyjnych** w testach
2. **Rate limiting** - niektóre testy mogą wymagać czekania
3. **CORS** - testy mogą się różnić w development vs production
4. **Tokeny JWT** - wymagają mockowania lub testowych kont

---

## 🔧 Troubleshooting

### Problem: Testy nie znajdują elementów
- Sprawdź czy aplikacja działa (`npm run start`)
- Sprawdź czy backend działa (`cd backend && npm run start`)
- Sprawdź `E2E_BASE_URL` i `E2E_API_URL`

### Problem: Rate limiting blokuje testy
- Uruchom testy sekwencyjnie (`workers: 1`)
- Zwiększ timeout między requestami
- Użyj różnych IP (jeśli testujesz na produkcji)

### Problem: CORS blokuje requesty
- W development CORS może pozwalać na wszystko
- W produkcji sprawdź `FRONTEND_URL` w backendzie

---

**Status:** ✅ **GOTOWE DO UŻYCIA**
