import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <!-- Bell Icon Button -->
      <button
        (click)="toggleDropdown()"
        class="relative p-2 text-stone-600 hover:text-stone-800 hover:bg-warm-50 rounded-sm transition-colors"
        [class.bg-warm-50]="isDropdownOpen()"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        
        <!-- Badge with count -->
        <span 
          *ngIf="notificationService.unreadCount() > 0"
          class="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold 
                 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1"
        >
          {{ notificationService.unreadCount() > 99 ? '99+' : notificationService.unreadCount() }}
        </span>
      </button>

      <!-- Dropdown -->
      <div 
        *ngIf="isDropdownOpen()"
        class="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-sm shadow-xl border border-warm-200 
               z-50 max-h-[500px] overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div class="p-4 border-b border-warm-200 flex items-center justify-between bg-warm-50">
          <h3 class="font-display text-lg text-stone-800 font-semibold">Powiadomienia</h3>
          <div class="flex items-center gap-2">
            <button
              *ngIf="notificationService.unreadCount() > 0"
              (click)="markAllAsRead()"
              class="text-xs text-brown-600 hover:text-brown-700 font-medium"
            >
              Oznacz wszystkie
            </button>
            <a
              routerLink="/admin/powiadomienia"
              (click)="closeDropdown()"
              class="text-xs text-brown-600 hover:text-brown-700 font-medium"
            >
              Zobacz wszystkie →
            </a>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="overflow-y-auto flex-1">
          <div *ngIf="notificationService.loading()" class="p-8 text-center">
            <div class="inline-block w-6 h-6 border-2 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
          </div>

          <div *ngIf="!notificationService.loading() && recentNotifications().length === 0" 
               class="p-8 text-center text-stone-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <p class="text-sm">Brak powiadomień</p>
          </div>

          <div *ngIf="!notificationService.loading() && recentNotifications().length > 0" 
               class="divide-y divide-warm-100">
            <div
              *ngFor="let notification of recentNotifications()"
              (click)="handleNotificationClick(notification)"
              class="p-4 hover:bg-warm-50 transition-colors cursor-pointer"
              [class.bg-blue-50]="!notification.isRead"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 mt-1">
                  <div 
                    class="w-2 h-2 rounded-full"
                    [class.bg-blue-600]="!notification.isRead"
                    [class.bg-transparent]="notification.isRead"
                  ></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-stone-800 text-sm mb-1">
                    {{ notification.title }}
                  </p>
                  <p class="text-stone-600 text-xs mb-2 line-clamp-2">
                    {{ notification.message }}
                  </p>
                  <div class="flex items-center justify-between">
                    <span class="text-stone-400 text-xs">
                      {{ formatTime(notification.createdAt) }}
                    </span>
                    <button
                      *ngIf="!notification.isRead"
                      (click)="markAsRead(notification._id, $event)"
                      class="text-xs text-brown-600 hover:text-brown-700 font-medium"
                    >
                      Oznacz jako przeczytane
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  isDropdownOpen = signal(false);
  recentNotifications = signal<Notification[]>([]);

  constructor(
    public notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Rozpocznij auto-refresh tylko jeśli admin jest zalogowany
    if (this.authService.isAuthenticated()) {
      this.notificationService.startAutoRefresh(30000); // Co 30 sekund
      this.loadRecentNotifications();
    }
  }

  ngOnDestroy(): void {
    this.notificationService.stopAutoRefresh();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    if (this.isDropdownOpen()) {
      this.closeDropdown();
    } else {
      this.isDropdownOpen.set(true);
      this.loadRecentNotifications();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  loadRecentNotifications(): void {
    this.notificationService.getNotifications(false, 5, 0).subscribe(response => {
      if (response.success) {
        this.recentNotifications.set(response.data);
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    // Oznacz jako przeczytane jeśli nie jest przeczytane
    if (!notification.isRead) {
      this.markAsRead(notification._id);
    }

    // Przekieruj do rezerwacji jeśli powiadomienie jest związane z rezerwacją
    if (notification.reservation) {
      this.router.navigate(['/admin/reservations'], {
        queryParams: { reservationId: notification.reservation._id }
      });
      this.closeDropdown();
    }
  }

  markAsRead(notificationId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      // Zaktualizuj lokalną listę
      const notifications = this.recentNotifications();
      const updated = notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      );
      this.recentNotifications.set(updated);
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      // Zaktualizuj lokalną listę
      const notifications = this.recentNotifications();
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      this.recentNotifications.set(updated);
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Teraz';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  }
}
