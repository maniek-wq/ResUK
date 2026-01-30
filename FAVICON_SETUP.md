# 🔧 Instrukcja konfiguracji Favicon

## Problem
Domyślny `favicon.ico` z Angulara nadpisuje logo.jpg. Przeglądarki preferują plik `favicon.ico` w root katalogu.

## Rozwiązanie: Konwersja logo.jpg na favicon.ico

### Opcja 1: Online Converter (Najprostsze)

1. **Otwórz jeden z tych narzędzi:**
   - https://favicon.io/favicon-converter/
   - https://www.converttoico.com/
   - https://favicononline.org/converter

2. **Wgraj plik:**
   - Przeciągnij `frontend/src/assets/images/logo.jpg` do konwertera

3. **Pobierz favicon.ico:**
   - Pobierz wygenerowany plik `favicon.ico`

4. **Zastąp stary plik:**
   - Skopiuj nowy `favicon.ico` do `frontend/src/favicon.ico`
   - (Zastąp istniejący plik)

5. **Odśwież przeglądarkę:**
   - Wymuś odświeżenie: `Ctrl + Shift + R` (Windows) lub `Cmd + Shift + R` (Mac)
   - Lub wyczyść cache przeglądarki

### Opcja 2: Użyj ImageMagick (jeśli masz zainstalowane)

```bash
convert frontend/src/assets/images/logo.jpg -resize 32x32 frontend/src/favicon.ico
```

### Opcja 3: Użyj Node.js (jeśli masz zainstalowane narzędzia)

```bash
npm install -g jimp-cli
jimp-cli frontend/src/assets/images/logo.jpg --resize 32x32 --output frontend/src/favicon.ico
```

## Format i wymagania

- **Format:** `.ico` (najlepszy) lub `.png` (też działa)
- **Rozmiary:** 16x16, 32x32, 48x48 pikseli (favicon.ico może zawierać wiele rozmiarów)
- **Kształt:** Kwadratowy (jeśli logo nie jest kwadratowe, narzędzia online automatycznie dodadzą padding)

## Sprawdzenie

Po zastąpieniu pliku:
1. Zbuduj aplikację: `npm run build`
2. Sprawdź w przeglądarce: `Ctrl + Shift + R` (wymusza odświeżenie cache)
3. Favicon powinien się zmienić w zakładce przeglądarki

## Uwaga o cache

Przeglądarki **bardzo agresywnie cache'ują favicony**. Jeśli nie widzisz zmiany:
- Wyczyść cache przeglądarki
- Użyj trybu incognito
- Lub dodaj parametr wersji: `href="/assets/images/logo.jpg?v=2"`
