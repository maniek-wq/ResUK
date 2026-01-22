# 🔧 Szybka naprawa problemu CORS

## Problem
Frontend na Vercel (`https://res-uk.vercel.app`) próbuje łączyć się z `http://localhost:3000`, co powoduje błędy CORS.

## Rozwiązanie

### Krok 1: Wdróż backend na Render
Jeśli jeszcze nie wdrożyłeś backendu na Render, zrób to teraz:
1. Przejdź na [render.com](https://render.com)
2. Utwórz nową Web Service
3. Połącz z repozytorium
4. Ustaw zmienne środowiskowe (patrz DEPLOYMENT_GUIDE.md)
5. Deploy

### Krok 2: Zaktualizuj environment.prod.ts

Po deploymencie backendu na Render, zaktualizuj plik:
`frontend/src/environments/environment.prod.ts`

Zmień:
```typescript
apiUrl: 'https://twoj-backend.onrender.com/api'
```

Na rzeczywisty URL z Render, np.:
```typescript
apiUrl: 'https://restauracja-backend-xxxx.onrender.com/api'
```

### Krok 3: Redeploy na Vercel

1. Commit i push zmian:
   ```bash
   git add .
   git commit -m "Fix: Update production environment with Render backend URL"
   git push
   ```

2. Vercel automatycznie zrobi redeploy, lub:
   - Przejdź do Vercel Dashboard
   - Kliknij "Redeploy" przy najnowszym deploymencie

### Krok 4: Zaktualizuj CORS w backendzie

W Render, upewnij się że zmienna środowiskowa `FRONTEND_URL` jest ustawiona na:
```
https://res-uk.vercel.app
```

Następnie zrób redeploy backendu na Render.

## Co zostało naprawione

✅ Dodano `fileReplacements` w `angular.json` - production build używa `environment.prod.ts`
✅ Zaktualizowano build script - używa `--configuration production`
✅ Zaktualizowano `vercel.json` - build command używa production
✅ CORS w backendzie jest już skonfigurowany do obsługi Vercel origin

## Weryfikacja

Po redeploy sprawdź:
1. Otwórz `https://res-uk.vercel.app` w przeglądarce
2. Otwórz DevTools → Console
3. Nie powinno być błędów CORS
4. Sprawdź Network tab - requesty powinny iść do Render, nie localhost
