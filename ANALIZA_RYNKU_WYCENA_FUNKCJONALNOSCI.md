---
title: "Analiza Rynku - Wycena Funkcjonalności Systemu Rezerwacji"
subtitle: "Porównanie cen z konkurencją - Szczecin 2026"
author: "U Kelnerów"
date: "2026-01-24"
geometry: "margin=2.5cm"
fontsize: 12pt
lang: pl-PL
documentclass: article
---

# Analiza Rynku - Wycena Funkcjonalności

## System Rezerwacji Online dla Restauracji

---

## 1. Wprowadzenie

Niniejszy dokument przedstawia szczegółową analizę rynkową systemu rezerwacji online dla restauracji, zawierającą:

- Wycenę poszczególnych funkcjonalności
- Porównanie z cenami konkurencji na rynku polskim
- Analizę konkurencyjności oferty
- Rekomendacje cenowe

**Metodologia:**
- Analiza 4 głównych systemów dostępnych w Polsce (2026)
- Wycena funkcjonalności na podstawie czasu pracy developera (junior/mid: 80-120 PLN/h)
- Porównanie modeli biznesowych (jednorazowa płatność vs abonament)

---

## 2. Analiza Konkurencji - Przegląd Rynku

### 2.1. Tableo
**Model:** Darmowy (freemium)
**Cena:** 0 PLN/miesiąc

**Funkcjonalności:**
- Zarządzanie rezerwacjami
- Automatyczne przypomnienia SMS/e-mail
- Interaktywny plan sali
- Integracja z Google Reserve i TripAdvisor
- Asystent AI (AIMA) - rezerwacje przez Facebook Messenger
- Kontrola tłumu
- Raporty i analizy

**Ograniczenia:**
- Brak własności kodu źródłowego
- Ograniczenia w customizacji
- Zależność od dostawcy
- Brak możliwości integracji z własnymi systemami

---

### 2.2. Bookero
**Model:** Abonament miesięczny
**Ceny:**
- Basic: 17,91 PLN/miesiąc (netto) + VAT = ~22 PLN/miesiąc
- Standard: 44,91 PLN/miesiąc (netto) + VAT = ~55 PLN/miesiąc
- Premium: 80,91 PLN/miesiąc (netto) + VAT = ~100 PLN/miesiąc

**Funkcjonalności (wspólne):**
- Rezerwacje online
- Zarządzanie pracownikami
- Automatyczne harmonogramy
- Katalog klientów
- Płatności online
- SMS-y
- Integracja z Google Calendar

**Dodatkowe w Premium:**
- Karnety
- Bilety QR
- Reguły cen i rabaty
- Wielojęzyczność

**Koszt roczny:** 264-1 200 PLN/rok (zależnie od planu)

---

### 2.3. Reservio
**Model:** Freemium + Abonament
**Ceny:**
- Darmowy: 40 rezerwacji/miesiąc
- Płatny: od 7,49€/miesiąc (~35 PLN/miesiąc)

**Funkcjonalności:**
- Rezerwacje
- Płatności
- Zarządzanie klientami
- POS (Point of Sale)
- Programy lojalnościowe
- Analityka

**Koszt roczny:** ~420 PLN/rok (plan płatny)

---

### 2.4. zarezerwuj.pl
**Model:** Darmowy (możliwość wypróbowania)
**Cena:** 0 PLN

**Funkcjonalności:**
- Rezerwacje stolików i sal
- Przejrzysty kalendarz
- Powiadomienia SMS
- Integracja z Facebookiem, LinkedIn, Google Business

**Ograniczenia:**
- Brak informacji o płatnych planach
- Ograniczona customizacja
- Brak własności kodu

---

## 3. Wycena Funkcjonalności - System "U Kelnerów"

### 3.1. Strona Publiczna

| Funkcjonalność | Czas pracy (h) | Stawka (PLN/h) | Koszt (PLN) | Uwagi |
|----------------|----------------|----------------|-------------|-------|
| **Responsywna strona internetowa** | 40h | 100 | 4 000 | Desktop, tablet, mobile |
| **Progressive Web App (PWA)** | 20h | 100 | 2 000 | Instalacja na telefonie, Service Worker |
| **Menu restauracji z cenami i zdjęciami** | 16h | 100 | 1 600 | CRUD, upload zdjęć, kategorie |
| **Integracja Google Maps** | 8h | 100 | 800 | API, pin na mapie, embed |
| **Strona "O nas"** | 8h | 100 | 800 | Statyczna strona z treścią |
| **Strona kontaktowa** | 8h | 100 | 800 | Formularz kontaktowy |
| **System cookies i RODO** | 12h | 100 | 1 200 | Banner, polityka prywatności, regulamin |
| **System rezerwacji online - podstawowy** | 32h | 100 | 3 200 | Formularz, walidacja, podstawowa logika |
| **Automatyczne filtrowanie godzin** | 16h | 100 | 1 600 | Algorytm dostępności, filtrowanie w czasie rzeczywistym |
| **Inteligentne przypisywanie stolików** | 24h | 100 | 2 400 | Łączenie stolików, algorytm optymalizacji |
| **Potwierdzenie email (Resend)** | 12h | 100 | 1 200 | Integracja Resend, szablony email |
| **Animacje scroll** | 8h | 100 | 800 | Fade-in, fade-in-left/right/up |
| **SUMA - Strona Publiczna** | **204h** | | **20 400 PLN** | |

---

### 3.2. Panel Administracyjny

| Funkcjonalność | Czas pracy (h) | Stawka (PLN/h) | Koszt (PLN) | Uwagi |
|----------------|----------------|----------------|-------------|-------|
| **Zarządzanie rezerwacjami** | 40h | 100 | 4 000 | Lista, filtry, edycja, anulowanie |
| **Kalendarz rezerwacji** | 24h | 100 | 2 400 | Widok kalendarzowy, drag & drop |
| **System potwierdzeń email** | 12h | 100 | 1 200 | Automatyczne emaile, szablony |
| **Historia zmian z audytem** | 20h | 100 | 2 000 | Kto, kiedy, co zmienił, statusHistory |
| **Export do CSV/PDF** | 16h | 100 | 1 600 | Generowanie raportów |
| **Zarządzanie lokalami** | 24h | 100 | 2 400 | CRUD lokali, adresy, dane kontaktowe |
| **Godziny otwarcia** | 12h | 100 | 1 200 | Edycja godzin dla każdego dnia |
| **Zarządzanie stolikami** | 32h | 100 | 3 200 | CRUD stolików, pojemność, strefy |
| **Zarządzanie menu** | 40h | 100 | 4 000 | Kategorie, pozycje, zdjęcia, ceny, alergeny |
| **System powiadomień push** | 32h | 100 | 3 200 | Web Push API, Service Worker, powiadomienia w aplikacji |
| **Wielokontowe zarządzanie adminami** | 32h | 100 | 3 200 | CRUD adminów, role, uprawnienia |
| **Audyt działań** | 16h | 100 | 1 600 | Logowanie działań, createdBy, updatedBy |
| **Raporty dzienne** | 24h | 100 | 2 400 | Przychody, rezerwacje, statystyki |
| **Statystyki lokalizacji** | 16h | 100 | 1 600 | Porównanie lokali, zestawienia |
| **SUMA - Panel Admina** | **328h** | | **32 800 PLN** | |

---

### 3.3. Backend i Infrastruktura

| Funkcjonalność | Czas pracy (h) | Stawka (PLN/h) | Koszt (PLN) | Uwagi |
|----------------|----------------|----------------|-------------|-------|
| **RESTful API** | 40h | 100 | 4 000 | Endpointy, routing, middleware |
| **Autentykacja JWT** | 24h | 100 | 2 400 | Login, refresh tokens, middleware |
| **Rate limiting** | 12h | 100 | 1 200 | Ochrona przed nadużyciami |
| **Walidacja danych** | 16h | 100 | 1 600 | Walidacja po stronie serwera |
| **Szyfrowanie haseł** | 8h | 100 | 800 | bcrypt, bezpieczeństwo |
| **CORS i bezpieczeństwo** | 12h | 100 | 1 200 | Konfiguracja CORS, headers |
| **Model bazy danych** | 24h | 100 | 2 400 | Schematy Mongoose, relacje |
| **Algorytm dostępności** | 32h | 100 | 3 200 | Filtrowanie godzin, przypisywanie stolików |
| **Integracja Resend** | 12h | 100 | 1 200 | Email service, szablony |
| **Integracja Google Maps API** | 8h | 100 | 800 | API key, embed maps |
| **Deployment setup** | 16h | 100 | 1 600 | Vercel, Render, MongoDB Atlas |
| **SUMA - Backend** | **204h** | | **20 400 PLN** | |

---

### 3.4. Design i UX

| Funkcjonalność | Czas pracy (h) | Stawka (PLN/h) | Koszt (PLN) | Uwagi |
|----------------|----------------|----------------|-------------|-------|
| **Projekt UI/UX** | 40h | 100 | 4 000 | Wireframes, mockupy, design system |
| **Responsywność** | 32h | 100 | 3 200 | Mobile-first, breakpoints |
| **Tailwind CSS setup** | 8h | 100 | 800 | Konfiguracja, custom colors |
| **Animacje i transitions** | 16h | 100 | 1 600 | Smooth transitions, hover effects |
| **SUMA - Design** | **96h** | | **9 600 PLN** | |

---

### 3.5. Testy i Dokumentacja

| Funkcjonalność | Czas pracy (h) | Stawka (PLN/h) | Koszt (PLN) | Uwagi |
|----------------|----------------|----------------|-------------|-------|
| **Testy jednostkowe** | 24h | 100 | 2 400 | Backend tests (Jest) |
| **Testy E2E** | 32h | 100 | 3 200 | Playwright, scenariusze użytkownika |
| **Dokumentacja techniczna** | 16h | 100 | 1 600 | README, API docs, deployment guide |
| **Szkolenie i wdrożenie** | 8h | 100 | 800 | Demo, szkolenie adminów |
| **SUMA - Testy i Dokumentacja** | **80h** | | **8 000 PLN** | |

---

## 4. Podsumowanie Wyceny

| Kategoria | Czas pracy (h) | Koszt (PLN) | % całości |
|-----------|----------------|-------------|-----------|
| Strona Publiczna | 204h | 20 400 | 22,4% |
| Panel Administracyjny | 328h | 32 800 | 36,0% |
| Backend i Infrastruktura | 204h | 20 400 | 22,4% |
| Design i UX | 96h | 9 600 | 10,5% |
| Testy i Dokumentacja | 80h | 8 000 | 8,8% |
| **SUMA CAŁKOWITA** | **912h** | **91 200 PLN** | **100%** |

**Uwaga:** Powyższa wycena to koszt teoretyczny przy stawce 100 PLN/h. W praktyce, przy negocjacjach i pakietach, cena może być niższa.

---

## 5. Porównanie z Konkurencją

### 5.1. Model Jednorazowej Płatności

| System | Cena jednorazowa | Funkcjonalności | Własność kodu | Customizacja |
|--------|------------------|-----------------|---------------|--------------|
| **U Kelnerów (Model 1)** | **18 000 PLN** | Pełny zakres | ✅ Tak | ✅ Pełna |
| **U Kelnerów (Model 2)** | **15 000 PLN** | Pełny zakres | ✅ Tak | ✅ Pełna |
| Tableo | 0 PLN | Ograniczony | ❌ Nie | ❌ Ograniczona |
| Bookero | N/A | Abonament | ❌ Nie | ❌ Ograniczona |
| Reservio | N/A | Abonament | ❌ Nie | ❌ Ograniczona |
| zarezerwuj.pl | 0 PLN | Podstawowy | ❌ Nie | ❌ Ograniczona |

**Wnioski:**
- Systemy darmowe nie oferują własności kodu ani pełnej customizacji
- Brak konkurencji oferującej jednorazową płatność z transferem kodu źródłowego
- Cena 15 000-18 000 PLN jest konkurencyjna dla dedykowanego rozwiązania

---

### 5.2. Model Abonamentowy (Roczny)

| System | Cena roczna | Funkcjonalności | Własność kodu | Customizacja |
|--------|-------------|-----------------|---------------|--------------|
| **U Kelnerów (Model 3)** | **30 000 PLN** (12 mies.) | Pełny zakres | ✅ Po spłacie | ✅ Pełna |
| Bookero Basic | 264 PLN | Podstawowy | ❌ Nie | ❌ Ograniczona |
| Bookero Standard | 660 PLN | Standardowy | ❌ Nie | ❌ Ograniczona |
| Bookero Premium | 1 200 PLN | Zaawansowany | ❌ Nie | ❌ Ograniczona |
| Reservio | 420 PLN | Podstawowy | ❌ Nie | ❌ Ograniczona |
| Tableo | 0 PLN | Ograniczony | ❌ Nie | ❌ Ograniczona |

**Wnioski:**
- Systemy abonamentowe są tańsze w krótkim okresie (264-1 200 PLN/rok)
- Po 12-25 latach abonamentu koszt przewyższa jednorazową płatność
- Model 3 "U Kelnerów" jest droższy, ale oferuje własność kodu po spłacie

---

### 5.3. Porównanie Funkcjonalności

| Funkcjonalność | U Kelnerów | Bookero | Reservio | Tableo |
|----------------|-------------|---------|----------|--------|
| Rezerwacje online | ✅ | ✅ | ✅ | ✅ |
| Panel admina | ✅ | ✅ | ✅ | ✅ |
| Zarządzanie stolikami | ✅ | ✅ | ✅ | ✅ |
| Zarządzanie menu | ✅ | ❌ | ❌ | ❌ |
| Godziny otwarcia | ✅ | ✅ | ✅ | ✅ |
| Wielokontowe adminy | ✅ | ✅ | ✅ | ❌ |
| Audyt działań | ✅ | ❌ | ❌ | ❌ |
| Historia zmian statusu | ✅ | ❌ | ❌ | ❌ |
| PWA (instalacja na telefonie) | ✅ | ❌ | ❌ | ❌ |
| Web Push Notifications | ✅ | ❌ | ❌ | ❌ |
| Raporty dzienne | ✅ | ✅ | ✅ | ✅ |
| Export CSV/PDF | ✅ | ✅ | ✅ | ✅ |
| Integracja Google Maps | ✅ | ❌ | ❌ | ❌ |
| Własność kodu źródłowego | ✅ | ❌ | ❌ | ❌ |
| Pełna customizacja | ✅ | ❌ | ❌ | ❌ |

**Wnioski:**
- "U Kelnerów" oferuje najszerszy zakres funkcjonalności
- Unikalne funkcje: PWA, Web Push, zarządzanie menu, audyt działań
- Własność kodu źródłowego - tylko w "U Kelnerów"

---

## 6. Analiza Konkurencyjności Cenowej

### 6.1. Koszt 5-letni (Total Cost of Ownership)

| System | Rok 1 | Rok 2 | Rok 3 | Rok 4 | Rok 5 | **SUMA 5 lat** |
|--------|-------|-------|-------|-------|-------|----------------|
| **U Kelnerów Model 1** | 18 000 | 6 000 | 6 000 | 6 000 | 6 000 | **42 000 PLN** |
| **U Kelnerów Model 2** | 21 000 | 6 000 | 6 000 | 6 000 | 6 000 | **45 000 PLN** |
| **U Kelnerów Model 3** | 30 000 | 6 000 | 6 000 | 6 000 | 6 000 | **54 000 PLN** |
| Bookero Premium | 1 200 | 1 200 | 1 200 | 1 200 | 1 200 | **6 000 PLN** |
| Reservio | 420 | 420 | 420 | 420 | 420 | **2 100 PLN** |
| Tableo | 0 | 0 | 0 | 0 | 0 | **0 PLN** |

**Uwaga:** Koszty maintenance (6 000 PLN/rok) dla "U Kelnerów" są opcjonalne po pierwszym roku.

**Wnioski:**
- Systemy abonamentowe są tańsze w krótkim okresie
- Po 5 latach różnica jest znacząca, ale "U Kelnerów" oferuje własność kodu
- Dla klientów długoterminowych (10+ lat) jednorazowa płatność jest bardziej opłacalna

---

### 6.2. Analiza Break-Even Point

**Pytanie:** Po ilu latach jednorazowa płatność staje się bardziej opłacalna niż abonament?

| System | Break-Even Point |
|--------|------------------|
| vs Bookero Premium (1 200 PLN/rok) | Po 15 latach |
| vs Reservio (420 PLN/rok) | Po 43 latach |
| vs Tableo (0 PLN) | Nigdy (ale brak własności kodu) |

**Wnioski:**
- Dla klientów długoterminowych (15+ lat) jednorazowa płatność jest opłacalna
- Dla startupów i małych restauracji abonament może być lepszy
- Własność kodu źródłowego ma wartość, której nie można zmierzyć tylko kosztem

---

## 7. Rekomendacje Cenowe

### 7.1. Obecna Oferta - Analiza

**Model 1: 18 000 PLN + 6 miesięcy maintenance**
- ✅ Konkurencyjna cena dla dedykowanego rozwiązania
- ✅ 6 miesięcy wsparcia w cenie
- ✅ Własność kodu od razu

**Model 2: 15 000 PLN + 500 PLN/miesiąc**
- ✅ Najniższa cena początkowa
- ✅ Ciągłe wsparcie od startu
- ✅ Dobre dla długoterminowej współpracy

**Model 3: 2 500 PLN/miesiąc × 12 miesięcy**
- ✅ Najniższe koszty początkowe
- ⚠️ Wyższa cena całkowita (30 000 PLN)
- ✅ Dobre dla startupów z małym budżetem

---

### 7.2. Sugerowane Zmiany Cenowe (Opcjonalne)

**Opcja A: Obniżenie ceny Modelu 1**
- Obecna: 18 000 PLN
- Sugerowana: 16 000 PLN
- Uzasadnienie: Lepsza konkurencyjność vs Bookero Premium (po 13 latach break-even)

**Opcja B: Dodanie Modelu 4 - "Starter"**
- Cena: 10 000 PLN (jednorazowo)
- Zakres: Podstawowe funkcjonalności (bez PWA, bez Web Push, bez zarządzania menu)
- Cel: Konkurencja z Bookero Standard (660 PLN/rok)

**Opcja C: Elastyczny maintenance**
- Basic: 300 PLN/miesiąc (tylko poprawki błędów)
- Standard: 500 PLN/miesiąc (obecny)
- Premium: 800 PLN/miesiąc (obecny Standard)

---

## 8. Wnioski Końcowe

### 8.1. Mocne Strony Oferty

1. **Własność kodu źródłowego** - unikalna na rynku
2. **Pełna customizacja** - brak ograniczeń
3. **Szeroki zakres funkcjonalności** - więcej niż konkurencja
4. **Elastyczne modele płatności** - 3 opcje dla różnych budżetów
5. **PWA i Web Push** - nowoczesne technologie

### 8.2. Słabe Strony Oferty

1. **Wyższa cena początkowa** - niższa niż abonamenty konkurencji
2. **Brak darmowego planu** - konkurencja oferuje freemium
3. **Wymagany maintenance** - dodatkowy koszt (ale opcjonalny)

### 8.3. Rekomendacje

1. **Pozostać przy obecnych cenach** - są konkurencyjne dla dedykowanego rozwiązania
2. **Podkreślać wartość własności kodu** - unikalna zaleta
3. **Oferować darmowy okres próbny** - 14 dni bez zobowiązań
4. **Dodać case studies** - przykłady sukcesów innych restauracji
5. **Stworzyć porównanie TCO** - pokazać koszt 10-letni vs konkurencja

---

## 9. Podsumowanie Tabelaryczne

| Kryterium | U Kelnerów | Bookero Premium | Reservio | Tableo |
|-----------|-------------|-----------------|-----------|--------|
| **Cena jednorazowa** | 15 000-18 000 PLN | N/A | N/A | 0 PLN |
| **Cena roczna (abonament)** | 30 000 PLN (Model 3) | 1 200 PLN | 420 PLN | 0 PLN |
| **Własność kodu** | ✅ Tak | ❌ Nie | ❌ Nie | ❌ Nie |
| **Customizacja** | ✅ Pełna | ❌ Ograniczona | ❌ Ograniczona | ❌ Ograniczona |
| **Zakres funkcjonalności** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **PWA** | ✅ Tak | ❌ Nie | ❌ Nie | ❌ Nie |
| **Web Push** | ✅ Tak | ❌ Nie | ❌ Nie | ❌ Nie |
| **Zarządzanie menu** | ✅ Tak | ❌ Nie | ❌ Nie | ❌ Nie |
| **Audyt działań** | ✅ Tak | ❌ Nie | ❌ Nie | ❌ Nie |
| **Break-even (vs Bookero)** | 15 lat | - | - | - |
| **Najlepszy dla** | Długoterminowi klienci | Małe restauracje | Startupy | Testowanie |

---

## 10. Zakończenie

Analiza rynkowa pokazuje, że oferta "U Kelnerów" jest **konkurencyjna cenowo** dla dedykowanego rozwiązania z własnością kodu źródłowego. 

**Kluczowe zalety:**
- Własność kodu źródłowego (unikalna na rynku)
- Pełna customizacja
- Szeroki zakres funkcjonalności
- Elastyczne modele płatności

**Rekomendacja:** Pozostać przy obecnych cenach (15 000-18 000 PLN), podkreślając wartość własności kodu i długoterminowe korzyści.

---

**Dokument przygotowany:** 2026-01-24  
**Ważność analizy:** 6 miesięcy (do 2026-07-24)  
**Następna aktualizacja:** Po zmianach cenowych konkurencji lub wprowadzeniu nowych funkcjonalności
