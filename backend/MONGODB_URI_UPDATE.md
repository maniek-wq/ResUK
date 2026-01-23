# 🔧 Aktualizacja MONGODB_URI na Render

## Problem

Connection string może nie zawierać nazwy bazy danych, co powoduje, że MongoDB łączy się z domyślną bazą `test` zamiast z właściwą bazą danych.

## Obecny connection string (bez nazwy bazy):
```
mongodb+srv://restauracja-admin:D3U2WkSgGPgqyu2@cluster0.zftuuvx.mongodb.net/?appName=Cluster0
```

## Poprawny connection string (z nazwą bazy danych):

### Opcja 1: Z nazwą bazy `restauracja-zlota`
```
mongodb+srv://restauracja-admin:D3U2WkSgGPgqyu2@cluster0.zftuuvx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority
```

### Opcja 2: Z nazwą bazy `restauracja`
```
mongodb+srv://restauracja-admin:D3U2WkSgGPgqyu2@cluster0.zftuuvx.mongodb.net/restauracja?retryWrites=true&w=majority
```

## Jak zaktualizować na Render:

1. **Przejdź do Render Dashboard**
   - https://dashboard.render.com

2. **Wybierz swój backend service**
   - Kliknij na "restauracja-backend" (lub jak nazywa się Twój service)

3. **Przejdź do Environment Variables**
   - W lewym menu kliknij **Environment**

4. **Znajdź `MONGODB_URI`**
   - Przewiń listę zmiennych środowiskowych

5. **Kliknij Edit (ikona ołówka)**
   - Obok zmiennej `MONGODB_URI`

6. **Zaktualizuj wartość:**
   ```
   mongodb+srv://restauracja-admin:D3U2WkSgGPgqyu2@cluster0.zftuuvx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority
   ```
   
   **WAŻNE:** Zamień `restauracja-zlota` na nazwę Twojej bazy danych, jeśli jest inna!

7. **Kliknij Save Changes**

8. **Render automatycznie zrobi redeploy** (2-3 minuty)

## Jak sprawdzić nazwę bazy danych:

### Metoda 1: MongoDB Atlas Dashboard
1. Przejdź do https://cloud.mongodb.com
2. Wybierz swój cluster
3. Kliknij **Browse Collections**
4. W lewym panelu zobaczysz nazwę bazy danych

### Metoda 2: Sprawdź w logach Render
Po redeploy, w logach zobaczysz:
```
✅ MongoDB połączono: cluster0.zftuuvx.mongodb.net
📦 Baza danych: [NAZWA_BAZY]
```

## Różnice w connection stringu:

### Przed (bez nazwy bazy):
```
mongodb+srv://...@cluster0.zftuuvx.mongodb.net/?appName=Cluster0
                                                      ^
                                                      Brak nazwy bazy!
```

### Po (z nazwą bazy):
```
mongodb+srv://...@cluster0.zftuuvx.mongodb.net/restauracja-zlota?retryWrites=true&w=majority
                                                      ^^^^^^^^^^^^^^^^^^^^
                                                      Nazwa bazy danych
```

## Parametry connection stringu:

- `retryWrites=true` - automatyczne ponowienie zapisu w przypadku błędu
- `w=majority` - zapis potwierdzony przez większość serwerów (bezpieczeństwo)
- `appName=Cluster0` - opcjonalny, można usunąć

## Dlaczego to ważne:

**Bez nazwy bazy danych:**
- MongoDB łączy się z domyślną bazą `test`
- Twoje kolekcje (`admins`, `locations`, etc.) mogą być w złej bazie
- Możesz mieć dane w dwóch różnych bazach (stara i nowa)
- Admin może być w bazie `test`, a aplikacja szuka w innej bazie

**Z nazwą bazy danych:**
- MongoDB łączy się bezpośrednio z właściwą bazą
- Wszystkie kolekcje są w jednej bazie
- Łatwiejsze zarządzanie i debugowanie
- Admin będzie w tej samej bazie, w której aplikacja szuka

## Po aktualizacji:

1. Sprawdź logi Render - powinny pokazać:
   ```
   ✅ MongoDB połączono: cluster0.zftuuvx.mongodb.net
   📦 Baza danych: restauracja-zlota
   ```

2. Spróbuj zalogować się ponownie

3. Jeśli nadal nie działa, sprawdź logi - teraz będą pokazywać szczegółowe informacje o wyszukiwaniu admina
