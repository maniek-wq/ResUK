# Plan Implementacji Systemu Powiadomień

## ✅ Backend - Zakończone

### 1. Model Notification (`backend/src/models/Notification.js`)
- ✅ Typ powiadomienia (reservation_new, reservation_confirmed, reservation_cancelled, reservation_updated, system)
- ✅ Tytuł i treść powiadomienia
- ✅ Powiązanie z rezerwacją i lokalem
- ✅ Recipient (null = dla wszystkich adminów, lub konkretny admin)
- ✅ Status odczytania (isRead, readAt, readBy)
- ✅ Metadata dla dodatkowych danych
- ✅ Indeksy dla optymalizacji zapytań

### 2. Kontroler Powiadomień (`backend/src/controllers/notificationController.js`)
- ✅ `getNotifications` - Pobierz wszystkie powiadomienia (z filtrowaniem)
- ✅ `getUnreadCount` - Pobierz liczbę nieprzeczytanych powiadomień
- ✅ `markAsRead` - Oznacz pojedyncze powiadomienie jako przeczytane
- ✅ `markAllAsRead` - Oznacz wszystkie powiadomienia jako przeczytane
- ✅ `deleteNotification` - Usuń powiadomienie
- ✅ `createNotification` - Helper function do tworzenia powiadomień (używane wewnętrznie)

### 3. Routes (`backend/src/routes/notifications.js`)
- ✅ `GET /api/notifications` - Lista powiadomień
- ✅ `GET /api/notifications/unread/count` - Liczba nieprzeczytanych
- ✅ `PATCH /api/notifications/:id/read` - Oznacz jako przeczytane
- ✅ `PATCH /api/notifications/read-all` - Oznacz wszystkie jako przeczytane
- ✅ `DELETE /api/notifications/:id` - Usuń powiadomienie
- ✅ Wszystkie endpointy wymagają autoryzacji (middleware `protect`)

### 4. Integracja z Rezerwacjami
- ✅ Automatyczne tworzenie powiadomienia przy nowej rezerwacji (`reservationController.createReservation`)
- ✅ Powiadomienie zawiera: imię i nazwisko klienta, datę, godzinę, lokal, liczbę gości

## 📋 Frontend - Do Zaimplementowania

### 5. NotificationService (`frontend/src/app/core/services/notification.service.ts`)
**Do utworzenia:**
```typescript
- getNotifications(isRead?: boolean, limit?: number, skip?: number): Observable<Notification[]>
- getUnreadCount(): Observable<number>
- markAsRead(notificationId: string): Observable<void>
- markAllAsRead(): Observable<void>
- deleteNotification(notificationId: string): Observable<void>
```

**Interfejsy:**
```typescript
interface Notification {
  _id: string;
  type: 'reservation_new' | 'reservation_confirmed' | 'reservation_cancelled' | 'reservation_updated' | 'system';
  title: string;
  message: string;
  reservation?: Reservation;
  location?: Location;
  recipient?: string;
  isRead: boolean;
  readAt?: Date;
  readBy?: Admin;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6. Komponent Dzwoneczka (`frontend/src/app/admin/components/notification-bell/notification-bell.component.ts`)
**Funkcjonalności:**
- ✅ Wyświetlanie ikony dzwoneczka
- ✅ Licznik nieprzeczytanych powiadomień (badge)
- ✅ Dropdown z listą ostatnich powiadomień (np. 5 najnowszych)
- ✅ Auto-refresh co X sekund (np. 30s) lub polling
- ✅ Kliknięcie w powiadomienie -> przekierowanie do szczegółów rezerwacji
- ✅ Oznaczanie jako przeczytane przy kliknięciu
- ✅ Link "Zobacz wszystkie" do strony powiadomień

**Lokalizacja:** W navbarze/sidebarze admina

### 7. Strona Powiadomień (`frontend/src/app/admin/pages/notifications/notifications.component.ts`)
**Funkcjonalności:**
- ✅ Lista wszystkich powiadomień (paginated lub infinite scroll)
- ✅ Filtrowanie: wszystkie / nieprzeczytane / przeczytane
- ✅ Sortowanie: najnowsze / najstarsze
- ✅ Oznaczanie pojedynczych jako przeczytane
- ✅ Przycisk "Oznacz wszystkie jako przeczytane"
- ✅ Szczegóły powiadomienia (modal lub expand)
- ✅ Link do powiązanej rezerwacji (jeśli dotyczy)
- ✅ Usuwanie powiadomień (opcjonalnie)
- ✅ Auto-refresh lub manual refresh

**Route:** `/admin/powiadomienia`

### 8. Integracja z Navbar/Sidebar Admina
- ✅ Dodaj dzwoneczek do navbaru/sidebaru
- ✅ Dodaj link do strony powiadomień w menu
- ✅ Zapewnij dostępność tylko dla zalogowanych adminów

## 🔄 Przepływ Danych

1. **Klient składa rezerwację** → `POST /api/reservations`
2. **Backend tworzy rezerwację** → `Reservation.create()`
3. **Backend tworzy powiadomienie** → `createNotification()` (automatycznie)
4. **Frontend (dzwoneczek) pobiera liczbę nieprzeczytanych** → `GET /api/notifications/unread/count` (co 30s)
5. **Admin klika dzwoneczek** → Wyświetla dropdown z powiadomieniami
6. **Admin klika powiadomienie** → Oznacza jako przeczytane + przekierowuje do rezerwacji
7. **Admin otwiera stronę powiadomień** → Wyświetla pełną listę

## 📝 Uwagi Techniczne

### Backend:
- Powiadomienia są tworzone dla wszystkich adminów (recipient: null) lub dla konkretnego admina
- Managerzy widzą tylko powiadomienia dla swoich lokali (filtrowanie w query)
- Powiadomienia nie są automatycznie usuwane (można dodać cleanup job w przyszłości)

### Frontend:
- Użyć Angular Signals dla reaktywności (licznik nieprzeczytanych)
- Rozważyć WebSocket w przyszłości dla real-time powiadomień (opcjonalnie)
- Cache'owanie powiadomień w service dla lepszej wydajności
- Loading states i error handling

## 🚀 Następne Kroki

1. Utworzyć `NotificationService` w frontendzie
2. Utworzyć komponent dzwoneczka
3. Utworzyć stronę powiadomień
4. Zintegrować z navbar/sidebar admina
5. Dodać routing dla strony powiadomień
6. Przetestować przepływ: rezerwacja → powiadomienie → odczyt

## 📚 Przykładowe Zapytania API

```bash
# Pobierz wszystkie powiadomienia
GET /api/notifications

# Pobierz nieprzeczytane
GET /api/notifications?isRead=false

# Pobierz liczbę nieprzeczytanych
GET /api/notifications/unread/count

# Oznacz jako przeczytane
PATCH /api/notifications/:id/read

# Oznacz wszystkie jako przeczytane
PATCH /api/notifications/read-all
```
