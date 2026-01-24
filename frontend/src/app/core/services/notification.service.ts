import { Injectable, signal, computed } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Notification {
  _id: string;
  type: 'reservation_new' | 'reservation_confirmed' | 'reservation_cancelled' | 'reservation_updated' | 'system';
  title: string;
  message: string;
  reservation?: {
    _id: string;
    customer: {
      firstName: string;
      lastName: string;
      email?: string;
      phone: string;
    };
    date: string;
    timeSlot: {
      start: string;
      end: string;
    };
    status: string;
  };
  location?: {
    _id: string;
    name: string;
  };
  recipient?: string;
  isRead: boolean;
  readAt?: string;
  readBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  count: number;
  total: number;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  private unreadCountSignal = signal<number>(0);
  private loadingSignal = signal<boolean>(false);

  // Publiczne signals
  notifications = computed(() => this.notificationsSignal());
  unreadCount = computed(() => this.unreadCountSignal());
  loading = computed(() => this.loadingSignal());

  private refreshInterval?: any;

  constructor(private api: ApiService) {}

  // Pobierz wszystkie powiadomienia
  getNotifications(
    isRead?: boolean,
    limit: number = 50,
    skip: number = 0
  ): Observable<NotificationResponse> {
    this.loadingSignal.set(true);
    
    const params: any = { limit, skip };
    if (isRead !== undefined) {
      params.isRead = isRead.toString();
    }

    return this.api.get<NotificationResponse>('/notifications', params).pipe(
      tap(response => {
        if (response.success) {
          this.notificationsSignal.set(response.data);
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  // Pobierz liczbę nieprzeczytanych powiadomień
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.api.get<UnreadCountResponse>('/notifications/unread/count').pipe(
      tap(response => {
        if (response.success) {
          this.unreadCountSignal.set(response.count);
        }
      })
    );
  }

  // Oznacz powiadomienie jako przeczytane
  markAsRead(notificationId: string): Observable<{ success: boolean; data: Notification }> {
    return this.api.patch<{ success: boolean; data: Notification }>(
      `/notifications/${notificationId}/read`,
      {}
    ).pipe(
      tap(response => {
        if (response.success) {
          // Aktualizuj lokalny stan
          const notifications = this.notificationsSignal();
          const updated = notifications.map(n => 
            n._id === notificationId 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          );
          this.notificationsSignal.set(updated);
          
          // Zmniejsz licznik nieprzeczytanych
          if (this.unreadCountSignal() > 0) {
            this.unreadCountSignal.set(this.unreadCountSignal() - 1);
          }
        }
      })
    );
  }

  // Oznacz wszystkie powiadomienia jako przeczytane
  markAllAsRead(): Observable<{ success: boolean; message: string; count: number }> {
    return this.api.patch<{ success: boolean; message: string; count: number }>(
      '/notifications/read-all',
      {}
    ).pipe(
      tap(response => {
        if (response.success) {
          // Aktualizuj lokalny stan
          const notifications = this.notificationsSignal();
          const updated = notifications.map(n => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString()
          }));
          this.notificationsSignal.set(updated);
          
          // Wyzeruj licznik
          this.unreadCountSignal.set(0);
        }
      })
    );
  }

  // Usuń powiadomienie
  deleteNotification(notificationId: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(
      `/notifications/${notificationId}`
    ).pipe(
      tap(response => {
        if (response.success) {
          // Usuń z lokalnego stanu
          const notifications = this.notificationsSignal();
          const filtered = notifications.filter(n => n._id !== notificationId);
          this.notificationsSignal.set(filtered);
          
          // Zmniejsz licznik jeśli było nieprzeczytane
          const deleted = notifications.find(n => n._id === notificationId);
          if (deleted && !deleted.isRead && this.unreadCountSignal() > 0) {
            this.unreadCountSignal.set(this.unreadCountSignal() - 1);
          }
        }
      })
    );
  }

  // Rozpocznij automatyczne odświeżanie licznika nieprzeczytanych
  startAutoRefresh(intervalMs: number = 30000): void {
    this.stopAutoRefresh();
    
    // Pobierz od razu
    this.getUnreadCount().subscribe();
    
    // Następnie co X sekund
    this.refreshInterval = setInterval(() => {
      this.getUnreadCount().subscribe();
    }, intervalMs);
  }

  // Zatrzymaj automatyczne odświeżanie
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  // Odśwież powiadomienia i licznik
  refresh(): void {
    this.getUnreadCount().subscribe();
    this.getNotifications().subscribe();
  }
}
