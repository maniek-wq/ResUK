# 🚀 Szybki Start - Testy E2E

## ✅ Testy są teraz w ROOTA projektu!

**Struktura:**
```
Restauracja/
├── e2e/
│   └── security/
│       └── security.e2e.spec.ts  ← Testy tutaj
├── playwright.config.ts          ← Konfiguracja tutaj
└── package.json                  ← Skrypty tutaj
```

---

## 📦 Instalacja (tylko raz):

```bash
# Z roota projektu
npm install -D @playwright/test
npx playwright install
```

---

## ▶️ Uruchomienie testów:

### Z roota projektu:
```bash
npm run test:e2e:security
```

### Lub bezpośrednio:
```bash
npx playwright test e2e/security --reporter=line
```

---

## ⚠️ WAŻNE: Przed uruchomieniem testów

**Testy wymagają działającej aplikacji!**

### Terminal 1 - Frontend:
```bash
cd frontend
npm run start
```

### Terminal 2 - Backend:
```bash
cd backend
npm run start
```

### Terminal 3 - Testy (z roota):
```bash
npm run test:e2e:security
```

---

## 🔍 Debugowanie:

### Zobacz co się dzieje (headed mode):
```bash
npx playwright test e2e/security --headed
```

### Tylko jeden test:
```bash
npx playwright test e2e/security/security.e2e.spec.ts -g "TC-SEC-001"
```

### Z UI mode:
```bash
npx playwright test --ui
```

---

## 📊 Progress

Reporter `line` pokazuje progress w czasie rzeczywistym:
```
Running 28 tests using 1 worker

  ✓ e2e/security/security.e2e.spec.ts:37:9 › TC-SEC-001 (1.2s)
  ✓ e2e/security/security.e2e.spec.ts:49:9 › TC-SEC-002 (0.8s)
  ...
```

Jeśli nie widzisz progressu - aplikacja prawdopodobnie nie działa!

---

**Status:** ✅ **GOTOWE - Uruchom z roota projektu!**
