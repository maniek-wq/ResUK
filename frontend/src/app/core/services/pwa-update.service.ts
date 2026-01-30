import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {
  updateAvailable = signal(false);
  private registration: ServiceWorkerRegistration | null = null;
  private newWorker: ServiceWorker | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA Update] Service Worker not supported');
      return;
    }

    // Sprawdź aktualizacje co 30 minut
    setInterval(() => {
      this.checkForUpdate();
    }, 30 * 60 * 1000);

    // Sprawdź aktualizacje przy starcie
    this.checkForUpdate();

    // Nasłuchuj na kontroler Service Workera
    this.setupUpdateListener();
  }

  private setupUpdateListener(): void {
    navigator.serviceWorker.ready.then((registration) => {
      this.registration = registration;

      // Sprawdź czy jest oczekujący worker
      if (registration.waiting) {
        this.newWorker = registration.waiting;
        this.updateAvailable.set(true);
        console.log('[PWA Update] Update available (waiting worker found)');
      }

      // Nasłuchuj na nowy worker w stanie "installing"
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        
        if (installingWorker) {
          console.log('[PWA Update] New Service Worker installing...');
          
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nowa wersja jest gotowa
              this.newWorker = installingWorker;
              this.updateAvailable.set(true);
              console.log('[PWA Update] New version ready to install');
            }
          });
        }
      });
    });

    // Nasłuchuj na wiadomości od Service Workera
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
        this.updateAvailable.set(true);
        console.log('[PWA Update] New version notification received');
      }
    });

    // Wykryj gdy kontroler się zmieni (po aktualizacji)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA Update] Controller changed, reloading page...');
      window.location.reload();
    });
  }

  async checkForUpdate(): Promise<void> {
    if (!this.registration) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        this.registration = registration;
      }
    }

    if (this.registration) {
      try {
        console.log('[PWA Update] Checking for updates...');
        await this.registration.update();
      } catch (error) {
        console.error('[PWA Update] Error checking for updates:', error);
      }
    }
  }

  applyUpdate(): void {
    if (!this.newWorker) {
      console.log('[PWA Update] No new worker to activate');
      return;
    }

    console.log('[PWA Update] Applying update...');
    
    // Wyślij wiadomość do nowego workera żeby aktywował się
    this.newWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Reset flag
    this.updateAvailable.set(false);
  }
}
