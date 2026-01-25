# 🧪 Security API Tests - Bez Playwright

## ✅ Dlaczego bez Playwright?

**Playwright używa przeglądarki** - to może powodować:
- ❌ Zawieszanie się testów
- ❌ Wolne wykonanie
- ❌ Problemy z timeoutami
- ❌ Wymaga działającego frontendu

**Testy API bez przeglądarki:**
- ✅ Szybsze (tylko HTTP requesty)
- ✅ Bardziej niezawodne
- ✅ Nie wymagają frontendu
- ✅ Testują rzeczywiste bezpieczeństwo API

---

## 🚀 Instalacja:

```bash
cd backend
npm install -D axios jest
```

---

## ▶️ Uruchomienie:

### Wszystkie testy:
```bash
npm test
```

### Tylko testy bezpieczeństwa:
```bash
npm run test:security
```

---

## 📋 Lista testów:

### Authentication Security
- **SEC-API-001**: Login wymaga obu pól
- **SEC-API-002**: Identyczne komunikaty błędów (enumeration protection)

### Authorization Security
- **SEC-API-003**: Wymagany token JWT
- **SEC-API-004**: Nieprawidłowy token odrzucany

### Input Validation & Injection Protection
- **SEC-API-005**: Ochrona przed NoSQL injection
- **SEC-API-006**: Walidacja długości danych

### HTTP Security Headers
- **SEC-API-007**: Bezpieczne nagłówki HTTP
- **SEC-API-008**: Brak szczegółów błędów

### CORS Security
- **SEC-API-009**: Sprawdzanie origin

### Rate Limiting
- **SEC-API-010**: Rate limiting dla logowania

### Endpoint Security
- **SEC-API-011**: Seed endpoint wyłączony w produkcji
- **SEC-API-012**: Health endpoint publiczny

### Password Security
- **SEC-API-013**: Hasła nie zwracane w odpowiedziach

---

## ⚠️ Wymagania:

**Przed uruchomieniem:**
- ✅ Backend musi działać: `npm run start` (w `backend/`)
- ✅ MongoDB połączona
- ✅ Zmienne środowiskowe ustawione (`.env`)

**Testy automatycznie sprawdzą dostępność API przed uruchomieniem.**

---

## 🔍 Debugowanie:

### Zobacz szczegóły:
```bash
npm test -- --verbose
```

### Tylko jeden test:
```bash
npm test -- -t "SEC-API-001"
```

### Z coverage:
```bash
npm test -- --coverage
```

---

## 📊 Oczekiwane wyniki:

- **13 testów** w sumie
- **Wszystkie powinny przejść** (jeśli backend działa)
- **Brak timeoutów** - wszystkie testy mają właściwe timeouty
- **Szybkie wykonanie** - ~5-10 sekund dla wszystkich testów

---

## 🎯 Zalety vs Playwright:

| Aspekt | Playwright | API Tests (Jest) |
|--------|------------|------------------|
| Szybkość | Wolne (przeglądarka) | Szybkie (HTTP) |
| Niezawodność | Często się zawiesza | Bardzo niezawodne |
| Wymagania | Frontend + Backend | Tylko Backend |
| Timeouty | Częste problemy | Rzadkie problemy |
| Debugowanie | Trudne | Łatwe |

---

**Status:** ✅ **GOTOWE - Uruchom `npm run test:security` w backend/**
