# 🔧 Poprawka MongoDB Connection String

## Problem

Connection string może nie zawierać nazwy bazy danych, co powoduje, że MongoDB łączy się z domyślną bazą `test` zamiast z właściwą bazą danych.

## Poprawny format connection stringu

### Obecny (może być niepoprawny):
```
mongodb+srv://restauracja-admin:D3U2WkSgGPgqyu2@cluster0.zftuuvx.mongodb.net/?appName=Cluster0
```

### Poprawny (z nazwą bazy danych):
```
mongodb+srv://restauracja-admin:D3U2WkSgGPgqyu2@cluster0.zftuuvx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority
```

## Różnice:

1. **Nazwa bazy danych** - musi być po `/` przed `?`
   - ❌ Brak: `...mongodb.net/?appName=Cluster0`
   - ✅ Poprawnie: `...mongodb.net/restauracja-zlota?retryWrites=true&w=majority`

2. **Parametry** - zalecane parametry:
   - `retryWrites=true` - automatyczne ponowienie zapisu w przypadku błędu
   - `w=majority` - zapis potwierdzony przez większość serwerów

3. **appName** - opcjonalny, można usunąć lub zostawić

## Jak zaktualizować na Render:

1. Przejdź do Render Dashboard
2. Wybierz swój backend service
3. Przejdź do **Environment** tab
4. Znajdź `MONGODB_URI`
5. Kliknij **Edit**
6. Zaktualizuj na:
   ```
   mongodb+srv://restauracja-admin:D3U2WkSgGPgqyu2@cluster0.zftuuvx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority
   ```
7. Kliknij **Save Changes**
8. Render automatycznie zrobi redeploy

## Sprawdzenie nazwy bazy danych:

Jeśli nie jesteś pewien nazwy bazy danych:
1. MongoDB Atlas Dashboard
2. Wybierz swój cluster
3. Kliknij **Browse Collections**
4. Zobaczysz nazwę bazy danych w lewym panelu

Typowe nazwy:
- `restauracja-zlota`
- `restauracja`
- `restauracja-zlota-prod`

## Dlaczego to ważne:

Bez nazwy bazy danych w connection stringu:
- MongoDB łączy się z domyślną bazą `test`
- Twoje kolekcje (`admins`, `locations`, etc.) mogą być w złej bazie
- Możesz mieć dane w dwóch różnych bazach (stara i nowa)

Z nazwą bazy danych:
- MongoDB łączy się bezpośrednio z właściwą bazą
- Wszystkie kolekcje są w jednej bazie
- Łatwiejsze zarządzanie i debugowanie
