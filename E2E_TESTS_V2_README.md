# 🧪 Security E2E Tests v2 - Senior Tester Level

## ✅ Co zostało poprawione:

### 1. **Niezawodność**
- ✅ Właściwe timeouty dla każdej operacji
- ✅ Helper functions dla często używanych operacji
- ✅ Sprawdzanie dostępności aplikacji przed testami
- ✅ Lepsze error handling z czytelnymi komunikatami

### 2. **Izolacja testów**
- ✅ Każdy test jest niezależny
- ✅ `beforeAll` sprawdza dostępność aplikacji
- ✅ Brak zależności między testami
- ✅ Unikanie flaky testów

### 3. **Struktura**
- ✅ Helper functions (`ensureAppAvailable`, `waitForElement`)
- ✅ Czytelne nazwy testów (SEC-001, SEC-002, etc.)
- ✅ Logiczne grupowanie testów
- ✅ Komentarze wyjaśniające

### 4. **Rzeczywiste testy bezpieczeństwa**
- ✅ Testy rzeczywistych scenariuszy ataków
- ✅ Sprawdzanie nagłówków bezpieczeństwa
- ✅ Ochrona przed injection
- ✅ CORS validation
- ✅ Rate limiting

---

## 🚀 Uruchomienie:

### Wszystkie testy v2:
```bash
npm run test:e2e:security:v2
```

### Pojedynczy test:
```bash
npx playwright test e2e/security/security-v2.e2e.spec.ts -g "SEC-001"
```

### Z widoczną przeglądarką (debug):
```bash
npx playwright test e2e/security/security-v2.e2e.spec.ts --headed
```

---

## 📋 Lista testów:

### Admin Panel Access Control
- **SEC-001**: Panel admina nie widoczny w footerze
- **SEC-002**: Bezpośredni URL do logowania dostępny
- **SEC-003**: Przekierowanie z dashboard

### Authentication Security
- **SEC-004**: Formularz wymaga obu pól
- **SEC-005**: Email walidowany przez HTML5
- **SEC-006**: Nieprawidłowe dane zwracają błąd

### API Security
- **SEC-007**: Bezpieczne nagłówki HTTP
- **SEC-008**: Wymagana autoryzacja
- **SEC-009**: Nieprawidłowy token odrzucany
- **SEC-010**: Brak szczegółów błędów w odpowiedziach

### Input Validation & Injection Protection
- **SEC-011**: Ochrona przed NoSQL injection
- **SEC-012**: Walidacja długości danych
- **SEC-013**: Ochrona przed XSS

### CORS & Origin Validation
- **SEC-014**: Sprawdzanie origin w CORS

### Rate Limiting
- **SEC-015**: Rate limiting dla logowania

### Endpoint Security
- **SEC-016**: Seed endpoint wyłączony w produkcji
- **SEC-017**: Health endpoint publiczny

### Password Security
- **SEC-018**: Hasła nie zwracane w odpowiedziach

---

## 🔍 Różnice vs v1:

| Aspekt | v1 | v2 |
|--------|----|----|
| Timeouty | Często brak | Zawsze ustawione |
| Error handling | Podstawowy | Zaawansowany |
| Helper functions | Brak | Są |
| Izolacja | Częściowa | Pełna |
| Flaky tests | Tak | Nie |
| Czytelność | Średnia | Wysoka |

---

## ⚠️ Wymagania:

Przed uruchomieniem testów:
- ✅ Frontend działa na `http://localhost:4200`
- ✅ Backend działa na `http://localhost:3000`
- ✅ MongoDB połączona

Testy automatycznie sprawdzą dostępność przed uruchomieniem.

---

## 📊 Oczekiwane wyniki:

- **18 testów** w sumie
- **~15-17 powinno przejść** (w zależności od konfiguracji)
- **0-2 może być skipped** (np. SEC-016 w development)
- **Brak timeoutów** - wszystkie testy mają właściwe timeouty

---

**Status:** ✅ **GOTOWE - Uruchom `npm run test:e2e:security:v2`**
