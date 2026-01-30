# 🔐 Implementacja Google reCAPTCHA v3

## ✅ Co zostało zaimplementowane:

### 1. **Backend - Middleware weryfikacji CAPTCHA**
- ✅ Nowy middleware w `backend/src/middleware/recaptcha.js`
- ✅ Weryfikacja tokenu z Google reCAPTCHA API
- ✅ Sprawdzanie score (domyślnie 0.5)
- ✅ Obsługa błędów i timeoutów
- ✅ Możliwość pominięcia w development (`SKIP_RECAPTCHA=true`)

### 2. **Backend - Integracja z endpointem logowania**
- ✅ CAPTCHA wymagana dla `/api/auth/login`
- ✅ Weryfikacja przed przetworzeniem logowania
- ✅ Rate limiting nadal działa

### 3. **Frontend - Integracja z formularzem logowania**
- ✅ Automatyczne ładowanie skryptu Google reCAPTCHA
- ✅ Generowanie tokenu przed wysłaniem formularza
- ✅ Obsługa błędów CAPTCHA
- ✅ Komunikaty dla użytkownika

### 4. **Konfiguracja**
- ✅ Zmienne środowiskowe w `env.example`
- ✅ Możliwość dostosowania score threshold
- ✅ Możliwość pominięcia w development

---

## 📋 Wymagane zmiany w .env:

Dodaj do `backend/.env`:

```env
# Google reCAPTCHA v3
RECAPTCHA_SITE_KEY=twoj_recaptcha_site_key
RECAPTCHA_SECRET_KEY=twoj_recaptcha_secret_key
RECAPTCHA_SCORE_THRESHOLD=0.5
SKIP_RECAPTCHA=false
```

**Dla development (opcjonalnie):**
```env
SKIP_RECAPTCHA=true  # Pomiń weryfikację CAPTCHA w development
```

---

## 🔑 Jak uzyskać klucze reCAPTCHA:

1. **Przejdź do:** https://www.google.com/recaptcha/admin
2. **Kliknij:** "+" (Create)
3. **Wypełnij formularz:**
   - Label: `U kelnerów Admin Panel`
   - reCAPTCHA type: **reCAPTCHA v3** (niewidoczne)
   - Domains: `res-uk.vercel.app`, `localhost` (dla development)
4. **Zaakceptuj** warunki
5. **Skopiuj klucze:**
   - **Site Key** → `RECAPTCHA_SITE_KEY`
   - **Secret Key** → `RECAPTCHA_SECRET_KEY`

---

## 🔄 Jak to działa:

### 1. **Użytkownik otwiera stronę logowania:**
- Skrypt Google reCAPTCHA ładuje się automatycznie
- reCAPTCHA działa w tle (niewidoczne dla użytkownika)

### 2. **Użytkownik klika "Zaloguj się":**
- Frontend generuje token reCAPTCHA
- Token jest wysyłany razem z email i hasłem do backendu

### 3. **Backend weryfikuje token:**
- Wysyła token do Google reCAPTCHA API
- Sprawdza score (0.0 - 1.0)
- Jeśli score < threshold (0.5), blokuje logowanie

### 4. **Jeśli weryfikacja się powiedzie:**
- Kontynuuje normalne logowanie
- Rate limiting nadal działa

---

## 🧪 Testowanie:

### 1. **Test z kluczami testowymi (Google):**
```env
# W frontend/src/app/admin/pages/login/login.component.ts
RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'  # Test key
RECAPTCHA_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'  # Test key
```

**Uwaga:** Klucze testowe zawsze zwracają `success: true`, więc nie testują prawdziwej weryfikacji.

### 2. **Test w development:**
```env
SKIP_RECAPTCHA=true  # Pomiń weryfikację
```

### 3. **Test w produkcji:**
- Użyj prawdziwych kluczy z Google reCAPTCHA
- Sprawdź czy weryfikacja działa poprawnie
- Monitoruj score w logach

---

## 🔒 Bezpieczeństwo:

### ✅ Zalety:
- **Niewidoczne dla użytkownika** - nie przeszkadza w UX
- **Działa w tle** - automatyczna weryfikacja
- **Score-based** - bardziej precyzyjne niż v2
- **Ochrona przed botami** - blokuje automatyczne ataki
- **Ochrona przed brute force** - dodatkowa warstwa bezpieczeństwa

### ⚠️ Uwagi:
- **Wymaga kluczy** - musisz zarejestrować się w Google reCAPTCHA
- **Score threshold** - może wymagać dostosowania (domyślnie 0.5)
- **IP tracking** - Google śledzi IP użytkowników
- **Privacy** - użytkownicy są śledzeni przez Google

---

## 📊 Score Threshold:

- **0.0 - 0.3:** Prawdopodobnie bot
- **0.3 - 0.5:** Podejrzane (może być bot)
- **0.5 - 0.7:** Prawdopodobnie człowiek
- **0.7 - 1.0:** Zdecydowanie człowiek

**Rekomendacja:** 
- Dla logowania: **0.5** (domyślnie)
- Dla bardziej restrykcyjnych: **0.7**
- Dla mniej restrykcyjnych: **0.3**

---

## 🐛 Rozwiązywanie problemów:

### Problem: "reCAPTCHA nie jest załadowane"
**Rozwiązanie:**
- Sprawdź czy skrypt jest załadowany w DevTools
- Sprawdź czy `RECAPTCHA_SITE_KEY` jest poprawny
- Sprawdź czy domena jest dodana w Google reCAPTCHA

### Problem: "CAPTCHA verification failed"
**Rozwiązanie:**
- Sprawdź czy `RECAPTCHA_SECRET_KEY` jest poprawny
- Sprawdź logi backendu dla szczegółów
- Sprawdź czy score threshold nie jest za wysoki

### Problem: "Błąd weryfikacji CAPTCHA"
**Rozwiązanie:**
- Sprawdź połączenie z Google API
- Sprawdź timeout (domyślnie 5 sekund)
- W development użyj `SKIP_RECAPTCHA=true`

---

## 📝 Następne kroki (opcjonalne):

1. **Dodaj logikę:** CAPTCHA tylko po 3 nieudanych próbach
2. **Dodaj monitoring:** Śledź score i podejrzane próby
3. **Dodaj alternatywę:** Jeśli CAPTCHA nie działa, użyj fallback
4. **Dostosuj threshold:** Na podstawie danych z produkcji

---

## ⚠️ WAŻNE:

1. **Zmień klucze testowe** - użyj prawdziwych kluczy w produkcji
2. **Dodaj domeny** - upewnij się że wszystkie domeny są dodane w Google reCAPTCHA
3. **Przetestuj** - sprawdź czy wszystko działa przed wdrożeniem
4. **Monitoruj** - śledź score i podejrzane próby logowania

---

**Status:** ✅ **CAPTCHA ZAIMPLEMENTOWANA**

**Następny krok:** 
1. Zarejestruj się w Google reCAPTCHA
2. Pobierz klucze
3. Dodaj do `.env`
4. Przetestuj!
