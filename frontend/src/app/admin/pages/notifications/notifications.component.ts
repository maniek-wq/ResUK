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
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <!-- Hamburger button (mobile only) -->
              <button 
                (click)="sidebarService.toggle()"
                class="md:hidden p-2 text-stone-600 hover:text-stone-800 hover:bg-warm-50 rounded-sm transition-colors flex-shrink-0"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <div class="min-w-0">
                <h1 class="font-display text-xl md:text-2xl text-stone-800 font-semibold">Powiadomienia</h1>
                <p class="text-stone-500 text-sm hidden md:block">
                  {{ notificationService.unreadCount() }} nieprzeczytanych
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
              <app-notification-bell></app-notification-bell>
              <button
                *ngIf="notificationService.unreadCount() > 0"
                (click)="markAllAsRead()"
                class="px-4 py-2 bg-brown-700 text-white text-sm rounded-sm hover:bg-brown-800 transition-colors whitespace-nowrap"
                [disabled]="loading()"
              >
                Oznacz wszystkie jako przeczytane
              </button>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 md:p-8">
          <!-- Filters -->
          <div class="bg-white rounded-sm shadow-sm p-4 md:p-6 mb-6">
            <div class="flex flex-col sm:flex-row gap-4 items-center">
              <div class="flex gap-2 flex-1 w-full sm:w-auto">
                <button
                  (click)="filter.set('all')"
                  class="px-4 py-2 text-sm rounded-sm transition-colors"
                  [class.bg-brown-700]="filter() === 'all'"
                  [class.text-white]="filter() === 'all'"
                  [class.bg-stone-200]="filter() !== 'all'"
                  [class.text-stone-700]="filter() !== 'all'"
                >
                  Wszystkie ({{ allCount() }})
                </button>
                <button
                  (click)="filter.set('unread')"
                  class="px-4 py-2 text-sm rounded-sm transition-colors"
                  [class.bg-brown-700]="filter() === 'unread'"
                  [class.text-white]="filter() === 'unread'"
                  [class.bg-stone-200]="filter() !== 'unread'"
                  [class.text-stone-700]="filter() !== 'unread'"
                >
                  Nieprzeczytane ({{ notificationService.unreadCount() }})
                </button>
                <button
                  (click)="filter.set('read')"
                  class="px-4 py-2 text-sm rounded-sm transition-colors"
                  [class.bg-brown-700]="filter() === 'read'"
                  [class.text-white]="filter() === 'read'"
                  [class.bg-stone-200]="filter() !== 'read'"
                  [class.text-stone-700]="filter() !== 'read'"
                >
                  Przeczytane ({{ readCount() }})
                </button>
              </div>
              <button
                (click)="refresh()"
                class="px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded-sm hover:bg-stone-300 transition-colors whitespace-nowrap"
                [disabled]="loading()"
              >
                <span *ngIf="!loading()">Odśwież</span>
                <span *ngIf="loading()">Odświeżanie...</span>
              </button>
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

            <div *ngIf="!loading() && filteredNotifications().length > 0" class="divide-y divide-warm-100">
              <div
                *ngFor="let notification of filteredNotifications()"
                class="p-4 md:p-6 hover:bg-warm-50 transition-colors"
                [class.bg-blue-50]="!notification.isRead"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 mt-1">
                    <div 
                      class="w-3 h-3 rounded-full"
                      [class.bg-blue-600]="!notification.isRead"
                      [class.bg-transparent]="notification.isRead"
                    ></div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-4 mb-2">
                      <div class="flex-1 min-w-0">
                        <h3 class="font-display text-base md:text-lg text-stone-800 font-semibold mb-1">
                          {{ notification.title }}
                        </h3>
                        <p class="text-stone-600 text-sm md:text-base mb-3">
                          {{ notification.message }}
                        </p>
                        
                        <!-- Reservation details if available -->
                        <div *ngIf="notification.reservation" class="bg-warm-50 p-3 rounded-sm mb-3">
                          <p class="text-xs text-stone-500 mb-1">Szczegóły rezerwacji:</p>
                          <p class="text-sm text-stone-700">
                            <strong>{{ notification.reservation.customer.firstName }} {{ notification.reservation.customer.lastName }}</strong> • 
                            {{ formatDate(notification.reservation.date) }} o {{ notification.reservation.timeSlot.start }}
                          </p>
                          <p *ngIf="notification.location" class="text-xs text-stone-500 mt-1">
                            Lokal: {{ notification.location.name }}
                          </p>
                        </div>
                        
                        <div class="flex items-center gap-4 text-xs text-stone-500">
                          <span>{{ formatTime(notification.createdAt) }}</span>
                          <span *ngIf="notification.location && !notification.reservation">
                            Lokal: {{ notification.location.name }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="flex items-start gap-2 flex-shrink-0">
                        <button
                          *ngIf="!notification.isRead"
                          (click)="markAsRead(notification._id)"
                          class="px-3 py-1.5 text-xs bg-brown-100 text-brown-700 rounded-sm hover:bg-brown-200 transition-colors whitespace-nowrap"
                        >
                          Oznacz jako przeczytane
                        </button>
                        <a
                          *ngIf="notification.reservation"
                          [routerLink]="['/admin/reservations']"
                          [queryParams]="{ reservationId: notification.reservation._id }"
                          class="px-3 py-1.5 text-xs bg-stone-200 text-stone-700 rounded-sm hover:bg-stone-300 transition-colors whitespace-nowrap"
                        >
                          Zobacz rezerwację
                        </a>
                      </div>
                    </div>
                  </div>
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
}
