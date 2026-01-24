import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PushService } from '../../../core/services/push.service';

// Interfejs dla eventu instalacji PWA
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-push-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Push Status Banner -->
    <div *ngIf="showBanner()" 
         class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-sm p-4 mb-6">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-blue-900 mb-1">Powiadomienia Push</h3>
          
          <!-- Status: Not supported -->
          <div *ngIf="!isSupported()" class="text-blue-700 text-sm">
            <p>Twoja przeglądarka nie wspiera powiadomień push.</p>
          </div>

          <!-- Status: Denied -->
          <div *ngIf="isSupported() && isDenied()" class="text-red-700 text-sm">
            <p class="mb-2">Powiadomienia są <strong>zablokowane</strong>. Aby je włączyć:</p>
            <ol class="list-decimal list-inside space-y-1 text-red-600">
              <li>Kliknij ikonę kłódki w pasku adresu</li>
              <li>Znajdź "Powiadomienia" i zmień na "Zezwól"</li>
              <li>Odśwież stronę</li>
            </ol>
          </div>

          <!-- Status: Default (can ask) -->
          <div *ngIf="isSupported() && canAsk()" class="text-blue-700 text-sm">
            <p class="mb-2">Włącz powiadomienia, aby otrzymywać alerty o nowych rezerwacjach.</p>
            <button 
              (click)="enablePush()"
              [disabled]="isEnabling()"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 
                     disabled:opacity-50 transition-colors">
              {{ isEnabling() ? 'Włączanie...' : 'Włącz powiadomienia' }}
            </button>
          </div>

          <!-- Status: Granted -->
          <div *ngIf="isSupported() && isGranted()" class="text-green-700 text-sm">
            <p class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Powiadomienia push są <strong>włączone</strong>
            </p>
            <p *ngIf="subscriptionError()" class="text-yellow-600 mt-1">
              ⚠️ {{ subscriptionError() }}
            </p>
          </div>

          <!-- Already installed as PWA -->
          <div *ngIf="isStandalone()" class="mt-3 p-2 bg-green-50 rounded border border-green-200">
            <p class="text-green-700 text-sm flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Aplikacja jest zainstalowana na urządzeniu
            </p>
          </div>

          <!-- Install Instructions (shown when NOT standalone) -->
          <div *ngIf="!isStandalone() && showInstallSection()" class="mt-3 p-3 bg-white/50 rounded border border-blue-100">
            <p class="text-blue-800 text-sm font-medium mb-2">
              📲 Zainstaluj aplikację na urządzeniu:
            </p>
            
            <!-- Automatic install button (Chrome/Edge) -->
            <button 
              *ngIf="canInstall()"
              (click)="installApp()"
              class="w-full mb-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm 
                     rounded-sm hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Zainstaluj teraz
            </button>

            <!-- Manual instructions -->
            <div class="text-blue-700 text-sm">
              <!-- iOS Safari visual guide -->
              <div *ngIf="isIOS()" class="mb-3">
                <p class="font-medium mb-2">📱 iPhone/iPad (Safari):</p>
                
                <!-- Visual Safari bar illustration -->
                <div class="bg-gray-800 rounded-lg p-2 mb-3 max-w-xs mx-auto">
                  <div class="flex items-center justify-around text-white/70">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    <div class="relative">
                      <svg class="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                      </svg>
                      <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                      <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </div>
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                    </svg>
                  </div>
                  <p class="text-center text-blue-400 text-xs mt-1">← Kliknij tę ikonę</p>
                </div>
              </div>
              
              <p *ngIf="isChromium() && !isIOS()" class="font-medium mb-1">Chrome/Edge/Opera:</p>
              <p *ngIf="isFirefox()" class="font-medium mb-1">Firefox:</p>
              
              <ol class="list-decimal list-inside space-y-1 text-blue-600 text-sm">
                <!-- iOS Safari - szczegółowy samouczek -->
                <ng-container *ngIf="isIOS()">
                  <li class="flex items-start gap-2">
                    <span class="flex-shrink-0 mt-0.5">1.</span>
                    <span>
                      Kliknij ikonę <strong>Udostępnij</strong> 
                      <span class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded mx-1 align-middle">
                        <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                        </svg>
                      </span>
                      na <strong>dole ekranu</strong> (w Safari)
                    </span>
                  </li>
                  <li class="flex items-start gap-2 mt-2">
                    <span class="flex-shrink-0 mt-0.5">2.</span>
                    <span>
                      Przewiń w dół i wybierz 
                      <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-gray-700 mx-1">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Dodaj do ekranu głównego
                      </span>
                    </span>
                  </li>
                  <li class="flex items-start gap-2 mt-2">
                    <span class="flex-shrink-0 mt-0.5">3.</span>
                    <span>
                      Kliknij <strong class="text-blue-700">"Dodaj"</strong> w prawym górnym rogu
                    </span>
                  </li>
                  <li class="flex items-start gap-2 mt-2">
                    <span class="flex-shrink-0 mt-0.5">4.</span>
                    <span>
                      Otwórz aplikację 
                      <span class="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl mx-1 align-middle shadow-md">
                        <span class="text-white text-xs font-bold">Z</span>
                      </span>
                      <strong>z ekranu głównego</strong> (nie z Safari!)
                    </span>
                  </li>
                </ng-container>

                <!-- iOS success message -->
                <div *ngIf="isIOS()" class="mt-3 p-2 bg-green-50 rounded border border-green-200">
                  <p class="text-green-700 text-xs flex items-center gap-2">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Po zalogowaniu się z aplikacji, pojawi się pytanie o powiadomienia. 
                    Powiadomienia będą przychodzić jak z natywnej aplikacji (np. Messenger).
                  </p>
                </div>
                
                <!-- Chrome/Edge/Opera Desktop & Android -->
                <ng-container *ngIf="isChromium() && !isIOS()">
                  <li>Kliknij <strong>⋮</strong> (menu) w prawym górnym rogu</li>
                  <li>Wybierz <strong>"Zainstaluj aplikację"</strong> lub <strong>"Dodaj do ekranu głównego"</strong></li>
                  <li>Potwierdź instalację</li>
                </ng-container>

                <!-- Firefox -->
                <ng-container *ngIf="isFirefox()">
                  <li>Firefox nie wspiera instalacji PWA</li>
                  <li>Użyj <strong>Chrome</strong> lub <strong>Edge</strong> aby zainstalować</li>
                </ng-container>
              </ol>
              
              <p class="text-blue-500 text-xs mt-2">
                Po instalacji otwórz aplikację z ekranu głównego, aby otrzymywać powiadomienia.
              </p>
            </div>
          </div>

          <!-- Chrome/FCM Warning -->
          <div *ngIf="showFCMWarning()" class="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p class="text-yellow-800 text-sm">
              <strong>💡 Uwaga:</strong> Jeśli powiadomienia nie działają w Chrome/Opera/Edge, 
              spróbuj <strong>Firefox</strong> - używa innej infrastruktury push.
            </p>
          </div>
        </div>

        <!-- Close button -->
        <button 
          (click)="hideBanner()"
          class="text-blue-400 hover:text-blue-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class PushStatusComponent implements OnInit, OnDestroy {
  showBanner = signal(true);
  isEnabling = signal(false);
  subscriptionError = signal<string | null>(null);
  
  // PWA Install
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  canInstallPWA = signal(false);

  constructor(private pushService: PushService) {}

  ngOnInit(): void {
    // Check if user dismissed the banner before
    const dismissed = localStorage.getItem('push-banner-dismissed');
    if (dismissed === 'true' && this.isGranted() && this.isStandalone()) {
      this.showBanner.set(false);
    }

    // Listen for PWA install prompt (Chrome/Edge on Android & Desktop)
    window.addEventListener('beforeinstallprompt', this.handleInstallPrompt);
    
    // Listen for successful install
    window.addEventListener('appinstalled', this.handleAppInstalled);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', this.handleInstallPrompt);
    window.removeEventListener('appinstalled', this.handleAppInstalled);
  }

  private handleInstallPrompt = (e: Event): void => {
    // Prevent Chrome from showing the mini-infobar
    e.preventDefault();
    // Store the event for later use
    this.deferredPrompt = e as BeforeInstallPromptEvent;
    this.canInstallPWA.set(true);
    console.log('[PushStatus] PWA install prompt available');
  };

  private handleAppInstalled = (): void => {
    console.log('[PushStatus] PWA installed successfully');
    this.canInstallPWA.set(false);
    this.deferredPrompt = null;
  };

  isSupported(): boolean {
    return this.pushService.isSupported();
  }

  isGranted(): boolean {
    return this.pushService.isPermissionGranted();
  }

  isDenied(): boolean {
    return this.pushService.isPermissionDenied();
  }

  canAsk(): boolean {
    return this.pushService.canAskPermission();
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  isChromium(): boolean {
    return /Chrome|Chromium|OPR|Opera|Edge/.test(navigator.userAgent) && 
           !/Firefox/.test(navigator.userAgent);
  }

  isFirefox(): boolean {
    return /Firefox/.test(navigator.userAgent) && !this.isIOS();
  }

  showFCMWarning(): boolean {
    // Show warning only if user has granted permission but might have FCM issues
    return this.isChromium() && this.isGranted();
  }

  /**
   * Sprawdza czy pokazać sekcję instalacji
   * Pokazuj zawsze gdy nie jest standalone
   */
  showInstallSection(): boolean {
    // Zawsze pokazuj instrukcje instalacji gdy nie jest standalone
    // Użytkownik powinien wiedzieć jak zainstalować aplikację
    return true;
  }

  /**
   * Sprawdza czy aplikacja działa jako zainstalowana PWA (standalone)
   */
  isStandalone(): boolean {
    // Check display-mode media query
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    // Check iOS standalone
    const isIOSStandalone = (window.navigator as any).standalone === true;
    // Check if launched from TWA (Trusted Web Activity)
    const referrer = document.referrer;
    const isTWA = referrer.includes('android-app://');
    
    return isStandaloneMode || isIOSStandalone || isTWA;
  }

  /**
   * Sprawdza czy można zainstalować aplikację
   */
  canInstall(): boolean {
    // Na iOS nie można programowo zainstalować - pokaż instrukcję osobno
    if (this.isIOS()) {
      return false;
    }
    // Na innych platformach sprawdź czy mamy prompt
    return this.canInstallPWA();
  }

  /**
   * Instaluje aplikację jako PWA
   */
  async installApp(): Promise<void> {
    if (!this.deferredPrompt) {
      console.warn('[PushStatus] No install prompt available');
      return;
    }

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();
      
      // Wait for user choice
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PushStatus] User accepted PWA install');
      } else {
        console.log('[PushStatus] User dismissed PWA install');
      }
      
      // Clear the prompt - it can only be used once
      this.deferredPrompt = null;
      this.canInstallPWA.set(false);
    } catch (error) {
      console.error('[PushStatus] Error installing PWA:', error);
    }
  }

  async enablePush(): Promise<void> {
    this.isEnabling.set(true);
    this.subscriptionError.set(null);

    try {
      const success = await this.pushService.subscribeAndRegister();
      if (success) {
        console.log('[PushStatus] Push notifications enabled successfully');
      } else {
        this.subscriptionError.set('Nie udało się aktywować powiadomień');
      }
    } catch (error: any) {
      console.error('[PushStatus] Error enabling push:', error);
      if (error?.message?.includes('push service error')) {
        this.subscriptionError.set('Problem z połączeniem do serwera push (FCM). Spróbuj Firefox.');
      } else {
        this.subscriptionError.set(error?.message || 'Wystąpił błąd');
      }
    } finally {
      this.isEnabling.set(false);
    }
  }

  hideBanner(): void {
    this.showBanner.set(false);
    if (this.isGranted()) {
      localStorage.setItem('push-banner-dismissed', 'true');
    }
  }
}
