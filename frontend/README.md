# U kelnerów - Frontend

Frontend aplikacji dla restauracji z dwoma lokalami, zbudowany w Angular 17 z Tailwind CSS.

## Technologie

- Angular 17 (standalone components)
- Tailwind CSS
- TypeScript
- RxJS (signals)

## Funkcjonalności

### Widok klienta
- **Landing page** - animowana strona wejściowa
- **Strona główna** - prezentacja restauracji, lokalizacji
- **Menu** - karta dań z kategoriami
- **O nas** - historia restauracji
- **Kontakt** - formualrz kontaktowy, dane lokali
- **Rezerwacja** - wielokrokowy formularz rezerwacji

### Panel admina
- **Logowanie** - zabezpieczone JWT
- **Dashboard** - statystyki, ostatnie rezerwacje
- **Rezerwacje** - pełne zarządzanie (filtry, edycja, zmiana statusu, usuwanie)

## Instalacja

```bash
cd frontend
npm install
```

## Uruchomienie

```bash
# Development
npm start
# lub
ng serve

# Aplikacja dostępna pod: http://localhost:4200
```

## Budowanie

```bash
npm run build

# Pliki produkcyjne w: dist/frontend/
```

## Struktura projektu

```
frontend/
├── src/
│   ├── app/
│   │   ├── admin/              # Panel administracyjny
│   │   │   ├── components/     # Komponenty admina (sidebar)
│   │   │   └── pages/          # Strony admina (login, dashboard, reservations)
│   │   ├── core/               # Serwisy i guardy
│   │   │   ├── guards/         # Auth guards
│   │   │   └── services/       # API, Auth, Location, Reservation services
│   │   ├── pages/              # Strony klienta
│   │   │   ├── landing/        # Animowana wejściówka
│   │   │   ├── home/           # Strona główna
│   │   │   ├── menu/           # Menu restauracji
│   │   │   ├── about/          # O nas
│   │   │   ├── contact/        # Kontakt
│   │   │   └── reservation/    # Formularz rezerwacji
│   │   └── shared/             # Komponenty współdzielone
│   │       └── components/     # Navbar, Footer
│   ├── environments/           # Konfiguracja środowisk
│   └── styles.scss             # Globalne style + Tailwind
├── tailwind.config.js          # Konfiguracja Tailwind
└── package.json
```

## Paleta kolorów

Aplikacja używa ciepłej palety kolorów:
- **warm** - odcienie beżu (#faf9f7 - #544b3e)
- **brown** - brązy (#faf6f3 - #311d18)
- **stone** - szarości (#fafaf9 - #1c1917)

## Fonty

- **Playfair Display** - nagłówki (display)
- **Lato** - tekst podstawowy (body)
- **Cormorant Garamond** - akcenty (accent)

## API Endpoints

Frontend komunikuje się z backendem przez:
- `environment.apiUrl` = `http://localhost:3000/api`

## SEO

Aplikacja zawiera:
- Meta tagi (description, keywords, Open Graph)
- Schema.org markup dla restauracji
- Semantic HTML
- Lazy loading komponentów
