---
title: "FAQ - Najczęściej Zadawane Pytania"
subtitle: "Odpowiedzi na wszystkie pytania dotyczące systemu rezerwacji online"
author: "U Kelnerów"
date: "2026-01-24"
geometry: "margin=2.5cm"
fontsize: 12pt
lang: pl-PL
documentclass: article
---

# FAQ - Najczęściej Zadawane Pytania

## System Rezerwacji Online dla Restauracji

---

## 1. Pytania Ogólne

### 1.1. Co to jest system rezerwacji online?

System rezerwacji online to aplikacja internetowa, która umożliwia klientom rezerwowanie stolików w restauracji przez internet, 24 godziny na dobę, 7 dni w tygodniu. System automatycznie zarządza dostępnością stolików, wysyła potwierdzenia email i umożliwia zarządzanie rezerwacjami przez panel administracyjny.

### 1.2. Czy system działa na telefonie?

**Tak!** System jest w pełni responsywny i działa na:
- Telefonach (iOS, Android)
- Tabletach
- Komputerach (Windows, Mac, Linux)

Dodatkowo, system można zainstalować jako aplikację na telefonie (PWA - Progressive Web App), co daje wrażenie natywnej aplikacji mobilnej.

### 1.3. Czy potrzebuję wiedzy technicznej, żeby korzystać z systemu?

**Nie!** Panel administracyjny jest intuicyjny i łatwy w obsłudze. Po wdrożeniu otrzymujesz:
- Szkolenie personelu (2-3h)
- Instrukcję obsługi
- Wsparcie techniczne

Wszystko, czego potrzebujesz, to podstawowa znajomość komputera i przeglądarki internetowej.

### 1.4. Czy system działa offline?

**Częściowo.** Panel administracyjny wymaga połączenia z internetem. Jednak strona publiczna może działać w trybie offline dzięki technologii PWA (Progressive Web App), co oznacza, że klienci mogą przeglądać menu i informacje o restauracji nawet bez internetu.

### 1.5. Czy system jest bezpieczny?

**Tak!** System wykorzystuje najnowsze standardy bezpieczeństwa:
- Szyfrowanie haseł (bcrypt)
- Autentykacja JWT (JSON Web Tokens)
- HTTPS (SSL) - szyfrowane połączenia
- Rate limiting - ochrona przed nadużyciami
- Walidacja danych po stronie serwera
- Regularne aktualizacje bezpieczeństwa

---

## 2. Pytania o Funkcjonalności

### 2.1. Jakie funkcjonalności są w systemie?

**Strona publiczna:**
- Responsywna strona internetowa
- Menu restauracji z cenami i zdjęciami
- Informacje o lokalizacji z Google Maps
- System rezerwacji online (wybór daty, godziny, liczby gości)
- Automatyczne potwierdzenia email
- PWA (możliwość instalacji na telefonie)

**Panel administracyjny:**
- Zarządzanie rezerwacjami (lista, edycja, anulowanie)
- Zarządzanie stolikami i lokalizacjami
- Zarządzanie menu (kategorie, pozycje, ceny)
- Godziny otwarcia (dla każdego dnia tygodnia)
- Raporty dzienne i statystyki
- Export danych (CSV, PDF)
- Historia zmian z audytem (kto, kiedy, co zmienił)
- Wielokontowe zarządzanie adminami
- Powiadomienia push (Web Push)

### 2.2. Czy mogę zarządzać wieloma lokalizacjami?

**Tak!** System obsługuje wiele lokalizacji. Możesz:
- Dodawać/edytować lokalizacje
- Przypisywać stoliki do lokalizacji
- Ustawiać różne godziny otwarcia dla każdej lokalizacji
- Porównywać statystyki między lokalizacjami
- Filtrować rezerwacje po lokalizacji

### 2.3. Czy system automatycznie przypisuje stoliki?

**Tak!** System wykorzystuje inteligentny algorytm, który:
- Automatycznie przypisuje dostępne stoliki
- Łączy stoliki dla większych grup
- Uwzględnia pojemność stolików
- Filtruje dostępne godziny na podstawie rzeczywistej dostępności

### 2.4. Czy mogę ustawić różne godziny otwarcia dla każdego dnia?

**Tak!** W panelu administracyjnym możesz ustawić godziny otwarcia dla:
- Poniedziałku
- Wtorku
- Środy
- Czwartku
- Piątku
- Soboty
- Niedzieli

System automatycznie uwzględnia te godziny przy generowaniu dostępnych slotów czasowych.

### 2.5. Czy system wysyła przypomnienia o rezerwacjach?

**Tak!** System automatycznie wysyła:
- Potwierdzenie rezerwacji (natychmiast po rezerwacji)
- Przypomnienie 24h przed rezerwacją (email)
- Przypomnienie 2h przed rezerwacją (SMS - opcjonalnie)

### 2.6. Czy mogę eksportować dane rezerwacji?

**Tak!** Możesz eksportować:
- Listę rezerwacji do CSV (Excel)
- Raporty dzienne do PDF
- Statystyki do CSV/PDF

### 2.7. Czy system obsługuje rezerwacje wydarzeń lub całego lokalu?

**Tak!** System obsługuje trzy typy rezerwacji:
- Rezerwacja stolika/stolików
- Rezerwacja wydarzenia (z nazwą, opisem, wymaganiami)
- Rezerwacja całego lokalu

Wszystkie typy są widoczne w panelu administracyjnym z odpowiednimi oznaczeniami.

---

## 3. Pytania o Ceny i Płatności

### 3.1. Ile kosztuje system?

Oferujemy 3 modele płatności:

**Model 1:** 18 000 PLN (jednorazowo) + 6 miesięcy maintenance w cenie  
**Model 2:** 15 000 PLN (jednorazowo) + 500 PLN/miesiąc maintenance  
**Model 3:** 2 500 PLN/miesiąc × 12 miesięcy (30 000 PLN całkowita suma)

Szczegóły w dokumencie "Oferta - Funkcjonalności i Modele Płatności".

### 3.2. Co zawiera cena?

**Wszystkie modele zawierają:**
- Pełną aplikację (strona publiczna + panel admina)
- Wdrożenie na produkcję
- Szkolenie personelu
- Dokumentację techniczną i użytkownika
- 3 miesiące gwarancji

**Model 1 i 2 dodatkowo:**
- Transfer kodu źródłowego (od razu)
- Własność aplikacji

**Model 3:**
- Transfer kodu źródłowego po pełnej spłacie (12 miesięcy)

### 3.3. Czy są jakieś ukryte koszty?

**Nie!** Wszystkie koszty są jasno określone. Jedynymi dodatkowymi kosztami mogą być:
- Hosting domeny (~50 PLN/rok) - jeśli nie masz własnej domeny
- Maintenance (opcjonalnie, po okresie gwarancyjnym)
- Dodatkowe funkcjonalności (rozliczane osobno, jeśli zażądane)

### 3.4. Jak wygląda płatność?

**Model 1 i 2:**
- Zaliczka: 30% (przed rozpoczęciem prac)
- II rata: 40% (po dostarczeniu demo/testowej wersji)
- III rata: 30% (po wdrożeniu i akceptacji)

**Model 3:**
- Płatność miesięczna z góry (do 5. dnia każdego miesiąca)
- Bez zaliczki

### 3.5. Czy mogę płacić w ratach?

**Tak!** Model 3 oferuje płatność w 12 ratach po 2 500 PLN/miesiąc. Po spłacie pełnej kwoty otrzymujesz kod źródłowy i własność aplikacji.

### 3.6. Co jeśli nie będę zadowolony z systemu?

**Rzadko się zdarza**, ale jeśli system nie spełnia wymagań określonych w umowie, poprawiamy bezpłatnie w okresie gwarancyjnym (3 miesiące). Jeśli nadal nie jesteś zadowolony, możemy omówić zwrot części środków (zależnie od sytuacji).

---

## 4. Pytania o Proces Współpracy

### 4.1. Jak długo trwa realizacja projektu?

**4-6 tygodni** od momentu podpisania umowy i otrzymania zaliczki (Model 1/2) lub rozpoczęcia abonamentu (Model 3).

Szczegółowy harmonogram w dokumencie "Proces Współpracy i Harmonogram".

### 4.2. Co muszę przygotować przed startem projektu?

**Materiały graficzne:**
- Logo restauracji (pliki wektorowe lub PNG wysokiej jakości)
- Zdjęcia lokalu/stolików (min. 5-10 zdjęć)
- Zdjęcia dań do menu (opcjonalnie)

**Treści:**
- Tekst strony "O nas"
- Menu restauracji (nazwy, opisy, ceny)
- Informacje o lokalizacji (adres, telefon, email)
- Godziny otwarcia

**Dane techniczne:**
- Informacje o stolikach (liczba, pojemność, strefy)

### 4.3. Czy mogę wprowadzać zmiany podczas projektu?

**Tak!** Wprowadzamy zmiany iteracyjnie:
- Małe zmiany (do 2h pracy): bezpłatne
- Średnie zmiany (2-8h): omawiamy koszty i czas
- Duże zmiany (8h+): wymagają zmiany harmonogramu i budżetu

### 4.4. Jak wygląda komunikacja podczas projektu?

**Regularna komunikacja:**
- Cotygodniowe raporty postępów (każdy piątek)
- Demo nowych funkcjonalności
- Szybka odpowiedź na pytania (do 24h)

**Spotkania:**
- Kick-off meeting (na początku projektu)
- Mid-project review (opcjonalnie, w połowie projektu)
- Final review (przed wdrożeniem)

**Kanały:**
- Email (podstawowy)
- Telefon (w godzinach pracy)
- Teams/Zoom (dla spotkań online)

### 4.5. Co jeśli projekt się opóźni?

**Rzadko się zdarza**, ale jeśli:
- Opóźnienie po stronie wykonawcy: bez dodatkowych kosztów, przedłużenie harmonogramu
- Opóźnienie po stronie klienta (brak feedbacku, zmiany zakresu): możliwe przedłużenie harmonogramu

Zawsze informujemy o ewentualnych opóźnieniach z wyprzedzeniem.

### 4.6. Czy otrzymam kod źródłowy?

**Tak!** 
- Model 1 i 2: kod źródłowy od razu po wdrożeniu
- Model 3: kod źródłowy po pełnej spłacie (12 miesięcy)

Kod źródłowy jest przekazywany przez repozytorium Git (GitHub/GitLab) z pełną dokumentacją.

---

## 5. Pytania Techniczne

### 5.1. Jakie technologie są używane?

**Frontend:**
- Angular 18 (framework JavaScript)
- TypeScript (język programowania)
- Tailwind CSS (stylowanie)
- Progressive Web App (PWA)

**Backend:**
- Node.js + Express.js (serwer)
- MongoDB (baza danych)
- JWT (autentykacja)

**Deployment:**
- Vercel (hosting frontendu)
- Render.com (hosting backendu)
- MongoDB Atlas (hosting bazy danych)

### 5.2. Czy potrzebuję własnego serwera?

**Nie!** System jest hostowany w chmurze (Vercel, Render, MongoDB Atlas). Nie musisz martwić się o:
- Serwery
- Konfigurację infrastruktury
- Backupy
- Aktualizacje bezpieczeństwa

Wszystko jest zarządzane przez nas (lub przez dostawców usług cloud).

### 5.3. Czy system jest skalowalny?

**Tak!** System jest zaprojektowany z myślą o skalowalności:
- Może obsługiwać wiele lokalizacji
- Może obsługiwać setki rezerwacji dziennie
- Automatyczne skalowanie w chmurze (w zależności od obciążenia)

### 5.4. Czy mogę zintegrować system z innymi narzędziami?

**Tak!** System oferuje RESTful API, które można zintegrować z:
- Systemami POS (Point of Sale)
- Systemami CRM
- Systemami email marketing
- Innymi aplikacjami (przez API)

Integracje są rozliczane osobno (od 3 000 PLN wzwyż, zależnie od złożoności).

### 5.5. Czy system działa na wszystkich przeglądarkach?

**Tak!** System działa na:
- Google Chrome (najnowsze wersje)
- Mozilla Firefox (najnowsze wersje)
- Safari (najnowsze wersje)
- Microsoft Edge (najnowsze wersje)
- Przeglądarki mobilne (Chrome Mobile, Safari Mobile)

### 5.6. Czy potrzebuję własnej domeny?

**Nie jest wymagane**, ale **zalecane**. Możesz użyć:
- Własnej domeny (np. restauracja.pl)
- Darmowej domeny (np. restauracja.vercel.app)

Własna domena wygląda profesjonalniej i jest lepsza dla SEO.

---

## 6. Pytania o Wsparcie i Maintenance

### 6.1. Co obejmuje okres gwarancyjny?

**3 miesiące gwarancji** obejmują:
- Naprawa błędów krytycznych (24-48h)
- Naprawa błędów zwykłych (3-5 dni)
- Wsparcie techniczne (email, telefon)
- Drobne poprawki (do 2h/miesiąc)

**Nie obejmuje:**
- Nowych funkcjonalności
- Zmiany designu
- Integracje z nowymi systemami

### 6.2. Co jeśli znajdę błąd po okresie gwarancyjnym?

**Możesz wykupić pakiet maintenance**, który obejmuje:
- Poprawki błędów
- Aktualizacje bezpieczeństwa
- Wsparcie techniczne

Pakiety: Basic (500 PLN/mies.), Standard (800 PLN/mies.), Premium (1 200 PLN/mies.)

### 6.3. Czy system jest aktualizowany?

**Tak!** W okresie gwarancyjnym i maintenance:
- Aktualizacje bezpieczeństwa (automatyczne)
- Aktualizacje bibliotek i zależności
- Poprawki błędów

Nowe funkcjonalności są rozliczane osobno (zależnie od zakresu).

### 6.4. Jak szybko otrzymam wsparcie?

**W zależności od pakietu:**
- Okres gwarancyjny: 24-48h (błędy krytyczne), 3-5 dni (błędy zwykłe)
- Pakiet Basic: Email support, odpowiedź w ciągu 48h
- Pakiet Standard: Email + telefon, odpowiedź w ciągu 24h
- Pakiet Premium: Email + telefon 24/7, odpowiedź w ciągu 12h

### 6.5. Czy mogę samodzielnie modyfikować system?

**Tak!** Jeśli wybrałeś Model 1 lub 2, otrzymujesz kod źródłowy i możesz:
- Modyfikować kod
- Dodawać własne funkcjonalności
- Zmieniać design

**Uwaga:** Modyfikacje poza okresem gwarancyjnym/maintenance mogą wpłynąć na wsparcie techniczne.

---

## 7. Pytania o Bezpieczeństwo i Dane

### 7.1. Czy moje dane są bezpieczne?

**Tak!** System wykorzystuje:
- Szyfrowanie haseł (bcrypt)
- HTTPS (SSL) - szyfrowane połączenia
- Bezpieczne przechowywanie danych w MongoDB Atlas
- Regularne backupy bazy danych
- Ochrona przed atakami (rate limiting, walidacja)

### 7.2. Czy dane klientów są zgodne z RODO?

**Tak!** System jest zgodny z RODO:
- Polityka prywatności
- Regulamin
- Zgody na przetwarzanie danych
- Prawo do usunięcia danych
- Szyfrowanie danych osobowych

### 7.3. Gdzie są przechowywane dane?

**Dane są przechowywane w:**
- MongoDB Atlas (baza danych) - serwery w Europie (zgodność z RODO)
- Vercel (frontend) - CDN globalny
- Render (backend) - serwery w Europie

Wszystkie dane są przechowywane zgodnie z przepisami RODO.

### 7.4. Czy mogę eksportować dane klientów?

**Tak!** Możesz eksportować:
- Listę rezerwacji (z danymi klientów) do CSV
- Raporty do PDF
- Dane do backupu

### 7.5. Co jeśli klient chce usunąć swoje dane?

**Możesz usunąć dane klienta** z panelu administracyjnego. System automatycznie usuwa wszystkie powiązane dane zgodnie z RODO.

---

## 8. Pytania o Integracje

### 8.1. Czy mogę zintegrować system z systemem POS?

**Tak!** Oferujemy integrację z systemami POS:
- Synchronizacja rezerwacji
- Przekazywanie danych klientów
- Aktualizacja statusu rezerwacji

Koszt integracji: od 5 000 PLN (zależnie od systemu POS).

### 8.2. Czy mogę dodać płatności online?

**Tak!** Możemy dodać integrację z:
- Stripe
- PayPal
- Przelewy24
- Dotpay

Koszt integracji: od 3 000 PLN.

### 8.3. Czy mogę zintegrować system z Facebook/Instagram?

**Tak!** System może być zintegrowany z:
- Facebook Events (automatyczne tworzenie wydarzeń)
- Instagram (link do rezerwacji w bio)
- Facebook Messenger (bot do rezerwacji - opcjonalnie)

Koszt integracji: od 2 000 PLN.

### 8.4. Czy mogę dodać system lojalnościowy?

**Tak!** Możemy dodać:
- Program lojalnościowy (punkty za rezerwacje)
- Karty stałego klienta
- Rabaty i promocje

Koszt: od 4 000 PLN.

---

## 9. Pytania o Alternatywy

### 9.1. Dlaczego nie użyć gotowego systemu (Bookero, Reservio)?

**Zalety systemu dedykowanego:**
- Własność kodu źródłowego
- Pełna customizacja
- Brak zależności od dostawcy
- Zaawansowane funkcjonalności (PWA, Web Push, zarządzanie menu)
- Brak miesięcznych opłat (po zakupie)

**Zalety gotowych systemów:**
- Niższa cena początkowa
- Szybsze wdrożenie
- Mniej funkcjonalności
- Zależność od dostawcy
- Ograniczona customizacja

**Wniosek:** System dedykowany jest lepszy dla restauracji, które chcą pełnej kontroli i zaawansowanych funkcjonalności.

### 9.2. Czy mogę używać systemu razem z rezerwacjami telefonicznymi?

**Tak!** System obsługuje zarówno rezerwacje online, jak i ręczne (dodawane przez admina). Wszystkie rezerwacje są widoczne w jednym miejscu w panelu administracyjnym.

### 9.3. Co jeśli mam już stronę internetową?

**Możemy:**
- Zintegrować system z istniejącą stroną (dodanie linku do rezerwacji)
- Stworzyć nową stronę z systemem rezerwacji
- Zastąpić istniejącą stronę nową (z systemem rezerwacji)

Koszt integracji: od 1 000 PLN (zależnie od złożoności).

---

## 10. Pytania o Rozwój i Przyszłość

### 10.1. Czy mogę dodać nowe funkcjonalności później?

**Tak!** Możemy dodać:
- Nowe funkcjonalności (rozliczane osobno)
- Integracje z nowymi systemami
- Zmiany designu
- Rozszerzenia funkcjonalności

Koszt: zależnie od zakresu (od 1 000 PLN).

### 10.2. Czy system może obsługiwać więcej niż jedną restaurację?

**Tak!** System jest zaprojektowany do obsługi wielu lokalizacji. Możesz:
- Dodawać nieograniczoną liczbę lokalizacji
- Zarządzać wszystkimi lokalizacjami z jednego panelu
- Porównywać statystyki między lokalizacjami

### 10.3. Czy mogę dodać aplikację mobilną (iOS/Android)?

**Tak!** Możemy stworzyć natywną aplikację mobilną:
- iOS (App Store)
- Android (Google Play)

Koszt: od 15 000 PLN (zależnie od zakresu funkcjonalności).

**Alternatywa:** System już działa jako PWA (Progressive Web App), co daje wrażenie natywnej aplikacji bez konieczności pobierania z App Store/Google Play.

---

## 11. Pytania o Zwrot z Inwestycji (ROI)

### 11.1. Kiedy system się zwróci?

**Break-even point:**
- Model 1: **10 dni**
- Model 2: **11 dni**
- Model 3: **Od razu** (zysk od pierwszego miesiąca)

Szczegółowa analiza w dokumencie "Analiza ROI - Zwrot z Inwestycji".

### 11.2. Ile mogę zyskać dzięki systemowi?

**Szacowane korzyści roczne:**
- Dodatkowy przychód z rezerwacji: **653 400 PLN**
- Oszczędności czasu personelu: **5 160 PLN**
- **SUMA: 658 560 PLN/rok**

**ROI (zwrot z inwestycji):**
- Model 1: **3 559%** (35.6x zwrot)
- Model 2: **3 036%** (30.4x zwrot)
- Model 3: **2 095%** (21x zwrot)

### 11.3. Czy system zwiększy liczbę rezerwacji?

**Tak!** Szacowany wzrost rezerwacji:
- Dostępność 24/7: +20%
- Redukcja no-show: +10%
- Marketing online: +12%
- **SUMA: +42% rezerwacji**

---

## 12. Pytania o Wdrożenie

### 12.1. Jak długo trwa wdrożenie?

**Wdrożenie na produkcję:** 1-2 dni  
**Szkolenie personelu:** 2-3h  
**Wsparcie po wdrożeniu:** 1 tydzień

**Całkowity czas:** około 1 tydzień od zakończenia developmentu.

### 12.2. Czy mogę przetestować system przed wdrożeniem?

**Tak!** Podczas projektu otrzymujesz:
- Demo strony publicznej (preview)
- Demo panelu admina (preview)
- Możliwość testowania przed wdrożeniem

### 12.3. Co jeśli coś nie zadziała po wdrożeniu?

**Okres gwarancyjny 3 miesiące:**
- Błędy krytyczne: naprawa w 24-48h
- Błędy zwykłe: naprawa w 3-5 dni
- Wszystko bezpłatnie

### 12.4. Czy otrzymam szkolenie?

**Tak!** Otrzymujesz:
- Szkolenie online/stacjonarne (2-3h)
- Materiały szkoleniowe (PDF)
- Video z szkolenia (do późniejszego odtworzenia)
- Instrukcję obsługi panelu admina

---

## 13. Pytania o Kontakt i Następne Kroki

### 13.1. Jak mogę się skontaktować?

**Email:** kontakt@example.com  
**Telefon:** +48 XXX XXX XXX  
**Strona:** www.example.com

### 13.2. Jak rozpocząć współpracę?

1. **Wybierz model płatności** (Model 1, 2 lub 3)
2. **Skontaktuj się z nami** (email/telefon)
3. **Omówimy szczegóły** (spotkanie online/stacjonarne)
4. **Podpiszemy umowę**
5. **Rozpoczniemy projekt!** 🚀

### 13.3. Czy mogę otrzymać bezpłatną wycenę?

**Tak!** Skontaktuj się z nami, a przygotujemy:
- Szczegółową wycenę
- Harmonogram projektu
- Prezentację funkcjonalności

Wszystko bezpłatnie i bez zobowiązań.

### 13.4. Czy mogę zobaczyć przykłady innych projektów?

**Tak!** Możemy pokazać:
- Demo działającego systemu
- Screenshoty z innych projektów (z zachowaniem poufności)
- Case studies (jeśli dostępne)

---

## 14. Podsumowanie

### 14.1. Najważniejsze Informacje

✅ **Czas realizacji:** 4-6 tygodni  
✅ **Break-even point:** 10-11 dni  
✅ **ROI:** 2 095%-3 559% (rok 1)  
✅ **Własność kodu:** Tak (Model 1/2)  
✅ **Wsparcie:** 3 miesiące gwarancji + opcjonalny maintenance  
✅ **Bezpieczeństwo:** Najnowsze standardy (HTTPS, szyfrowanie, RODO)  

### 14.2. Dlaczego Warto?

- ✅ Zwrot inwestycji w **10-11 dni**
- ✅ Wzrost rezerwacji o **+42%**
- ✅ Oszczędność czasu personelu: **430 PLN/miesiąc**
- ✅ Profesjonalny wizerunek
- ✅ Pełna kontrola nad systemem
- ✅ Brak miesięcznych opłat (po zakupie)

### 14.3. Następne Kroki

1. **Przeczytaj dokumentację** (Oferta, ROI, Proces Współpracy)
2. **Skontaktuj się z nami** (email/telefon)
3. **Omówmy szczegóły** (spotkanie)
4. **Rozpocznijmy współpracę!** 🚀

---

**Dokument przygotowany:** 2026-01-24  
**Ważność:** Do czasu aktualizacji systemu  
**Kontakt:** kontakt@example.com | +48 XXX XXX XXX

**Masz więcej pytań? Skontaktuj się z nami - chętnie odpowiemy!**
