# 🧪 Testy E2E Bezpieczeństwa

## ⚠️ WAŻNE: Przed uruchomieniem testów

**Testy wymagają działającej aplikacji!**

### 1. Uruchom frontend:
```bash
cd frontend
npm run start
```
Frontend powinien działać na `http://localhost:4200`

### 2. Uruchom backend (w osobnym terminalu):
```bash
cd backend
npm run start
```
Backend powinien działać na `http://localhost:3000`

### 3. Dopiero teraz uruchom testy:
```bash
cd frontend
npm run test:e2e:security
```

---

## 🐛 Rozwiązywanie problemów

### Problem: Testy się zawieszają / czekają

**Przyczyna:** Aplikacja nie działa na `localhost:4200` lub `localhost:3000`

**Rozwiązanie:**
1. Sprawdź czy frontend działa: otwórz `http://localhost:4200` w przeglądarce
2. Sprawdź czy backend działa: otwórz `http://localhost:3000/api/health` w przeglądarce
3. Jeśli nie działają - uruchom je w osobnych terminalach

### Problem: Timeout errors

**Rozwiązanie:** Zwiększ timeout w `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 sekund zamiast 30
```

### Problem: Testy są zbyt wolne

**Rozwiązanie:** 
- Uruchom tylko wybrane testy: `npx playwright test e2e/security/security.e2e.spec.ts -g "TC-SEC-001"`
- Zmniejsz liczbę workerów: `workers: 1` (już ustawione)

---

## 📝 Uruchomienie testów

### Wszystkie testy bezpieczeństwa:
```bash
npm run test:e2e:security
```

### Konkretny test:
```bash
npx playwright test e2e/security/security.e2e.spec.ts -g "TC-SEC-001"
```

### Z UI mode (interaktywny):
```bash
npm run test:e2e:ui
```

### W trybie debug:
```bash
npm run test:e2e:debug
```

---

## ⚙️ Konfiguracja

### Zmienne środowiskowe:

Utwórz plik `.env.e2e` w katalogu `frontend`:

```env
# Frontend URL
E2E_BASE_URL=http://localhost:4200

# Backend API URL
E2E_API_URL=http://localhost:3000
```

---

## 📊 Raporty

Po uruchomieniu testów:

```bash
# Otwórz HTML report
npx playwright show-report
```

---

**Status:** ✅ **GOTOWE DO UŻYCIA**
