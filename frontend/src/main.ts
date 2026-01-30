import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Ustaw manifest zależnie od ścieżki (public vs admin)
const manifestLink = document.getElementById('app-manifest') as HTMLLinkElement | null;
if (manifestLink) {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  manifestLink.href = isAdminPath ? '/manifest.admin.json' : '/manifest.json';
}

// Rejestracja Service Workera dla Web Push Notifications
if ('serviceWorker' in navigator) {
  // Rejestruj natychmiast, nie czekaj na 'load'
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('[Main] Service Worker zarejestrowany:', registration.scope);
      
      // Sprawdź czy jest już aktywny
      if (registration.active) {
        console.log('[Main] Service Worker jest aktywny');
      }
      
      // Nasłuchuj na aktualizacje
      registration.addEventListener('updatefound', () => {
        console.log('[Main] Nowa wersja Service Workera dostępna');
      });
    })
    .catch((error) => {
      console.error('[Main] Błąd rejestracji Service Workera:', error);
      console.error('[Main] Szczegóły błędu:', error.message, error.stack);
    });
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
