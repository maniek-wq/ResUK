import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent, NotificationBellComponent],
  template: `
    <div class="min-h-screen bg-warm-100 flex">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="flex-1 md:ml-64">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-warm-200 px-4 md:px-8 py-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- Hamburger button (mobile only) -->
              <button 
                (click)="sidebarService.toggle()"
                class="md:hidden p-2 text-stone-600 hover:text-stone-800 hover:bg-warm-50 rounded-sm transition-colors flex-shrink-0"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <h1 class="font-display text-lg sm:text-xl md:text-2xl text-stone-800 font-semibold truncate">Powiadomienia</h1>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <app-notification-bell></app-notification-bell>
              <button
                *ngIf="notificationService.unreadCount() > 0"
                (click)="markAllAsRead()"
                class="hidden sm:block px-3 py-2 bg-brown-700 text-white text-sm rounded-sm hover:bg-brown-800 transition-colors whitespace-nowrap"
                [disabled]="loading()"
              >
                Oznacz wszystkie
              </button>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 md:p-8">
          <!-- Filters & Actions -->
          <div class="bg-white rounded-sm shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
            <div class="flex flex-col gap-3">
              <!-- Filter buttons -->
              <div class="flex flex-wrap gap-2">
                <button
                  (click)="filter.set('all')"
                  class="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm rounded-sm transition-colors text-center"
                  [class.bg-brown-700]="filter() === 'all'"
                  [class.text-white]="filter() === 'all'"
                  [class.bg-stone-200]="filter() !== 'all'"
                  [class.text-stone-700]="filter() !== 'all'"
                >
                  Wszystkie ({{ allCount() }})
                </button>
                <button
                  (click)="filter.set('unread')"
                  class="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm rounded-sm transition-colors text-center"
                  [class.bg-brown-700]="filter() === 'unread'"
                  [class.text-white]="filter() === 'unread'"
                  [class.bg-stone-200]="filter() !== 'unread'"
                  [class.text-stone-700]="filter() !== 'unread'"
                >
                  Nieprzeczytane ({{ notificationService.unreadCount() }})
                </button>
                <button
                  (click)="filter.set('read')"
                  class="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm rounded-sm transition-colors text-center"
                  [class.bg-brown-700]="filter() === 'read'"
                  [class.text-white]="filter() === 'read'"
                  [class.bg-stone-200]="filter() !== 'read'"
                  [class.text-stone-700]="filter() !== 'read'"
                >
                  Przeczytane ({{ readCount() }})
                </button>
              </div>
              <!-- Action buttons -->
              <div class="flex gap-2">
                <button
                  (click)="refresh()"
                  class="flex-1 sm:flex-none px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded-sm hover:bg-stone-300 transition-colors"
                  [disabled]="loading()"
                >
                  {{ loading() ? 'Odświeżanie...' : 'Odśwież' }}
                </button>
                <button
                  *ngIf="notificationService.unreadCount() > 0"
                  (click)="markAllAsRead()"
                  class="sm:hidden flex-1 px-3 py-2 bg-brown-700 text-white text-sm rounded-sm hover:bg-brown-800 transition-colors"
                  [disabled]="loading()"
                >
                  Oznacz wszystkie
                </button>
              </div>
            </div>
          </div>

          <!-- Notifications List -->
          <div class="bg-white rounded-sm shadow-sm">
            <div *ngIf="loading()" class="p-12 text-center">
              <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
            </div>

            <div *ngIf="!loading() && filteredNotifications().length === 0" class="p-12 text-center text-stone-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <p class="text-lg font-medium mb-2">Brak powiadomień</p>
              <p class="text-sm">Nie masz żadnych powiadomień w tej kategorii.</p>
            </div>

            <div *ngIf="!loading() && filteredNotifications().length > 0" class="p-3 sm:p-4 flex flex-col gap-3">
              <div
                *ngFor="let notification of filteredNotifications()"
                class="p-4 hover:bg-warm-50 transition-colors rounded-sm border border-warm-200"
                [class.bg-blue-50]="!notification.isRead"
                [class.border-blue-200]="!notification.isRead"
              >
                <!-- Header: Title + Time + Status dot -->
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <div 
                      class="w-2 h-2 rounded-full flex-shrink-0"
                      [class.bg-blue-600]="!notification.isRead"
                      [class.bg-stone-300]="notification.isRead"
                    ></div>
                    <h3 class="font-semibold text-stone-800 text-sm sm:text-base truncate">
                      {{ notification.title }}
                    </h3>
                  </div>
                  <span class="text-xs text-stone-400 flex-shrink-0">{{ formatTime(notification.createdAt) }}</span>
                </div>

                <!-- Reservation info (compact) -->
                <div *ngIf="notification.reservation" class="ml-4 mb-3">
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-700">
                    <span class="font-medium">{{ notification.reservation.customer.firstName }} {{ notification.reservation.customer.lastName }}</span>
                    <span class="text-stone-400">•</span>
                    <span>{{ formatDateShort(notification.reservation.date) }}, {{ notification.reservation.timeSlot.start }}</span>
                    <span *ngIf="notification.location" class="text-stone-400">•</span>
                    <span *ngIf="notification.location" class="text-stone-500">{{ notification.location.name }}</span>
                  </div>
                </div>

                <!-- Message for non-reservation notifications -->
                <p *ngIf="!notification.reservation" class="ml-4 mb-3 text-sm text-stone-600">
                  {{ notification.message }}
                </p>

                <!-- Actions -->
                <div class="ml-4 flex flex-wrap items-center gap-2">
                  <a
                    *ngIf="notification.reservation"
                    [routerLink]="['/admin/reservations']"
                    [queryParams]="{ reservationId: notification.reservation._id }"
                    class="px-3 py-1.5 text-xs bg-brown-700 text-white rounded-sm hover:bg-brown-800 transition-colors"
                  >
                    Zobacz rezerwację
                  </a>
                  <button
                    *ngIf="!notification.isRead"
                    (click)="markAsRead(notification._id)"
                    class="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-sm transition-colors"
                  >
                    Oznacz jako przeczytane
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit, OnDestroy {
  filter = signal<'all' | 'unread' | 'read'>('all');
  notifications = signal<Notification[]>([]);
  allCount = signal(0);
  readCount = signal(0);

  loading = computed(() => this.notificationService.loading());

  filteredNotifications = computed(() => {
    const notifs = this.notifications();
    const filterValue = this.filter();
    
    if (filterValue === 'all') return notifs;
    if (filterValue === 'unread') return notifs.filter(n => !n.isRead);
    if (filterValue === 'read') return notifs.filter(n => n.isRead);
    return notifs;
  });

  constructor(
    public sidebarService: SidebarService,
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    // Rozpocznij auto-refresh
    this.notificationService.startAutoRefresh(30000);
  }

  ngOnDestroy(): void {
    this.notificationService.stopAutoRefresh();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(undefined, 100, 0).subscribe(response => {
      if (response.success) {
        this.notifications.set(response.data);
        this.allCount.set(response.total);
        this.readCount.set(response.total - response.count);
      }
    });
  }

  refresh(): void {
    this.loadNotifications();
    this.notificationService.refresh();
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      // Zaktualizuj lokalną listę
      const notifications = this.notifications();
      const updated = notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      );
      this.notifications.set(updated);
      this.readCount.set(this.readCount() + 1);
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      // Zaktualizuj lokalną listę
      const notifications = this.notifications();
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      this.notifications.set(updated);
      this.readCount.set(this.allCount());
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
    
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatDateShort(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  }
}
