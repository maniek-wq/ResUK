# System Aktualizacji PWA

## Jak to działa?

Aplikacja automatycznie wykrywa dostępne aktualizacje i pokazuje banner na dole ekranu z przyciskiem "Aktualizuj teraz".

### Funkcjonalności:
- ✅ Automatyczne sprawdzanie aktualizacji co 30 minut
- ✅ Banner na dole ekranu gdy dostępna jest nowa wersja
- ✅ Przycisk "Aktualizuj teraz" do natychmiastowej instalacji
- ✅ Przycisk "Później" do odłożenia aktualizacji
- ✅ Automatyczne przeładowanie strony po instalacji nowej wersji

---

## Jak wdrożyć nową wersję?

### Krok 1: Zwiększ wersję w Service Workerze

**WAŻNE:** Przed każdym deploymentem zmień wersję w pliku:

```
frontend/src/sw.js
```

Zmień linię 3:
```javascript
const CACHE_VERSION = '1.0.0';  // ← ZWIĘKSZ TĘ WERSJĘ!
```

Na przykład:
- `1.0.0` → `1.0.1` (drobna poprawka)
- `1.0.0` → `1.1.0` (nowa funkcjonalność)
- `1.0.0` → `2.0.0` (duża zmiana)

### Krok 2: Commituj i pushuj zmiany

```bash
git add .
git commit -m "chore: bump version to 1.0.1"
git push
```

### Krok 3: Deploy

Po deploymencie (Vercel automatycznie zbuduje):
- Użytkownicy z otwartą aplikacją zobaczą banner o aktualizacji **w ciągu 30 minut** (lub natychmiast przy następnym odświeżeniu)
- Po kliknięciu "Aktualizuj teraz" aplikacja zainstaluje nową wersję i przeładuje stronę

---

## Testowanie lokalnie

### 1. Zmień wersję w `sw.js`:
```javascript
const CACHE_VERSION = '1.0.1';
```

### 2. Zbuduj projekt:
```bash
cd frontend
npm run build
```

### 3. Uruchom serwer HTTP (np. `http-server`):
```bash
npx http-server dist/restauracja -p 4200
```

### 4. Otwórz w przeglądarce:
- Otwórz `http://localhost:4200`
- Zainstaluj PWA (Add to Home Screen)

### 5. Zmień wersję ponownie:
```javascript
const CACHE_VERSION = '1.0.2';
```

### 6. Zbuduj ponownie i odśwież przeglądarkę:
- Banner powinien się pojawić po ~30 sekundach
- Kliknij "Aktualizuj teraz"

---

## Komponenty systemu

### 1. **Service Worker** (`frontend/src/sw.js`)
- Zarządza cachowaniem i wersjami
- Powiadamia aplikację o nowej wersji

### 2. **PWA Update Service** (`frontend/src/app/core/services/pwa-update.service.ts`)
- Wykrywa dostępne aktualizacje
- Zarządza stanem aktualizacji
- Wymusza instalację nowej wersji

### 3. **Update Banner Component** (`frontend/src/app/shared/components/update-banner/update-banner.component.ts`)
- UI komponent pokazujący banner
- Przyciski "Aktualizuj teraz" i "Później"

---

## Wersjonowanie semantyczne (Semantic Versioning)

Używaj formatu: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0 → 2.0.0): Duże zmiany, breaking changes
- **MINOR** (1.0.0 → 1.1.0): Nowe funkcjonalności (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Poprawki błędów

### Przykłady:

```
1.0.0 → 1.0.1  // Poprawka błędu w formularzu
1.0.1 → 1.1.0  // Dodano nową zakładkę w panelu admina
1.1.0 → 2.0.0  // Przeprojektowano całą nawigację
```

---

## Checklist przed deploymentem

- [ ] Zwiększ `CACHE_VERSION` w `frontend/src/sw.js`
- [ ] Przetestuj lokalnie (build → http-server)
- [ ] Commituj z odpowiednią wiadomością (np. "chore: bump version to 1.0.1")
- [ ] Pushuj na GitHub
- [ ] Vercel automatycznie zdeployuje
- [ ] Zweryfikuj działanie w przeglądarce

---

## Troubleshooting

### Banner się nie pojawia?

1. Sprawdź czy Service Worker jest zarejestrowany:
   - Otwórz DevTools → Application → Service Workers
   - Powinien być widoczny aktywny SW

2. Wymuś sprawdzenie aktualizacji:
   - DevTools → Application → Service Workers → "Update"

3. Sprawdź konsolę:
   - Powinny być logi: `[PWA Update] Checking for updates...`

### Aktualizacja się nie instaluje?

1. Sprawdź czy wersja `CACHE_VERSION` rzeczywiście się zmieniła
2. Wyczyść cache przeglądarki: DevTools → Application → Clear storage
3. Sprawdź czy Service Worker obsługuje event `message` z typem `SKIP_WAITING`

---

## Monitoring

W konsoli przeglądarki zobaczysz logi:

```
[PWA Update] Checking for updates...
[Service Worker] Installing version 1.0.1...
[PWA Update] New version ready to install
[PWA Update] Applying update...
[PWA Update] Controller changed, reloading page...
```

---

## Dla użytkowników

Gdy pojawi się banner:
- **"Aktualizuj teraz"** → Natychmiastowa instalacja nowej wersji (strona się przeładuje)
- **"Później"** → Banner zniknie, pojawi się ponownie przy następnej wizycie
