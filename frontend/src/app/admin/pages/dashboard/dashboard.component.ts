import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationService, Reservation } from '../../../core/services/reservation.service';
import { LocationService, Location } from '../../../core/services/location.service';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-warm-100 flex">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="flex-1 ml-64">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-warm-200 px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="font-display text-2xl text-stone-800 font-semibold">Dashboard</h1>
              <p class="text-stone-500 text-sm">Witaj, {{ admin()?.firstName }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-stone-500 text-sm">{{ currentDate }}</span>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-8">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-sm shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-stone-500 text-sm font-medium">Dzisiejsze rezerwacje</h3>
                <div class="w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-brown-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <p class="font-display text-3xl text-stone-800 font-bold">{{ todayReservationsCount() }}</p>
              <p class="text-stone-500 text-sm mt-1">{{ todayGuests() }} gości</p>
            </div>

            <div class="bg-white p-6 rounded-sm shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-stone-500 text-sm font-medium">Oczekujące</h3>
                <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p class="font-display text-3xl text-stone-800 font-bold">{{ pendingCount() }}</p>
              <p class="text-yellow-600 text-sm mt-1">Wymaga uwagi</p>
            </div>

            <div class="bg-white p-6 rounded-sm shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-stone-500 text-sm font-medium">Potwierdzone</h3>
                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p class="font-display text-3xl text-stone-800 font-bold">{{ confirmedCount() }}</p>
              <p class="text-green-600 text-sm mt-1">W tym tygodniu</p>
            </div>

            <div class="bg-white p-6 rounded-sm shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-stone-500 text-sm font-medium">Lokale</h3>
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
              <p class="font-display text-3xl text-stone-800 font-bold">{{ locations().length }}</p>
              <p class="text-stone-500 text-sm mt-1">Aktywne lokale</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Recent Reservations -->
            <div class="bg-white rounded-sm shadow-sm">
              <div class="p-6 border-b border-warm-200 flex items-center justify-between">
                <h2 class="font-display text-lg text-stone-800 font-semibold">Ostatnie rezerwacje</h2>
                <a routerLink="/admin/reservations" class="text-brown-600 text-sm hover:text-brown-700">
                  Zobacz wszystkie →
                </a>
              </div>
              <div class="divide-y divide-warm-100">
                <div *ngFor="let reservation of recentReservations()" 
                     class="p-4 hover:bg-warm-50 transition-colors">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-stone-800">
                        {{ reservation.customer.firstName }} {{ reservation.customer.lastName }}
                      </p>
                      <p class="text-stone-500 text-sm">
                        {{ reservation.guests }} {{ reservation.guests === 1 ? 'osoba' : (reservation.guests < 5 ? 'osoby' : 'osób') }} • 
                        {{ formatDate(reservation.date) }} o {{ reservation.timeSlot.start }}
                      </p>
                    </div>
                    <span 
                      class="px-3 py-1 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': reservation.status === 'pending',
                        'bg-green-100 text-green-800': reservation.status === 'confirmed',
                        'bg-red-100 text-red-800': reservation.status === 'cancelled',
                        'bg-stone-100 text-stone-800': reservation.status === 'completed'
                      }"
                    >
                      {{ getStatusLabel(reservation.status) }}
                    </span>
                  </div>
                </div>
                <div *ngIf="recentReservations().length === 0" class="p-8 text-center text-stone-500">
                  Brak rezerwacji do wyświetlenia
                </div>
              </div>
            </div>

            <!-- Locations Overview -->
            <div class="bg-white rounded-sm shadow-sm">
              <div class="p-6 border-b border-warm-200">
                <h2 class="font-display text-lg text-stone-800 font-semibold">Lokale</h2>
              </div>
              <div class="divide-y divide-warm-100">
                <div *ngFor="let location of locations()" class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-medium text-stone-800">{{ location.name }}</h3>
                    <span class="text-brown-600 text-sm">{{ getLocationReservations(location._id) }} rezerwacji</span>
                  </div>
                  <p class="text-stone-500 text-sm">{{ location.address.street }}, {{ location.address.city }}</p>
                  <div class="mt-2 flex items-center gap-4 text-xs text-stone-500">
                    <span>{{ location.totalTables }} stolików</span>
                    <span>Max {{ location.maxCapacity }} osób</span>
                  </div>
                </div>
                <div *ngIf="locations().length === 0" class="p-8 text-center text-stone-500">
                  Brak lokali
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  admin = computed(() => this.authService.admin());
  locations = signal<Location[]>([]);
  reservations = signal<Reservation[]>([]);
  
  currentDate = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  todayReservationsCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.reservations().filter(r => 
      r.date.startsWith(today) && r.status !== 'cancelled'
    ).length;
  });

  todayGuests = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.reservations()
      .filter(r => r.date.startsWith(today) && r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.guests, 0);
  });

  pendingCount = computed(() => 
    this.reservations().filter(r => r.status === 'pending').length
  );

  confirmedCount = computed(() => 
    this.reservations().filter(r => r.status === 'confirmed').length
  );

  recentReservations = computed(() => 
    this.reservations()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.locationService.getLocations().subscribe(res => {
      if (res.success) {
        this.locations.set(res.data);
      }
    });

    this.reservationService.getReservations().subscribe(res => {
      if (res.success) {
        this.reservations.set(res.data);
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short'
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Oczekuje',
      confirmed: 'Potwierdzona',
      cancelled: 'Anulowana',
      completed: 'Zakończona'
    };
    return labels[status] || status;
  }

  getLocationReservations(locationId: string): number {
    const today = new Date();
    return this.reservations().filter(r => {
      const resDate = new Date(r.date);
      return r.location._id === locationId && 
             resDate >= today && 
             r.status !== 'cancelled';
    }).length;
  }
}
