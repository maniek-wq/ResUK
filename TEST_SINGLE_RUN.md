# 🧪 Uruchamianie testów pojedynczo

## Problem:
Testy się zawieszają gdy są uruchamiane razem.

## Rozwiązanie:
Uruchom testy **pojedynczo** żeby zidentyfikować, który test się zawiesza.

---

## 🚀 Sposoby uruchomienia:

### 1. **Automatyczny skrypt (PowerShell)** - ZALECANE

```bash
npm run test:e2e:security:single
```

Lub bezpośrednio:
```powershell
.\run-tests-single.ps1
```

Skrypt uruchomi każdy test osobno i pokaże który przechodzi, a który się zawiesza.

---

### 2. **Ręcznie - jeden test**

```bash
# Test TC-SEC-001
npx playwright test e2e/security -g "TC-SEC-001" --reporter=line

# Test TC-SEC-002
npx playwright test e2e/security -g "TC-SEC-002" --reporter=line

# Test TC-SEC-005 (rate limiting)
npx playwright test e2e/security -g "TC-SEC-005" --reporter=line
```

---

### 3. **Z timeoutem (30 sekund)**

```bash
npx playwright test e2e/security -g "TC-SEC-001" --timeout=30000 --reporter=line
```

---

### 4. **Z headed mode (zobacz co się dzieje)**

```bash
npx playwright test e2e/security -g "TC-SEC-001" --headed --reporter=line
```

---

## 📋 Lista testów:

- `TC-SEC-001` - Link do panelu admina NIE widoczny
- `TC-SEC-002` - Bezpośredni dostęp do /admin/login
- `TC-SEC-003` - Przekierowanie zalogowanych (SKIP)
- `TC-SEC-004` - Blokada dostępu bez logowania
- `TC-SEC-005` - Rate limiting (może być wolny)
- `TC-SEC-007` - Enumeration attack protection
- `TC-SEC-008` - Czas odpowiedzi
- `TC-SEC-009` - CORS blocking
- `TC-SEC-010` - Helmet headers
- `TC-SEC-011` - Error details hiding
- `TC-SEC-012` - Email validation
- `TC-SEC-013` - Password required
- `TC-SEC-014` - Input length validation
- `TC-SEC-015` - NoSQL injection protection
- `TC-SEC-016` - JWT required
- `TC-SEC-017` - Invalid JWT rejected
- `TC-SEC-021` - Login rate limiting
- `TC-SEC-023` - Password hashing
- `TC-SEC-024` - Seed endpoint disabled
- `TC-SEC-025` - Seed token required
- `TC-SEC-027` - XSS protection
- `TC-SEC-028` - CSRF protection

---

## 🔍 Identyfikacja problemu:

Jeśli test się zawiesza:
1. Sprawdź czy frontend działa: `http://localhost:4200`
2. Sprawdź czy backend działa: `http://localhost:3000/api/health`
3. Uruchom z `--headed` żeby zobaczyć co się dzieje
4. Sprawdź logi backendu

---

## ⚠️ Uwaga:

**Przed uruchomieniem testów:**
- ✅ Frontend musi działać (`npm run start` w `frontend/`)
- ✅ Backend musi działać (`npm run start` w `backend/`)
- ✅ Rate limiting może blokować - zrestartuj backend jeśli trzeba

---

**Status:** ✅ **GOTOWE - Uruchom `npm run test:e2e:security:single`**
