---
title: "Oferta - System Rezerwacji Online U Kelnerów"
subtitle: "Funkcjonalności i modele płatności"
author: "Twoje Dane / Nazwa Firmy"
date: "2026-01-24"
geometry: "margin=2.5cm"
fontsize: 12pt
lang: pl-PL
documentclass: article
---

# Oferta

## System Rezerwacji Online - U Kelnerów

---

## 1. Zakres Funkcjonalności

### 1.1. Strona Publiczna

#### Funkcjonalności podstawowe:
- Responsywna strona internetowa (desktop, tablet, mobile)
- Progressive Web App (PWA) - instalacja na telefonie
- Menu restauracji z cenami i zdjęciami
- Informacje o lokalizacji z integracją Google Maps
- Strona "O nas" z historią i zespołem
- Strona kontaktowa
- System cookies i polityka prywatności (RODO)

#### System rezerwacji online:
- Wybór daty i godziny
- Wybór liczby gości
- Automatyczne filtrowanie dostępnych godzin w czasie rzeczywistym
- Inteligentne przypisywanie stolików (łączenie stolików dla większych grup)
- Walidacja dostępności w czasie rzeczywistym
- Potwierdzenie rezerwacji przez email (Resend)
- Automatyczne zarządzanie dostępnością

### 1.2. Panel Administracyjny

#### Zarządzanie rezerwacjami:
- Widok wszystkich rezerwacji (kalendarz, lista)
- Filtrowanie po statusie, dacie, lokalizacji
- Edycja i anulowanie rezerwacji
- System potwierdzeń email
- Historia zmian statusu z audytem (kto, kiedy, co zmienił)
- Export danych do CSV/PDF

#### Zarządzanie lokalami:
- Dodawanie/edycja lokalizacji
- Konfiguracja godzin otwarcia
- Zarządzanie parametrami (minimalny czas rezerwacji, maksymalna liczba gości)
- Zestawienie statystyk i porównanie lokali

#### Zarządzanie stolikami:
- Dodawanie/edycja stolików
- Przypisanie do lokalizacji
- Konfiguracja pojemności
- Widok dostępności w czasie rzeczywistym

#### Zarządzanie menu:
- Kategorie dań
- Dodawanie/edycja pozycji menu
- Zdjęcia, opisy, ceny
- Statusy dostępności (dostępne/niedostępne)
- Alergeny i informacje dietetyczne

#### System powiadomień:
- Powiadomienia push (Web Push API)
- Powiadomienia w aplikacji
- Email notifications (Resend)
- Automatyczne powiadomienia o nowych rezerwacjach
- Powiadomienia o zmianach statusu

#### System administratorów:
- Wielokontowe zarządzanie (wiele kont admin)
- Role i uprawnienia (admin, manager)
- Audyt działań (kto utworzył, kto zmienił)
- Historia zmian
- Bezpieczne logowanie

#### Raporty i statystyki:
- Raporty dzienne (przychody, rezerwacje)
- Statystyki lokalizacji
- Analiza obłożenia stolików
- Eksport raportów (CSV, PDF)

#### Bezpieczeństwo:
- JWT authentication z refresh tokens
- Rate limiting (ochrona przed nadużyciami)
- Szyfrowanie haseł (bcrypt)
- Zabezpieczenia CORS
- Walidacja danych po stronie serwera

### 1.3. Technologie

#### Frontend:
- Angular 18 (standalone components)
- TypeScript
- Tailwind CSS
- Progressive Web App (PWA)
- Service Worker
- Web Push API

#### Backend:
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication
- Resend (email)
- Rate limiting
- RESTful API

#### Deployment:
- Frontend: Vercel (CI/CD z GitHub)
- Backend: Render.com
- Baza danych: MongoDB Atlas
- Email: Resend
- Maps: Google Maps API

---

## 2. Modele Płatności

### Model 1: Zakup + Półroczny Maintenance

**Cena całkowita: 18 000 PLN**

Zawiera:
- Pełna aplikacja (wszystkie funkcjonalności wymienione powyżej)
- 6 miesięcy maintenance w cenie
- Transfer kodu źródłowego
- Dokumentacja techniczna
- Wdrożenie na produkcję

Po 6 miesiącach:
- Maintenance: 500 PLN/miesiąc (opcjonalnie)

**Zalety:**
- Najniższa cena całkowita
- 6 miesięcy wsparcia w cenie
- Własność kodu od początku
- Brak zobowiązań po 6 miesiącach

---

### Model 2: Zakup + Maintenance Od Początku

**Cena całkowita: 15 000 PLN + 500 PLN/miesiąc**

Zawiera:
- Pełna aplikacja (wszystkie funkcjonalności)
- Transfer kodu źródłowego
- Dokumentacja techniczna
- Wdrożenie na produkcję
- Maintenance od pierwszego miesiąca: 500 PLN/miesiąc

**Zalety:**
- Niższa cena początkowa
- Ciągłe wsparcie od startu
- Przewidywalne koszty miesięczne
- Własność kodu od początku

---

### Model 3: Abonament Miesięczny (Rata)

**Płatność miesięczna: 2 000 PLN + 500 PLN maintenance = 2 500 PLN/miesiąc**

**Okres spłaty:** do 12 miesięcy (30 000 PLN całkowita suma spłaty)

Po spłacie pełnej kwoty:
- Transfer kodu źródłowego
- Własność aplikacji
- Maintenance dalej: 500 PLN/miesiąc (opcjonalnie)

**Szczegóły:**
- Aplikacja dostępna od pierwszego miesiąca
- Kod źródłowy pozostaje u dostawcy do czasu pełnej spłaty
- Maintenance w cenie przez cały okres spłaty
- Po zapłaceniu 30 000 PLN: pełny transfer kodu

**Zalety:**
- Najniższe koszty początkowe
- Płynność finansowa
- Maintenance w cenie od początku
- Aplikacja dostępna od razu
- Możliwość rezygnacji (z utratą wpłaconych środków)

**Wady:**
- Wyższa cena całkowita (30 000 PLN vs 15 000-18 000 PLN)
- Kod źródłowy dopiero po pełnej spłacie
- Zobowiązanie miesięczne przez rok

---

## 3. Koszty Utrzymania (miesięcznie)

### 3.1. Infrastruktura

| Usługa | Dostawca | Koszt |
|--------|----------|-------|
| Hosting domeny | OVH/Nazwa.pl | ~50 PLN/rok (~4 PLN/miesiąc) |
| Frontend (Vercel) | Vercel | 0 PLN (plan Hobby) |
| Backend (Render.com) | Render | ~32 PLN/miesiąc (7 USD × 4.5) |
| Baza danych (MongoDB Atlas) | MongoDB | ~135 PLN/miesiąc (30 USD × 4.5) |
| Email (Resend) | Resend | 0-45 PLN/miesiąc (do 1000 emaili free) |
| Google Maps API | Google Cloud | ~0-50 PLN/miesiąc (zależy od ruchu) |
| **Suma infrastruktura** | | **~221-266 PLN/miesiąc** |

### 3.2. Maintenance

| Pakiet | Zakres | Koszt |
|--------|--------|-------|
| **Basic** | Poprawki błędów, aktualizacje bezpieczeństwa | **500 PLN/miesiąc** |
| **Standard** | Basic + drobne zmiany funkcjonalne, monitoring | **800 PLN/miesiąc** |
| **Premium** | Standard + rozwój nowych funkcji, wsparcie 24/7 | **1 200 PLN/miesiąc** |

**Maintenance zawiera:**
- Poprawki błędów (bug fixes)
- Aktualizacje bibliotek i zależności
- Aktualizacje bezpieczeństwa
- Monitoring serwera i bazy danych
- Wsparcie techniczne (email, telefon)
- Drobne zmiany funkcjonalne (do 2h/miesiąc w planie Basic)

**Nie zawiera:**
- Rozwój nowych funkcjonalności (rozliczane osobno)
- Przeprojektowanie UI/UX
- Integracje z systemami zewnętrznymi

---

## 4. Porównanie Modeli

| Kryterium | Model 1 | Model 2 | Model 3 |
|-----------|---------|---------|---------|
| **Koszt początkowy** | 18 000 PLN | 15 000 PLN | 2 500 PLN |
| **Maintenance (6 mies.)** | 0 PLN | 3 000 PLN | 0 PLN (w cenie) |
| **Koszt po roku** | 18 000 PLN + 3 000 PLN = 21 000 PLN | 15 000 PLN + 6 000 PLN = 21 000 PLN | 30 000 PLN |
| **Transfer kodu** | Od razu | Od razu | Po pełnej spłacie |
| **Maintenance po roku** | Opcjonalny (500 PLN/mies.) | 500 PLN/mies. | Opcjonalny (500 PLN/mies.) |
| **Najlepszy dla** | Klientów z budżetem | Długoterminowej współpracy | Startupów z małym budżetem |

---

## 5. Warunki Płatności

### Model 1 i Model 2:
- Zaliczka: 30% (przed rozpoczęciem prac)
- II rata: 40% (po dostarczeniu demo/testowej wersji)
- III rata: 30% (po wdrożeniu i akceptacji)

### Model 3 (Abonament):
- Płatność miesięczna z góry (do 5. dnia każdego miesiąca)
- Bez zaliczki
- Aplikacja dostępna od pierwszego miesiąca
- Anulowanie: możliwe, ale bez zwrotu wpłaconych środków

---

## 6. Czas Realizacji

- **Czas realizacji:** 4-6 tygodni od momentu podpisania umowy
- **Wdrożenie:** 1 tydzień (testy, szkolenie, uruchomienie na produkcji)
- **Wsparcie po wdrożeniu:** zgodnie z wybranym modelem maintenance

---

## 7. Gwarancja i Wsparcie

- **Gwarancja:** 3 miesiące od wdrożenia na poważne błędy
- **Wsparcie:** zgodnie z wybranym pakietem maintenance
- **Czas reakcji:** 24-48h (zależnie od pakietu)
- **Dostępność:** email, telefon, Teams/Zoom

---

## 8. Dodatkowe Usługi (opcjonalne)

| Usługa | Cena |
|--------|------|
| Szkolenie personelu (2h) | 500 PLN |
| Przeprojektowanie UI/UX | od 3 000 PLN |
| Integracja z systemem POS | od 5 000 PLN |
| System lojalnościowy | od 4 000 PLN |
| Aplikacja mobilna (iOS/Android) | od 15 000 PLN |
| System płatności online | od 3 000 PLN |

---

## 9. Podsumowanie

System rezerwacji "U Kelnerów" to kompleksowe rozwiązanie dla nowoczesnej restauracji, łączące:
- Intuicyjny interfejs dla klientów
- Zaawansowane narzędzia dla administratorów
- Bezpieczeństwo i skalowalność
- Niskie koszty utrzymania

**Oferujemy 3 elastyczne modele płatności dostosowane do Twojego budżetu:**
- Model 1: dla klientów z budżetem (18 000 PLN)
- Model 2: dla długoterminowej współpracy (15 000 PLN + 500 PLN/mies.)
- Model 3: dla startupów (2 500 PLN/mies. przez 12 mies.)

---

## 10. Kontakt

**Imię i Nazwisko / Nazwa Firmy**  
Email: kontakt@example.com  
Telefon: +48 XXX XXX XXX  
Strona: www.example.com

---

**Oferta ważna 30 dni od daty wystawienia.**

*Szczegóły techniczne, harmonogram prac i warunki umowy zostaną określone po akceptacji oferty.*
