import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushSubscriptionResponse {
  success: boolean;
  message: string;
  deviceCount?: number;
}

export interface PublicKeyResponse {
  success: boolean;
  publicKey: string;
}

export interface DeviceInfo {
  endpoint: string;
  deviceInfo: string;
  userAgent: string;
  createdAt: string;
}

export interface DevicesResponse {
  success: boolean;
  count: number;
  data: DeviceInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private vapidPublicKey: string | null = null;

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Sprawdza czy przeglądarka wspiera Web Push Notifications
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Sprawdza czy użytkownik już udzielił zgody na powiadomienia (bez pytania)
   */
  isPermissionGranted(): boolean {
    if (!this.isSupported()) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  /**
   * Sprawdza czy użytkownik odmówił zgody na powiadomienia
   */
  isPermissionDenied(): boolean {
    if (!this.isSupported()) {
      return true;
    }
    return Notification.permission === 'denied';
  }

  /**
   * Sprawdza czy można zapytać o zgodę (nie udzielona i nie odmówiona)
   */
  canAskPermission(): boolean {
    if (!this.isSupported()) {
      return false;
    }
    return Notification.permission === 'default';
  }

  /**
   * Prosi użytkownika o zgodę na powiadomienia
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Web Push Notifications nie są wspierane w tej przeglądarce');
    }
    return await Notification.requestPermission();
  }

  /**
   * Pobiera publiczny klucz VAPID z backendu
   */
  getPublicKey(): Observable<string> {
    if (this.vapidPublicKey) {
      return of(this.vapidPublicKey);
    }

    return this.api.get<PublicKeyResponse>('/push/public-key').pipe(
      switchMap((response) => {
        if (response.success && response.publicKey) {
          this.vapidPublicKey = response.publicKey;
          return of(response.publicKey);
        } else {
          return throwError(() => new Error('Nie udało się pobrać klucza VAPID'));
        }
      }),
      catchError((error) => {
        console.error('Error getting VAPID public key:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Konwertuje base64 URL-safe string na Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Czeka aż Service Worker będzie aktywny
   */
  private async waitForServiceWorkerActive(registration: ServiceWorkerRegistration): Promise<ServiceWorker> {
    return new Promise((resolve, reject) => {
      // Jeśli SW jest już aktywny, użyj go
      if (registration.active) {
        resolve(registration.active);
        return;
      }

      const sw = registration.installing || registration.waiting;
      
      if (!sw) {
        reject(new Error('Brak Service Workera'));
        return;
      }

      // Czekaj na aktywację
      const onStateChange = () => {
        // 'activated' to poprawny stan po aktywacji
        if (sw.state === 'activated') {
          sw.removeEventListener('statechange', onStateChange);
          resolve(sw);
        } else if (sw.state === 'redundant') {
          sw.removeEventListener('statechange', onStateChange);
          reject(new Error('Service Worker stał się redundant'));
        }
      };

      sw.addEventListener('statechange', onStateChange);

      // Timeout po 10 sekundach
      setTimeout(() => {
        sw.removeEventListener('statechange', onStateChange);
        // Jeśli w międzyczasie SW się aktywował
        if (registration.active) {
          resolve(registration.active);
        } else {
          reject(new Error('Timeout czekając na aktywację Service Workera'));
        }
      }, 10000);
    });
  }

  /**
   * Rejestruje Service Worker i subskrybuje push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      console.warn('[PushService] Web Push Notifications nie są wspierane');
      return null;
    }

    try {
      // Sprawdź zgodę
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('[PushService] Użytkownik nie udzielił zgody na powiadomienia');
        return null;
      }

      console.log('[PushService] Rejestruję Service Worker...');
      
      // Zarejestruj Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('[PushService] Service Worker zarejestrowany, czekam na aktywację...');

      // Poczekaj aż SW będzie aktywny
      await this.waitForServiceWorkerActive(registration);
      console.log('[PushService] Service Worker aktywny');

      // Sprawdź czy już istnieje subscription - jeśli tak, usuń je
      // (może być stare subscription z innym kluczem VAPID np. z Firebase)
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('[PushService] Znaleziono istniejące subscription, usuwam je...');
        await existingSubscription.unsubscribe();
        console.log('[PushService] Stare subscription usunięte');
      }

      // Pobierz publiczny klucz VAPID
      console.log('[PushService] Pobieram klucz VAPID...');
      const publicKey = await this.getPublicKey().toPromise();
      if (!publicKey) {
        throw new Error('Nie udało się pobrać klucza VAPID');
      }
      console.log('[PushService] Klucz VAPID pobrany:', publicKey.substring(0, 20) + '...');
      console.log('[PushService] Długość klucza:', publicKey.length);

      // Konwertuj klucz
      const applicationServerKey = this.urlBase64ToUint8Array(publicKey);
      console.log('[PushService] Klucz skonwertowany, długość Uint8Array:', applicationServerKey.length);
      // Prawidłowy klucz VAPID powinien mieć 65 bajtów
      if (applicationServerKey.length !== 65) {
        console.error('[PushService] BŁĄD: Klucz VAPID ma nieprawidłową długość! Oczekiwano 65, otrzymano:', applicationServerKey.length);
      }
      
      // Subskrybuj push notifications z timeoutem 5 sekund
      console.log('[PushService] Wywołuję pushManager.subscribe()...');
      
      const subscribePromise = registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Push subscription trwało zbyt długo (5s)')), 5000);
      });
      
      const subscription = await Promise.race([subscribePromise, timeoutPromise]);
      console.log('[PushService] Push subscription utworzone pomyślnie');
      console.log('[PushService] Endpoint:', subscription.endpoint);

      // Konwertuj subscription do formatu do wysłania do backendu
      const subscriptionData: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      return subscriptionData;
    } catch (error: any) {
      console.error('[PushService] Error subscribing:', error);
      console.error('[PushService] Error name:', error?.name);
      console.error('[PushService] Error message:', error?.message);
      
      // Dodatkowe informacje diagnostyczne
      if (error?.name === 'AbortError') {
        console.error('[PushService] AbortError - możliwe przyczyny:');
        console.error('  1. Chrome nie może połączyć się z FCM (Firebase Cloud Messaging)');
        console.error('  2. Firewall/sieć blokuje połączenia do mtalk.google.com lub fcm.googleapis.com');
        console.error('  3. Konflikt z innym Service Workerem');
        console.error('  ROZWIĄZANIE: Spróbuj w przeglądarce Firefox (używa innego push service)');
      }
      
      if (error?.message?.includes('Timeout')) {
        console.error('[PushService] Timeout - push service nie odpowiedział w czasie 5 sekund');
      }
      
      throw error;
    }
  }

  /**
   * Konwertuje ArrayBuffer na base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Wysyła subscription do backendu
   */
  registerSubscription(subscription: PushSubscription, deviceInfo?: string): Observable<PushSubscriptionResponse> {
    const userAgent = navigator.userAgent;
    const body = {
      subscription,
      deviceInfo: deviceInfo || this.getDeviceInfo(),
      userAgent
    };

    return this.api.post<PushSubscriptionResponse>('/push/subscribe', body).pipe(
      tap((response) => {
        if (response.success) {
          console.log('[PushService] Subscription zarejestrowane:', response);
        }
      }),
      catchError((error) => {
        console.error('[PushService] Error registering subscription:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Usuwa subscription z backendu
   */
  unsubscribe(endpoint: string): Observable<PushSubscriptionResponse> {
    // DELETE z body wymaga użycia HttpClient bezpośrednio
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    const body = { endpoint };
    
    return this.http.request<PushSubscriptionResponse>(
      'DELETE',
      `${environment.apiUrl}/push/unsubscribe`,
      { headers, body }
    ).pipe(
      catchError((error) => {
        console.error('[PushService] Error unsubscribing:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Pobiera listę zarejestrowanych urządzeń
   */
  getDevices(): Observable<DevicesResponse> {
    return this.api.get<DevicesResponse>('/push/devices').pipe(
      catchError((error) => {
        console.error('[PushService] Error getting devices:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Pełna rejestracja: subskrybuje i wysyła do backendu
   */
  async subscribeAndRegister(deviceInfo?: string): Promise<boolean> {
    try {
      const subscription = await this.subscribe();
      if (!subscription) {
        return false;
      }

      await this.registerSubscription(subscription, deviceInfo).toPromise();
      return true;
    } catch (error) {
      console.error('[PushService] Error in subscribeAndRegister:', error);
      return false;
    }
  }

  /**
   * Generuje informacje o urządzeniu
   */
  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    let deviceInfo = '';

    if (/Mobile|Android|iPhone|iPad/.test(ua)) {
      if (/iPhone/.test(ua)) {
        deviceInfo = 'iPhone';
      } else if (/iPad/.test(ua)) {
        deviceInfo = 'iPad';
      } else if (/Android/.test(ua)) {
        deviceInfo = 'Android';
      } else {
        deviceInfo = 'Mobile';
      }
    } else {
      deviceInfo = 'Desktop';
    }

    // Dodaj informacje o przeglądarce
    if (/Chrome/.test(ua)) {
      deviceInfo += ' (Chrome)';
    } else if (/Firefox/.test(ua)) {
      deviceInfo += ' (Firefox)';
    } else if (/Safari/.test(ua)) {
      deviceInfo += ' (Safari)';
    } else if (/Edge/.test(ua)) {
      deviceInfo += ' (Edge)';
    }

    return deviceInfo;
  }
}
