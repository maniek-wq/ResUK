# 🌱 Seedowanie przez API (dla Render Free Plan)

Ponieważ Render Free Plan nie ma dostępu do Shell, możesz zaseedować bazę danych przez API endpoint.

## Krok 1: Ustaw zmienną środowiskową SEED_TOKEN na Render

1. Przejdź do Render Dashboard → Twoja usługa backend
2. Settings → Environment Variables
3. Dodaj nową zmienną:
   - **Key:** `SEED_TOKEN`
   - **Value:** `twoj-wygenerowany-token` (zobacz poniżej)
4. Save

## Krok 2: Wygeneruj token (lokalnie)

**Wygenerowany token:**
```
14285a6a06a437c2de35afb2272a14a03339aed193fdb090d39fb046ce1a2bb2
```

Użyj tego tokenu w kroku 1 i 4.

## Krok 3: Zrób redeploy backendu na Render

Po dodaniu zmiennej środowiskowej, Render automatycznie zrobi redeploy.

## Krok 4: Wywołaj endpoint seedowania

Po redeploy, wywołaj endpoint:

**Metoda:** POST  
**URL:** `https://restauracja-backend.onrender.com/api/seed`  
**Body (JSON):**
```json
{
  "seedToken": "twoj-wygenerowany-token"
}
```

### Przykład przez curl:
```bash
curl -X POST https://restauracja-backend.onrender.com/api/seed \
  -H "Content-Type: application/json" \
  -d '{"seedToken":"twoj-wygenerowany-token"}'
```

### Przykład przez Postman/Insomnia:
1. POST request do `https://restauracja-backend.onrender.com/api/seed`
2. Headers: `Content-Type: application/json`
3. Body (raw JSON):
   ```json
   {
     "seedToken": "twoj-wygenerowany-token"
   }
   ```

## Krok 5: Weryfikacja

Po seedowaniu powinieneś otrzymać odpowiedź:
```json
{
  "success": true,
  "message": "Baza danych została zaseedowana",
  "data": {
    "locations": 2,
    "tables": 27,
    "admins": 2,
    "categories": 5,
    "items": 22
  }
}
```

## Następnie spróbuj zalogować się:

- Email: `admin@restauracja.pl`
- Hasło: `Admin123!`

---

## ⚠️ BEZPIECZEŃSTWO

Po seedowaniu **usuń zmienną środowiskową SEED_TOKEN** z Render, żeby nikt nie mógł zaseedować bazy danych ponownie!

Lub zmień token na bardzo długi i bezpieczny.
