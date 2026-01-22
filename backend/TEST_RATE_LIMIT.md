# 🧪 Test Rate Limitingu

## Jak przetestować rate limiting

### 1. Uruchom backend
```bash
cd backend
npm run dev
```

### 2. W innym terminalu uruchom testy

#### Test 1: Login Rate Limiter (5 prób / minuta)
```bash
node test-rate-limit-strict.js
```

Ten test:
- Wysyła 7 requestów z nieprawidłowymi danymi logowania
- Oczekuje, że po 5 próbach otrzyma błąd 429
- Sprawdza nagłówki RateLimit-*

#### Test 2: Public Rate Limiter (100 requestów / 15 min)
```bash
node test-rate-limit.js
```

Ten test:
- Wysyła 105 requestów do `/api/locations`
- Oczekuje, że po 100 requestach otrzyma błąd 429

### 3. Test manualny przez curl/Postman

#### Test login limiter:
```bash
# Wysyłaj requesty z błędnymi danymi
for i in {1..7}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@restauracja.pl","password":"ZleHaslo"}' \
    -v
  echo ""
done
```

Po 5 próbach powinieneś otrzymać:
```json
{
  "success": false,
  "message": "Zbyt wiele prób logowania. Spróbuj ponownie za chwilę."
}
```

Status: `429 Too Many Requests`

### 4. Sprawdź nagłówki odpowiedzi

Rate limiting dodaje następujące nagłówki:
- `RateLimit-Limit`: Maksymalna liczba requestów
- `RateLimit-Remaining`: Pozostała liczba requestów
- `RateLimit-Reset`: Timestamp resetu limitu

### 5. Limity w produkcji

W produkcji limity są:
- **Login**: 5 prób / 15 minut
- **Public**: 100 requestów / 15 minut  
- **Admin**: 200 requestów / 15 minut
- **Write**: 50 operacji / 15 minut

Dla testów lokalnych możesz zmniejszyć `windowMs` w `rateLimiter.js` do 1 minuty.
