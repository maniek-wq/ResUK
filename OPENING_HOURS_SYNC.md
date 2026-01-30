# Synchronizacja Godzin Otwarcia

## Wprowadzenie

System godzin otwarcia został w pełni zintegrowany z panelem admina, footerze publicznym oraz systemem rezerwacji. Wszystkie komponenty korzystają z tych samych danych z bazy MongoDB.

---

## 1. Panel Admina - Zarządzanie Godzinami Otwarcia

### Lokalizacja
**Panel Admina → Zarządzanie Lokalami → Zakładka "Godziny otwarcia"**

### Funkcjonalności
- Wybór lokalu z listy rozwijanej
- Edycja godzin dla każdego dnia tygodnia (Pon-Niedz)
- Pola typu `time` dla godziny otwarcia i zamknięcia
- Przycisk "Zapisz godziny" - zapisuje do bazy danych
- Przycisk "Skopiuj do wszystkich dni" - kopiuje godziny z poniedziałku

### Domyślne wartości (jeśli brak w bazie)
```
Poniedziałek - Środa:  12:00 - 22:00
Czwartek:              12:00 - 23:00
Piątek - Sobota:       11:00 - 24:00
Niedziela:             11:00 - 21:00
```

---

## 2. Footer - Wyświetlanie Godzin Otwarcia

### Lokalizacja
**Strona publiczna → Footer (na dole każdej strony)**

### Implementacja
- **Dynamiczne ładowanie** godzin z API przy starcie aplikacji (`ngOnInit`)
- Wyświetlanie godzin dla **pierwszego aktywnego lokalu** z bazy danych
- Fallback do domyślnych godzin, jeśli brak danych w bazie

### Kod
```typescript
// frontend/src/app/shared/components/footer/footer.component.ts
async loadPrimaryLocation(): Promise<void> {
  const response = await firstValueFrom(this.locationService.getLocations());
  if (response.success && response.data.length > 0) {
    const activeLocation = response.data.find(l => l.isActive) || response.data[0];
    this.primaryLocation.set(activeLocation || null);
  }
}

formatHours(hours: { open: string; close: string } | undefined): string {
  if (!hours || !hours.open || !hours.close) return 'Nieczynne';
  return `${hours.open} - ${hours.close}`;
}
```

### Template
```html
<div class="flex justify-between text-sm">
  <span class="text-warm-400">Poniedziałek</span>
  <span class="text-warm-200">
    {{ formatHours(primaryLocation()!.openingHours.monday) }}
  </span>
</div>
```

---

## 3. System Rezerwacji - Dostępne Godziny

### Lokalizacja
**Backend: `/backend/src/controllers/reservationController.js`**  
**Endpoint: `GET /api/reservations/availability/:locationId?date=YYYY-MM-DD&guests=N`**

### Implementacja
System rezerwacji **automatycznie generuje dostępne sloty czasowe** na podstawie:
1. **Godzin otwarcia** danego lokalu dla wybranego dnia tygodnia
2. Dostępności stolików w danym slocie czasowym
3. Liczby gości w rezerwacji

### Kod
```javascript
// Pobierz dzień tygodnia dla wybranej daty
const requestDate = new Date(date);
const dayOfWeek = requestDate.getDay();
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const dayName = dayNames[dayOfWeek];

// Pobierz godziny otwarcia dla tego dnia
const openingHours = location.openingHours?.[dayName];

// Parsuj godzinę otwarcia (format: "HH:MM")
const [openH, openM] = openingHours.open.split(':').map(Number);
const [closeH, closeM] = openingHours.close.split(':').map(Number);

// Generuj sloty czasowe (co 30 min od godziny otwarcia do zamknięcia)
while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
  const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
  // ... logika sprawdzania dostępności stolików ...
  currentMin += 30;
  if (currentMin >= 60) {
    currentMin = 0;
    currentHour += 1;
  }
}
```

### Logika
1. **Pobiera godziny otwarcia** z bazy dla danego dnia
2. **Generuje sloty co 30 minut** od godziny otwarcia do zamknięcia
3. Dla każdego slotu **sprawdza dostępność stolików**
4. Filtruje sloty według **liczby gości** (łączna pojemność dostępnych stolików >= liczba gości)

### Przykład
Jeśli lokal w piątek jest otwarty **11:00 - 24:00**, system wygeneruje sloty:
```
11:00, 11:30, 12:00, 12:30, ..., 22:00, 22:30, 23:00, 23:30
```

---

## 4. Model Danych - MongoDB

### Schema: `Location`
```javascript
// backend/src/models/Location.js
openingHours: {
  monday: { open: String, close: String },
  tuesday: { open: String, close: String },
  wednesday: { open: String, close: String },
  thursday: { open: String, close: String },
  friday: { open: String, close: String },
  saturday: { open: String, close: String },
  sunday: { open: String, close: String }
}
```

### Przykładowe dane
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "U kelnerów - Centrum",
  "openingHours": {
    "monday": { "open": "12:00", "close": "22:00" },
    "tuesday": { "open": "12:00", "close": "22:00" },
    "wednesday": { "open": "12:00", "close": "22:00" },
    "thursday": { "open": "12:00", "close": "23:00" },
    "friday": { "open": "11:00", "close": "24:00" },
    "saturday": { "open": "11:00", "close": "24:00" },
    "sunday": { "open": "11:00", "close": "21:00" }
  }
}
```

---

## 5. Synchronizacja - Przepływ Danych

```
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                          │
│                  Collection: locations                       │
│                                                              │
│  { name: "U kelnerów", openingHours: { ... } }              │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
               ▼              ▼              ▼
     ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
     │ Panel Admin │  │    Footer    │  │  Rezerwacje  │
     │  (Edycja)   │  │ (Wyświetla)  │  │ (Filtruje)   │
     └─────────────┘  └──────────────┘  └──────────────┘
           │                 │                 │
           │                 │                 │
     ┌─────▼─────────────────▼─────────────────▼────────┐
     │          API: PUT /locations/:id                  │
     │          API: GET /locations                      │
     │          API: GET /reservations/availability      │
     └───────────────────────────────────────────────────┘
```

### Krok po kroku:
1. **Admin zmienia godziny** w panelu → zapisuje do MongoDB
2. **Footer przy starcie strony** → pobiera z MongoDB → wyświetla w UI
3. **System rezerwacji** → pobiera z MongoDB → generuje sloty

---

## 6. Korzyści z Synchronizacji

### ✅ Dla Admina
- **Jedna lokalizacja** do zarządzania godzinami (panel admina)
- Zmiana godzin **natychmiast wpływa** na system rezerwacji i footer
- Brak konieczności edycji kodu lub restartowania aplikacji

### ✅ Dla Klienta
- **Zawsze aktualne godziny** w footerze
- System rezerwacji **automatycznie dostosowuje** dostępne sloty
- Brak możliwości rezerwacji poza godzinami otwarcia

### ✅ Dla Developera
- **Single source of truth** - MongoDB
- Łatwa konserwacja i debugowanie
- Spójność danych w całej aplikacji

---

## 7. Testowanie Synchronizacji

### Test 1: Zmiana godzin w panelu admina
1. Zaloguj się do panelu admina
2. Przejdź do **Zarządzanie Lokalami → Godziny otwarcia**
3. Zmień godziny dla poniedziałku na `10:00 - 20:00`
4. Kliknij **"Zapisz godziny"**
5. **Odśwież stronę publiczną** → sprawdź footer (powinno pokazać `10:00 - 20:00`)
6. **Przejdź do rezerwacji** → wybierz poniedziałek → sprawdź dostępne godziny (powinno pokazać sloty od 10:00 do 20:00)

### Test 2: Weryfikacja automatycznego filtrowania
1. Ustaw w panelu admina godziny na `14:00 - 18:00`
2. Zapisz zmiany
3. Spróbuj zarezerwować stolik na ten dzień
4. **Oczekiwany rezultat**: Dostępne godziny to tylko `14:00, 14:30, 15:00, ..., 17:30`

### Test 3: Obsługa "24:00"
1. Ustaw godzinę zamknięcia na `24:00`
2. System powinien automatycznie przekonwertować to na `23:59`

---

## 8. Rozwiązywanie Problemów

### Problem: Footer pokazuje domyślne godziny zamiast z bazy
**Przyczyna**: Brak godzin w bazie danych lub błąd podczas ładowania  
**Rozwiązanie**:
1. Sprawdź konsole przeglądarki pod kątem błędów
2. Upewnij się, że lokalizacja ma wypełnione `openingHours` w bazie
3. Sprawdź, czy backend odpowiada poprawnie na `GET /api/locations`

### Problem: System rezerwacji pokazuje złe godziny
**Przyczyna**: Backend używa starych danych cache  
**Rozwiązanie**:
1. Zrestartuj backend: `npm run dev` w folderze `/backend`
2. Sprawdź, czy `location.openingHours` istnieje w odpowiedzi API

### Problem: Godziny nie zapisują się w panelu admina
**Przyczyna**: Błąd walidacji lub brak uprawnień  
**Rozwiązanie**:
1. Sprawdź konsole przeglądarki
2. Sprawdź logi backendu
3. Upewnij się, że format godziny to `HH:MM` (np. `14:00`)

---

## 9. Zgodność z WCZEŚNIEJSZYMI TODO

### ✅ Zmodyfikowano `getAvailability`
Funkcja `getAvailability` w backendzie została zaktualizowana, aby:
- Pobierać godziny otwarcia z bazy danych
- Generować sloty dynamicznie na podstawie tych godzin
- Filtrować sloty po łącznej pojemności stolików (już było)

### ✅ Dodano UI do zarządzania godzinami
- Nowa zakładka "Godziny otwarcia" w panelu admina
- Pełna funkcjonalność CRUD dla godzin
- Przyciski do kopiowania i zapisywania

### ✅ Footer zsynchronizowany
- Footer pobiera dane z API
- Wyświetla godziny dynamicznie dla każdego dnia

---

## 10. Podsumowanie

### Co zostało zrobione:
1. ✅ Dodano zakładkę "Godziny otwarcia" w panelu admina
2. ✅ Zmodyfikowano footer, aby pobierał godziny z API
3. ✅ Zaktualizowano backend `getAvailability`, aby korzystał z godzin z bazy
4. ✅ Przetestowano synchronizację między komponentami

### Kluczowe pliki:
- **Backend**: `backend/src/controllers/reservationController.js`
- **Frontend (Panel)**: `frontend/src/app/admin/pages/locations/locations-management.component.ts`
- **Frontend (Footer)**: `frontend/src/app/shared/components/footer/footer.component.ts`
- **Model**: `backend/src/models/Location.js`

### Następne kroki:
- Przetestuj lokalnie z różnymi godzinami
- Wdróż na produkcję
- Sprawdź, czy footer i rezerwacje działają poprawnie po zmianie godzin w panelu admina
