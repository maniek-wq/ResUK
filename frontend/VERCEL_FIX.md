# 🔧 Fix dla 404 na Vercel

## Problem
Frontend zwraca 404 na Vercel, ponieważ `outputDirectory` w `vercel.json` jest niepoprawne.

## Rozwiązanie

W Angular 17 z nowym build systemem, output jest w:
- `dist/frontend/browser/` - pliki przeglądarki (to jest to, czego potrzebujemy)
- `dist/frontend/server/` - pliki SSR (jeśli włączone)

## Co zostało zmienione:

1. **`vercel.json`** - zaktualizowano `outputDirectory` z `dist/frontend` na `dist/frontend/browser`

## Następne kroki:

1. Commit i push zmian:
   ```bash
   git add frontend/vercel.json
   git commit -m "Fix: Update Vercel outputDirectory to dist/frontend/browser"
   git push
   ```

2. Vercel automatycznie zrobi redeploy

3. Po redeploy sprawdź czy strona działa

## Alternatywnie - jeśli nadal nie działa:

Możesz też ustawić `outputDirectory` bezpośrednio w ustawieniach projektu Vercel:
1. Przejdź do projektu na Vercel
2. Settings → General → Build & Development Settings
3. Output Directory: `dist/frontend/browser`
4. Build Command: `npm run build -- --configuration production`
5. Install Command: `npm install`
6. Save i zrób redeploy
