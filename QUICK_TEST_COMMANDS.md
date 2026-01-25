# 🚀 Szybkie komendy - Testy pojedynczo

## ✅ Najprostszy sposób:

### Uruchom wszystkie testy pojedynczo:
```bash
npm run test:e2e:security:single
```

Lub bezpośrednio:
```bash
node run-tests-one-by-one.js
```

---

## 🔍 Ręczne uruchomienie pojedynczych testów:

### Podstawowe testy (szybkie):
```bash
# TC-SEC-001 - Link nie widoczny
npx playwright test e2e/security -g "TC-SEC-001"

# TC-SEC-002 - Bezpośredni dostęp
npx playwright test e2e/security -g "TC-SEC-002"

# TC-SEC-004 - Blokada dostępu
npx playwright test e2e/security -g "TC-SEC-004"
```

### Testy z timeoutem (30 sekund):
```bash
npx playwright test e2e/security -g "TC-SEC-001" --timeout=30000
```

### Testy z widocznym przeglądarką (debug):
```bash
npx playwright test e2e/security -g "TC-SEC-001" --headed
```

---

## 📋 Lista wszystkich testów:

```bash
# Admin Panel Access
npx playwright test e2e/security -g "TC-SEC-001"
npx playwright test e2e/security -g "TC-SEC-002"
npx playwright test e2e/security -g "TC-SEC-004"

# Brute Force Protection
npx playwright test e2e/security -g "TC-SEC-005"

# Enumeration Attack Protection
npx playwright test e2e/security -g "TC-SEC-007"
npx playwright test e2e/security -g "TC-SEC-008"

# CORS and API Security
npx playwright test e2e/security -g "TC-SEC-009"
npx playwright test e2e/security -g "TC-SEC-010"
npx playwright test e2e/security -g "TC-SEC-011"

# Input Validation
npx playwright test e2e/security -g "TC-SEC-012"
npx playwright test e2e/security -g "TC-SEC-013"
npx playwright test e2e/security -g "TC-SEC-014"
npx playwright test e2e/security -g "TC-SEC-015"

# Authorization
npx playwright test e2e/security -g "TC-SEC-016"
npx playwright test e2e/security -g "TC-SEC-017"

# Rate Limiting
npx playwright test e2e/security -g "TC-SEC-021"

# Password Security
npx playwright test e2e/security -g "TC-SEC-023"

# Seed Endpoint
npx playwright test e2e/security -g "TC-SEC-024"
npx playwright test e2e/security -g "TC-SEC-025"

# XSS/CSRF Protection
npx playwright test e2e/security -g "TC-SEC-027"
npx playwright test e2e/security -g "TC-SEC-028"
```

---

## ⚠️ Jeśli test się zawiesza:

1. **Sprawdź czy aplikacja działa:**
   - Frontend: `http://localhost:4200`
   - Backend: `http://localhost:3000/api/health`

2. **Uruchom z `--headed` żeby zobaczyć co się dzieje:**
   ```bash
   npx playwright test e2e/security -g "TC-SEC-007" --headed
   ```

3. **Sprawdź logi backendu** - może być problem z rate limiting

4. **Zrestartuj backend** jeśli rate limiting blokuje:
   ```bash
   cd backend
   # Ctrl+C żeby zatrzymać
   npm run start
   ```

---

**Status:** ✅ **GOTOWE - Uruchom `npm run test:e2e:security:single`**
