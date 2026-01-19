# Restauracja - Backend API

Backend API dla systemu rezerwacji restauracji z dwoma lokalami.

## Technologie

- Node.js + Express.js
- MongoDB + Mongoose
- JWT (JSON Web Tokens) do autoryzacji
- bcryptjs do hashowania haseł

## Instalacja

```bash
cd backend
npm install
```

## Konfiguracja

Utwórz plik `.env` w folderze backend:

```env
MONGODB_URI=mongodb://localhost:27017/restauracja
JWT_SECRET=twoj_super_tajny_klucz_jwt
PORT=3000
FRONTEND_URL=http://localhost:4200
ADMIN_EMAIL=admin@restauracja.pl
ADMIN_PASSWORD=Admin123!
```

## Uruchomienie

```bash
# Development (z hot reload)
npm run dev

# Production
npm start

# Seedowanie bazy danych (utworzenie lokali, stolików, kont)
npm run seed
```

## API Endpoints

### Autoryzacja
- `POST /api/auth/login` - Logowanie
- `GET /api/auth/me` - Pobierz dane zalogowanego użytkownika
- `PUT /api/auth/password` - Zmiana hasła
- `POST /api/auth/logout` - Wylogowanie

### Lokale
- `GET /api/locations` - Lista lokali (publiczne)
- `GET /api/locations/:id` - Szczegóły lokalu (publiczne)
- `GET /api/locations/:id/tables` - Stoliki lokalu (publiczne)
- `POST /api/locations` - Dodaj lokal (admin)
- `PUT /api/locations/:id` - Edytuj lokal (admin)
- `DELETE /api/locations/:id` - Usuń lokal (admin)

### Rezerwacje
- `POST /api/reservations` - Utwórz rezerwację (publiczne)
- `GET /api/reservations/availability/:locationId` - Sprawdź dostępność (publiczne)
- `GET /api/reservations` - Lista rezerwacji (admin)
- `GET /api/reservations/:id` - Szczegóły rezerwacji (admin)
- `PUT /api/reservations/:id` - Edytuj rezerwację (admin)
- `DELETE /api/reservations/:id` - Usuń rezerwację (admin)
- `PATCH /api/reservations/:id/status` - Zmień status (admin)

### Stoliki
- `GET /api/tables` - Lista stolików (admin)
- `POST /api/tables` - Dodaj stolik (admin/manager)
- `PUT /api/tables/:id` - Edytuj stolik (admin/manager)
- `DELETE /api/tables/:id` - Usuń stolik (admin/manager)

## Domyślne konta (po seedowaniu)

| Rola | Email | Hasło |
|------|-------|-------|
| Admin | admin@restauracja.pl | Admin123! |
| Manager | manager@restauracja.pl | Manager123! |

## Struktura folderów

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # Połączenie z MongoDB
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── locationController.js
│   │   ├── reservationController.js
│   │   └── tableController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT middleware
│   │   └── validators.js    # Walidacja danych
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Location.js
│   │   ├── Reservation.js
│   │   └── Table.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── locations.js
│   │   ├── reservations.js
│   │   └── tables.js
│   ├── seed.js              # Skrypt seedowania
│   └── server.js            # Entry point
└── package.json
```
