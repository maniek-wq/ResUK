# 🚨 Szybkie rozwiązanie: Admin nie istnieje w bazie

## Problem
Logi pokazują: `❌ Login failed: Admin not found for email: admin@restauracja.pl`

To znaczy, że admin nie został zaseedowany w bazie produkcyjnej na Render.

## Rozwiązanie: Seed przez API

### Krok 1: Sprawdź czy SEED_TOKEN jest ustawiony na Render

1. Przejdź do Render Dashboard
2. Wybierz swój backend service
3. Przejdź do **Environment** tab
4. Sprawdź czy istnieje zmienna `SEED_TOKEN`

### Krok 2: Jeśli SEED_TOKEN nie istnieje - dodaj go

1. W Render Dashboard → Environment
2. Kliknij **Add Environment Variable**
3. **Key:** `SEED_TOKEN`
4. **Value:** Wygeneruj bezpieczny token (np. użyj tego samego co masz lokalnie lub wygeneruj nowy)
5. Kliknij **Save Changes**

### Krok 3: Wywołaj endpoint seedowania

Użyj curl, Postman lub przeglądarki:

```bash
curl -X POST https://restauracja-backend.onrender.com/api/seed \
  -H "Content-Type: application/json" \
  -d '{"seedToken": "TWÓJ_SEED_TOKEN_Z_RENDER"}'
```

Lub w PowerShell:

```powershell
Invoke-RestMethod -Uri "https://restauracja-backend.onrender.com/api/seed" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"seedToken": "TWÓJ_SEED_TOKEN_Z_RENDER"}'
```

### Krok 4: Sprawdź odpowiedź

Powinieneś otrzymać:
```json
{
  "success": true,
  "message": "Baza danych została zaseedowana"
}
```

### Krok 5: Spróbuj się zalogować

- **Email:** `admin@restauracja.pl`
- **Hasło:** `Admin123!`

## ⚠️ WAŻNE: Bezpieczeństwo

**Po seedowaniu usuń zmienną środowiskową SEED_TOKEN z Render!**

1. Render Dashboard → Environment
2. Znajdź `SEED_TOKEN`
3. Kliknij **Delete**
4. Kliknij **Save Changes**

To zapobiegnie przypadkowemu lub złośliwemu seedowaniu bazy danych.

## Alternatywa: Seed lokalnie

Jeśli masz dostęp do lokalnego środowiska:

1. Ustaw `MONGODB_URI` na produkcję w `.env`
2. Uruchom: `npm run seed`
3. Sprawdź czy admin został utworzony w MongoDB Atlas

---

## Sprawdzenie czy admin istnieje

Możesz sprawdzić w MongoDB Atlas czy admin istnieje:
1. Przejdź do MongoDB Atlas
2. Wybierz swoją bazę danych
3. Kolekcja: `admins`
4. Sprawdź czy istnieje dokument z `email: "admin@restauracja.pl"`
