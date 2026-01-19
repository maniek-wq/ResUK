import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReservationService, Reservation, ReservationFilters } from '../../../core/services/reservation.service';
import { LocationService, Location } from '../../../core/services/location.service';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-warm-100 flex">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="flex-1 ml-64">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-warm-200 px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="font-display text-2xl text-stone-800 font-semibold">Rezerwacje</h1>
              <p class="text-stone-500 text-sm">Zarządzaj rezerwacjami w obu lokalach</p>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-8">
          <!-- Filters -->
          <div class="bg-white rounded-sm shadow-sm p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Lokal</label>
                <select 
                  [(ngModel)]="filters.location"
                  (change)="applyFilters()"
                  class="form-input text-sm"
                >
                  <option value="">Wszystkie lokale</option>
                  <option *ngFor="let loc of locations()" [value]="loc._id">{{ loc.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Status</label>
                <select 
                  [(ngModel)]="filters.status"
                  (change)="applyFilters()"
                  class="form-input text-sm"
                >
                  <option value="">Wszystkie statusy</option>
                  <option value="pending">Oczekujące</option>
                  <option value="confirmed">Potwierdzone</option>
                  <option value="cancelled">Anulowane</option>
                  <option value="completed">Zakończone</option>
                </select>
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Od daty</label>
                <input 
                  type="date"
                  [(ngModel)]="filters.dateFrom"
                  (change)="applyFilters()"
                  class="form-input text-sm"
                >
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Do daty</label>
                <input 
                  type="date"
                  [(ngModel)]="filters.dateTo"
                  (change)="applyFilters()"
                  class="form-input text-sm"
                >
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Typ</label>
                <select 
                  [(ngModel)]="filters.type"
                  (change)="applyFilters()"
                  class="form-input text-sm"
                >
                  <option value="">Wszystkie typy</option>
                  <option value="table">Stolik</option>
                  <option value="event">Wydarzenie</option>
                  <option value="full_venue">Cały lokal</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Reservations List -->
          <div class="bg-white rounded-sm shadow-sm overflow-hidden">
            <!-- Table Header -->
            <div class="grid grid-cols-12 gap-4 p-4 bg-warm-50 border-b border-warm-200 text-sm font-semibold text-stone-600">
              <div class="col-span-3">Klient</div>
              <div class="col-span-2">Lokal</div>
              <div class="col-span-2">Data i godzina</div>
              <div class="col-span-1">Goście</div>
              <div class="col-span-1">Typ</div>
              <div class="col-span-1">Status</div>
              <div class="col-span-2 text-right">Akcje</div>
            </div>

            <!-- Loading -->
            <div *ngIf="loading()" class="p-8 text-center">
              <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
            </div>

            <!-- No Results -->
            <div *ngIf="!loading() && reservations().length === 0" class="p-8 text-center text-stone-500">
              Brak rezerwacji spełniających kryteria
            </div>

            <!-- Reservation Rows -->
            <div *ngFor="let reservation of reservations()" 
                 class="grid grid-cols-12 gap-4 p-4 border-b border-warm-100 hover:bg-warm-50 transition-colors items-center">
              <!-- Customer -->
              <div class="col-span-3">
                <p class="font-medium text-stone-800">
                  {{ reservation.customer.firstName }} {{ reservation.customer.lastName }}
                </p>
                <p class="text-stone-500 text-sm">{{ reservation.customer.email }}</p>
                <p class="text-stone-400 text-xs">{{ reservation.customer.phone }}</p>
              </div>
              
              <!-- Location -->
              <div class="col-span-2">
                <p class="text-stone-800 text-sm">{{ reservation.location?.name || 'N/A' }}</p>
              </div>
              
              <!-- Date & Time -->
              <div class="col-span-2">
                <p class="text-stone-800 text-sm">{{ formatDate(reservation.date) }}</p>
                <p class="text-stone-500 text-sm">{{ reservation.timeSlot.start }} - {{ reservation.timeSlot.end }}</p>
              </div>
              
              <!-- Guests -->
              <div class="col-span-1">
                <p class="text-stone-800">{{ reservation.guests }}</p>
              </div>
              
              <!-- Type -->
              <div class="col-span-1">
                <span class="text-xs px-2 py-1 rounded-full"
                      [ngClass]="{
                        'bg-blue-100 text-blue-800': reservation.type === 'table',
                        'bg-purple-100 text-purple-800': reservation.type === 'event',
                        'bg-amber-100 text-amber-800': reservation.type === 'full_venue'
                      }">
                  {{ getTypeLabel(reservation.type) }}
                </span>
              </div>
              
              <!-- Status -->
              <div class="col-span-1">
                <span 
                  class="text-xs px-2 py-1 rounded-full font-medium"
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
              
              <!-- Actions -->
              <div class="col-span-2 flex justify-end gap-2">
                <button 
                  *ngIf="reservation.status === 'pending'"
                  (click)="updateStatus(reservation._id, 'confirmed')"
                  class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Potwierdź
                </button>
                <button 
                  *ngIf="reservation.status === 'pending' || reservation.status === 'confirmed'"
                  (click)="updateStatus(reservation._id, 'cancelled')"
                  class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  (click)="openEditModal(reservation)"
                  class="px-3 py-1 bg-stone-600 text-white text-xs rounded hover:bg-stone-700 transition-colors"
                >
                  Edytuj
                </button>
                <button 
                  (click)="deleteReservation(reservation._id)"
                  class="px-3 py-1 bg-stone-200 text-stone-600 text-xs rounded hover:bg-stone-300 transition-colors"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Edit Modal -->
      <div *ngIf="editingReservation()" 
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-warm-200 flex items-center justify-between">
            <h2 class="font-display text-xl text-stone-800 font-semibold">Edytuj rezerwację</h2>
            <button (click)="closeEditModal()" class="text-stone-400 hover:text-stone-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Data</label>
                <input 
                  type="date"
                  [(ngModel)]="editForm.date"
                  class="form-input text-sm"
                >
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Liczba gości</label>
                <input 
                  type="number"
                  [(ngModel)]="editForm.guests"
                  min="1"
                  class="form-input text-sm"
                >
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Godzina od</label>
                <input 
                  type="time"
                  [(ngModel)]="editForm.timeStart"
                  class="form-input text-sm"
                >
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Godzina do</label>
                <input 
                  type="time"
                  [(ngModel)]="editForm.timeEnd"
                  class="form-input text-sm"
                >
              </div>
            </div>
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Status</label>
              <select [(ngModel)]="editForm.status" class="form-input text-sm">
                <option value="pending">Oczekująca</option>
                <option value="confirmed">Potwierdzona</option>
                <option value="cancelled">Anulowana</option>
                <option value="completed">Zakończona</option>
              </select>
            </div>
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Notatki</label>
              <textarea 
                [(ngModel)]="editForm.notes"
                rows="3"
                class="form-input text-sm resize-none"
              ></textarea>
            </div>
          </div>
          <div class="p-6 border-t border-warm-200 flex justify-end gap-4">
            <button 
              (click)="closeEditModal()"
              class="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              Anuluj
            </button>
            <button 
              (click)="saveEdit()"
              class="px-6 py-2 bg-brown-700 text-white rounded-sm hover:bg-brown-800 transition-colors"
            >
              Zapisz zmiany
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminReservationsComponent implements OnInit {
  locations = signal<Location[]>([]);
  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  
  filters: ReservationFilters = {
    location: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    type: ''
  };

  editingReservation = signal<Reservation | null>(null);
  editForm = {
    date: '',
    guests: 0,
    timeStart: '',
    timeEnd: '',
    status: '',
    notes: ''
  };

  constructor(
    private reservationService: ReservationService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadLocations();
    this.applyFilters();
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe(res => {
      if (res.success) {
        this.locations.set(res.data);
      }
    });
  }

  applyFilters(): void {
    this.loading.set(true);
    const cleanFilters: ReservationFilters = {};
    
    if (this.filters.location) cleanFilters.location = this.filters.location;
    if (this.filters.status) cleanFilters.status = this.filters.status;
    if (this.filters.dateFrom) cleanFilters.dateFrom = this.filters.dateFrom;
    if (this.filters.dateTo) cleanFilters.dateTo = this.filters.dateTo;
    if (this.filters.type) cleanFilters.type = this.filters.type;

    this.reservationService.getReservations(cleanFilters).subscribe({
      next: (res) => {
        if (res.success) {
          this.reservations.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  updateStatus(id: string, status: string): void {
    this.reservationService.updateStatus(id, status).subscribe(res => {
      if (res.success) {
        this.applyFilters();
      }
    });
  }

  deleteReservation(id: string): void {
    if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
      this.reservationService.deleteReservation(id).subscribe(res => {
        if (res.success) {
          this.applyFilters();
        }
      });
    }
  }

  openEditModal(reservation: Reservation): void {
    this.editingReservation.set(reservation);
    this.editForm = {
      date: reservation.date.split('T')[0],
      guests: reservation.guests,
      timeStart: reservation.timeSlot.start,
      timeEnd: reservation.timeSlot.end,
      status: reservation.status,
      notes: reservation.notes || ''
    };
  }

  closeEditModal(): void {
    this.editingReservation.set(null);
  }

  saveEdit(): void {
    const reservation = this.editingReservation();
    if (!reservation) return;

    const updates: Partial<Reservation> = {
      date: this.editForm.date,
      guests: this.editForm.guests,
      timeSlot: {
        start: this.editForm.timeStart,
        end: this.editForm.timeEnd
      },
      status: this.editForm.status as any,
      notes: this.editForm.notes
    };

    this.reservationService.updateReservation(reservation._id, updates).subscribe(res => {
      if (res.success) {
        this.closeEditModal();
        this.applyFilters();
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Oczekująca',
      confirmed: 'Potwierdzona',
      cancelled: 'Anulowana',
      completed: 'Zakończona'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      table: 'Stolik',
      event: 'Wydarzenie',
      full_venue: 'Lokal'
    };
    return labels[type] || type;
  }
}
