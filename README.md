# U kelnerów - System Rezerwacji

Kompletna aplikacja dla restauracji z dwoma lokalami, umożliwiająca zarządzanie rezerwacjami stolików, wydarzeń i wynajmu całego lokalu.

## 🍽️ Funkcjonalności

### Dla klientów
- Animowany landing page z eleganckim designem
- Przeglądanie menu restauracji
- System rezerwacji online (stolik, wydarzenie, cały lokal)
- Wybór lokalizacji (Centrum / Mokotów)
- Sprawdzanie dostępności w czasie rzeczywistym
- Strona "O nas" i kontakt

### Dla administratorów
- Zabezpieczony panel administracyjny (JWT)
- Dashboard ze statystykami
- Zarządzanie rezerwacjami:
  - Filtrowanie po lokalu, dacie, statusie, typie
  - Potwierdzanie/anulowanie rezerwacji
  - Edycja daty, godziny, liczby gości
  - Usuwanie rezerwacji
- Obsługa dwóch lokali

## 🛠️ Technologie

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- bcryptjs (hashowanie haseł)
- express-validator

### Frontend
- Angular 17 (standalone components, signals)
- Tailwind CSS
- TypeScript
- Lazy loading

## 📁 Struktura projektu

```
Restauracja/
├── backend/                 # API REST
│   ├── src/
│   │   ├── config/         # Konfiguracja bazy danych
│   │   ├── controllers/    # Logika biznesowa
│   │   ├── middleware/     # Auth, walidacja
│   │   ├── models/         # Modele Mongoose
│   │   ├── routes/         # Endpointy API
│   │   ├── seed.js         # Dane startowe
│   │   └── server.js       # Entry point
│   └── package.json
│
└── frontend/               # Aplikacja Angular
    ├── src/
    │   ├── app/
    │   │   ├── admin/      # Panel admina
    │   │   ├── core/       # Serwisy, guardy
    │   │   ├── pages/      # Strony klienta
    │   │   └── shared/     # Navbar, Footer
    │   └── styles.scss     # Tailwind + style
    └── package.json
```

## 🚀 Instalacja i uruchomienie

### 1. MongoDB
Upewnij się, że MongoDB jest zainstalowane i uruchomione:
```bash
mongod
```

### 2. Backend
```bash
cd backend
npm install

# Utwórz plik .env (skopiuj z .env.example)
# Edytuj zmienne środowiskowe

# Seeduj bazę danych (utworzy lokale, stoliki, konta)
npm run seed

# Uruchom serwer
npm run dev
```

Backend dostępny pod: `http://localhost:3000`

### 3. Frontend
```bash
cd frontend
npm install

# Uruchom aplikację
npm start
```

Frontend dostępny pod: `http://localhost:4200`

## 🔐 Domyślne konta (po seedowaniu)

| Rola | Email | Hasło |
|------|-------|-------|
| Admin | admin@restauracja.pl | Admin123! |
| Manager | manager@restauracja.pl | Manager123! |

## 🎨 Design

Paleta kolorów oparta na ciepłych tonach:
- **Szarość** (stone) - tła, teksty
- **Beż** (warm) - akcenty, tła sekcji
- **Brąz** (brown) - elementy interaktywne, akcenty

Fonty:
- **Playfair Display** - nagłówki eleganckie
- **Lato** - tekst podstawowy
- **Cormorant Garamond** - akcenty dekoracyjne

## 📱 SEO

Aplikacja zawiera:
- Kompletne meta tagi
- Open Graph dla social media
- Schema.org markup (Restaurant)
- Semantyczny HTML
- Lazy loading komponentów

## 📝 API Endpoints

### Publiczne
- `POST /api/reservations` - utworzenie rezerwacji
- `GET /api/reservations/availability/:locationId` - dostępność
- `GET /api/locations` - lista lokali

### Chronione (JWT)
- `POST /api/auth/login` - logowanie
- `GET /api/reservations` - lista rezerwacji (admin)
- `PUT /api/reservations/:id` - edycja rezerwacji
- `PATCH /api/reservations/:id/status` - zmiana statusu
- `DELETE /api/reservations/:id` - usunięcie rezerwacji

## 📄 Licencja

ISC
