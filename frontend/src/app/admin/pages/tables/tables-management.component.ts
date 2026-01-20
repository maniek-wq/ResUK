import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { LocationService, Table, Location } from '../../../core/services/location.service';
import { ApiService } from '../../../core/services/api.service';
import { ReservationService, CreateReservationDto } from '../../../core/services/reservation.service';
import { firstValueFrom } from 'rxjs';

interface AvailabilityResponse {
  success: boolean;
  data: {
    location: string;
    date: string;
    time: string;
    guests: number;
    availableTables: Table[];
    suitableTables: Table[];
    statistics: {
      total: number;
      available: number;
      occupied: number;
      totalSeats: number;
      suitable: number;
    };
    reservations: any[];
  };
}

@Component({
  selector: 'app-tables-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-warm-100 flex">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="flex-1 md:ml-64">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-warm-200 px-4 md:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Hamburger button (mobile only) -->
              <button 
                (click)="sidebarService.toggle()"
                class="md:hidden p-2 text-stone-600 hover:text-stone-800 hover:bg-warm-50 rounded-sm transition-colors flex-shrink-0"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <div>
                <h1 class="font-display text-xl md:text-2xl text-stone-800 font-semibold">Sprawdzanie Dostępności</h1>
                <p class="text-stone-500 text-sm hidden md:block">Sprawdź dostępność stolików dla rezerwacji telefonicznej</p>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 md:p-8">
          <!-- Search Form -->
          <div class="bg-white rounded-sm shadow-sm p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Lokal *</label>
                <select 
                  [(ngModel)]="selectedLocationId"
                  (change)="onLocationChange()"
                  class="form-input text-sm"
                  required
                >
                  <option value="">Wybierz lokal</option>
                  <option *ngFor="let loc of locations()" [value]="loc._id">
                    {{ loc.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Liczba gości *</label>
                <input 
                  type="number"
                  [ngModel]="guests()"
                  (ngModelChange)="guests.set($event)"
                  min="1"
                  max="50"
                  class="form-input text-sm"
                  placeholder="np. 5"
                  required
                >
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Data *</label>
                <input 
                  type="date"
                  [(ngModel)]="selectedDate"
                  (change)="onDateChange()"
                  [min]="today"
                  class="form-input text-sm"
                  required
                >
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Godzina *</label>
                <select 
                  [(ngModel)]="selectedTime"
                  class="form-input text-sm"
                  required
                >
                  <option value="">Wybierz godzinę</option>
                  <option *ngFor="let time of timeSlots" [value]="time">
                    {{ time }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex justify-end">
              <button 
                (click)="checkAvailability()"
                [disabled]="!canCheckAvailability() || loading()"
                class="btn-primary text-sm px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!loading()">Sprawdź dostępność</span>
                <span *ngIf="loading()">Sprawdzanie...</span>
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="loading()" class="text-center py-20">
            <div class="inline-block w-12 h-12 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin mb-4"></div>
            <p class="text-stone-600">Sprawdzanie dostępności...</p>
          </div>

          <!-- Results -->
          <div *ngIf="!loading() && availability()" class="space-y-6">
            <!-- Summary Card -->
            <div class="bg-white rounded-sm shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="font-display text-xl text-stone-800 font-semibold">
                  Wynik sprawdzenia
                </h2>
                <button 
                  *ngIf="availability()!.data.statistics.available > 0"
                  (click)="openReservationModal()"
                  class="btn-primary text-sm px-6"
                >
                  Złóż rezerwację
                </button>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="text-center p-4 bg-warm-50 rounded-sm">
                  <p class="text-stone-500 text-sm mb-1">Data</p>
                  <p class="font-semibold text-stone-800">{{ formatDate(availability()!.data.date) }}</p>
                </div>
                <div class="text-center p-4 bg-warm-50 rounded-sm">
                  <p class="text-stone-500 text-sm mb-1">Godzina</p>
                  <p class="font-semibold text-stone-800">{{ availability()!.data.time }}</p>
                </div>
                <div class="text-center p-4 bg-warm-50 rounded-sm">
                  <p class="text-stone-500 text-sm mb-1">Goście</p>
                  <p class="font-semibold text-stone-800">{{ availability()!.data.guests }}</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-sm">
                  <p class="text-green-600 text-sm mb-1">Dostępne</p>
                  <p class="font-semibold text-green-800 text-xl">{{ availability()!.data.statistics.available }}</p>
                  <p class="text-xs text-green-600">stolików</p>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-sm">
                  <p class="text-red-600 text-sm mb-1">Zajęte</p>
                  <p class="font-semibold text-red-800 text-xl">{{ availability()!.data.statistics.occupied }}</p>
                  <p class="text-xs text-red-600">stolików</p>
                </div>
              </div>
            </div>

            <!-- Occupied Tables Info -->
            <div *ngIf="availability()!.data.reservations.length > 0" class="bg-white rounded-sm shadow-sm p-6">
              <h3 class="font-display text-lg text-stone-800 font-semibold mb-4">
                Zajęte stoliki w tym czasie ({{ availability()!.data.reservations.length }} rezerwacji)
              </h3>
              <div class="space-y-2">
                <div 
                  *ngFor="let reservation of availability()!.data.reservations"
                  class="p-3 bg-red-50 border border-red-200 rounded-sm"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-stone-800 text-sm">
                        {{ reservation.customer.firstName }} {{ reservation.customer.lastName }}
                      </p>
                      <p class="text-stone-600 text-xs">
                        {{ reservation.timeSlot.start }} - {{ reservation.timeSlot.end }} • {{ reservation.guests }} gości
                      </p>
                    </div>
                    <span 
                      class="px-2 py-1 text-xs rounded-full"
                      [class]="{
                        'bg-yellow-100 text-yellow-800': reservation.status === 'pending',
                        'bg-green-100 text-green-800': reservation.status === 'confirmed'
                      }"
                    >
                      {{ reservation.status === 'pending' ? 'Oczekująca' : 'Potwierdzona' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Available Tables -->
            <div class="bg-white rounded-sm shadow-sm overflow-hidden">
              <div class="p-6 border-b border-warm-200 bg-warm-50">
                <h3 class="font-display text-lg text-stone-800 font-semibold">
                  Dostępne stoliki ({{ availability()!.data.availableTables.length }})
                </h3>
                <p class="text-stone-500 text-sm mt-1">
                  Stoliki odpowiednie dla {{ availability()!.data.guests }} gości
                </p>
              </div>
              
              <div *ngIf="availability()!.data.availableTables.length === 0" class="p-8 text-center text-stone-500">
                <p class="mb-2">❌ Brak dostępnych stolików</p>
                <p class="text-sm">Spróbuj wybrać inną datę lub godzinę</p>
              </div>

              <div *ngIf="availability()!.data.availableTables.length > 0" class="p-6">
                <!-- Suitable Tables (idealne) -->
                <div *ngIf="availability()!.data.suitableTables.length > 0" class="mb-6">
                  <h4 class="font-semibold text-green-700 text-sm mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    Idealne stoliki ({{ availability()!.data.suitableTables.length }})
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div 
                      *ngFor="let table of availability()!.data.suitableTables"
                      class="p-4 border-2 border-green-300 bg-green-50 rounded-sm"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <h5 class="font-semibold text-stone-800">Stolik #{{ table.tableNumber }}</h5>
                        <span class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                          {{ table.seats }} miejsc
                        </span>
                      </div>
                      <p class="text-stone-600 text-sm">{{ getZoneLabel(table.zone) }}</p>
                      <p *ngIf="table.description" class="text-stone-500 text-xs mt-1">{{ table.description }}</p>
                    </div>
                  </div>
                </div>

                <!-- Other Available Tables -->
                <div *ngIf="getOtherAvailableTables().length > 0">
                  <h4 class="font-semibold text-stone-700 text-sm mb-3">Pozostałe dostępne stoliki ({{ getOtherAvailableTables().length }})</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div 
                      *ngFor="let table of getOtherAvailableTables()"
                      class="p-4 border border-warm-200 bg-warm-50 rounded-sm"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <h5 class="font-semibold text-stone-800">Stolik #{{ table.tableNumber }}</h5>
                        <span class="px-2 py-1 bg-stone-200 text-stone-800 text-xs rounded-full">
                          {{ table.seats }} miejsc
                        </span>
                      </div>
                      <p class="text-stone-600 text-sm">{{ getZoneLabel(table.zone) }}</p>
                      <p *ngIf="table.description" class="text-stone-500 text-xs mt-1">{{ table.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results / Initial State -->
          <div *ngIf="!loading() && !availability()" class="text-center py-20 text-stone-500">
            <p class="mb-4">Wypełnij formularz i kliknij "Sprawdź dostępność"</p>
            <p class="text-sm">System pokaże dostępne stoliki dla wybranej daty, godziny i liczby gości</p>
          </div>
        </main>
      </div>

      <!-- Reservation Modal -->
      <div *ngIf="showReservationModal()" 
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-warm-200 flex items-center justify-between">
            <h2 class="font-display text-xl text-stone-800 font-semibold">Złóż rezerwację</h2>
            <button (click)="closeReservationModal()" class="text-stone-400 hover:text-stone-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <!-- Pre-filled Info (readonly) -->
            <div class="bg-warm-50 p-4 rounded-sm border border-warm-200">
              <h3 class="font-semibold text-stone-800 mb-2 text-sm">Szczegóły rezerwacji</h3>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-stone-500">Lokal:</span>
                  <span class="font-medium text-stone-800 ml-2">{{ getLocationName() }}</span>
                </div>
                <div>
                  <span class="text-stone-500">Data:</span>
                  <span class="font-medium text-stone-800 ml-2">{{ newReservation.date }}</span>
                </div>
                <div>
                  <span class="text-stone-500">Godzina:</span>
                  <span class="font-medium text-stone-800 ml-2">{{ newReservation.timeSlot.start }} - {{ calculateEndTimeFromStart() }}</span>
                </div>
                <div>
                  <span class="text-stone-500">Goście:</span>
                  <span class="font-medium text-stone-800 ml-2">{{ newReservation.guests }}</span>
                </div>
              </div>
            </div>

            <!-- Customer Details -->
            <div>
              <h3 class="font-semibold text-stone-800 mb-4">Dane klienta</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-stone-600 text-sm font-medium mb-2">Imię *</label>
                  <input 
                    type="text"
                    [(ngModel)]="newReservation.customer.firstName"
                    class="form-input text-sm"
                    placeholder="Jan"
                    required
                  >
                </div>
                <div>
                  <label class="block text-stone-600 text-sm font-medium mb-2">Nazwisko *</label>
                  <input 
                    type="text"
                    [(ngModel)]="newReservation.customer.lastName"
                    class="form-input text-sm"
                    placeholder="Kowalski"
                    required
                  >
                </div>
                <div>
                  <label class="block text-stone-600 text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email"
                    [(ngModel)]="newReservation.customer.email"
                    class="form-input text-sm"
                    placeholder="jan@example.com (opcjonalnie)"
                  >
                </div>
                <div>
                  <label class="block text-stone-600 text-sm font-medium mb-2">Telefon *</label>
                  <input 
                    type="tel"
                    [(ngModel)]="newReservation.customer.phone"
                    class="form-input text-sm"
                    placeholder="+48 123 456 789"
                    required
                  >
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Notatki (dla personelu)</label>
              <textarea 
                [(ngModel)]="newReservation.notes"
                rows="3"
                class="form-input text-sm resize-none"
                placeholder="Dodatkowe informacje..."
              ></textarea>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Status *</label>
              <select [(ngModel)]="newReservation.status" class="form-input text-sm" required>
                <option value="pending">Oczekująca</option>
                <option value="confirmed">Potwierdzona</option>
              </select>
            </div>

            <!-- Error Message -->
            <div *ngIf="reservationErrorMessage()" class="p-4 bg-red-50 border border-red-200 rounded-sm">
              <p class="text-red-700 text-sm">{{ reservationErrorMessage() }}</p>
            </div>
          </div>
          <div class="p-6 border-t border-warm-200 flex justify-end gap-4">
            <button 
              (click)="closeReservationModal()"
              class="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              Anuluj
            </button>
            <button 
              (click)="saveReservation()"
              [disabled]="!canSaveReservation() || savingReservation()"
              class="px-6 py-2 bg-brown-700 text-white rounded-sm hover:bg-brown-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!savingReservation()">Złóż rezerwację</span>
              <span *ngIf="savingReservation()">Zapisywanie...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TablesManagementComponent implements OnInit {
  locations = signal<Location[]>([]);
  loading = signal(false);
  availability = signal<AvailabilityResponse | null>(null);
  
  selectedLocationId = signal<string>('');
  guests = signal<number>(4);
  selectedDate = signal<string>('');
  selectedTime = signal<string>('');

  timeSlots: string[] = [];
  today = new Date().toISOString().split('T')[0];

  showReservationModal = signal(false);
  savingReservation = signal(false);
  reservationErrorMessage = signal('');

  newReservation: CreateReservationDto & { 
    status?: 'pending' | 'confirmed';
    notes?: string;
  } = {
    location: '',
    type: 'table',
    customer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    date: '',
    timeSlot: {
      start: '',
      end: ''
    },
    guests: 1,
    status: 'pending',
    notes: ''
  };

  constructor(
    private locationService: LocationService,
    private api: ApiService,
    private reservationService: ReservationService,
    public sidebarService: SidebarService
  ) {
    // Generuj sloty czasowe (co 30 minut od 10:00 do 22:00)
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  generateTimeSlots(): void {
    const slots: string[] = [];
    for (let hour = 10; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    this.timeSlots = slots;
  }

  async loadLocations(): Promise<void> {
    try {
      const res = await firstValueFrom(this.locationService.getLocations());
      if (res.success) {
        this.locations.set(res.data.filter(loc => loc.isActive));
      }
    } catch (error) {
      console.error('Błąd pobierania lokali:', error);
    }
  }

  onLocationChange(): void {
    this.availability.set(null);
  }

  onDateChange(): void {
    this.availability.set(null);
    this.selectedTime.set('');
  }

  canCheckAvailability(): boolean {
    const guests = this.guests();
    return !!(this.selectedLocationId() && this.selectedDate() && this.selectedTime() && guests && guests > 0);
  }

  async checkAvailability(): Promise<void> {
    if (!this.canCheckAvailability()) return;

    this.loading.set(true);
    try {
      const guests = this.guests();
      const params = {
        location: this.selectedLocationId(),
        date: this.selectedDate(),
        time: this.selectedTime(),
        guests: guests ? guests.toString() : '1'
      };
      
      const res = await firstValueFrom(
        this.api.get<AvailabilityResponse>('/tables/availability', params)
      );
      
      if (res.success) {
        this.availability.set(res);
      }
    } catch (error: any) {
      console.error('Błąd sprawdzania dostępności:', error);
      alert(error?.error?.message || 'Błąd sprawdzania dostępności');
    } finally {
      this.loading.set(false);
    }
  }

  getOtherAvailableTables(): Table[] {
    const avail = this.availability();
    if (!avail) return [];
    
    const suitableIds = new Set(avail.data.suitableTables.map(t => t._id));
    return avail.data.availableTables.filter(t => !suitableIds.has(t._id));
  }

  getZoneLabel(zone: string): string {
    const labels: Record<string, string> = {
      'sala_glowna': 'Sala główna',
      'ogrodek': 'Ogródek',
      'vip': 'VIP',
      'bar': 'Bar'
    };
    return labels[zone] || zone;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getLocationName(): string {
    const location = this.locations().find(l => l._id === this.selectedLocationId());
    return location?.name || '';
  }

  openReservationModal(): void {
    const avail = this.availability();
    if (!avail) return;

    // Pre-wypełnij dane z formularza sprawdzania dostępności
    this.newReservation = {
      location: this.selectedLocationId(),
      type: 'table',
      customer: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      date: this.selectedDate(),
      timeSlot: {
        start: this.selectedTime(),
        end: this.calculateEndTimeFromStart()
      },
      guests: this.guests(),
      status: 'pending',
      notes: ''
    };

    this.showReservationModal.set(true);
    this.reservationErrorMessage.set('');
  }

  closeReservationModal(): void {
    this.showReservationModal.set(false);
    this.reservationErrorMessage.set('');
  }

  calculateEndTimeFromStart(): string {
    if (!this.selectedTime()) return '';

    const [hours, minutes] = this.selectedTime().split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    // Dodaj 2 godziny (standardowy czas rezerwacji)
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    // Formatuj jako HH:MM
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    return `${endHours}:${endMinutes}`;
  }

  canSaveReservation(): boolean {
    return !!(
      this.newReservation.location &&
      this.newReservation.date &&
      this.newReservation.timeSlot.start &&
      this.newReservation.timeSlot.end &&
      this.newReservation.guests > 0 &&
      this.newReservation.customer.firstName &&
      this.newReservation.customer.lastName &&
      this.newReservation.customer.phone &&
      this.newReservation.status
    );
  }

  async saveReservation(): Promise<void> {
    if (!this.canSaveReservation()) return;

    this.savingReservation.set(true);
    this.reservationErrorMessage.set('');

    try {
      // Przygotuj datę w formacie ISO8601
      const dateObj = new Date(this.newReservation.date);
      const isoDate = dateObj.toISOString();

      // Przygotuj dane do wysłania
      const reservationData: any = {
        location: this.newReservation.location,
        type: this.newReservation.type,
        customer: {
          firstName: this.newReservation.customer.firstName.trim(),
          lastName: this.newReservation.customer.lastName.trim(),
          phone: this.newReservation.customer.phone.trim()
        },
        date: isoDate,
        timeSlot: {
          start: this.newReservation.timeSlot.start,
          end: this.newReservation.timeSlot.end
        },
        guests: this.newReservation.guests
      };

      // Dodaj opcjonalne pola
      if (this.newReservation.status) {
        reservationData.status = this.newReservation.status;
      }
      if (this.newReservation.notes && this.newReservation.notes.trim()) {
        reservationData.notes = this.newReservation.notes.trim();
      }
      // Email jest opcjonalny
      if (this.newReservation.customer.email && this.newReservation.customer.email.trim()) {
        reservationData.customer.email = this.newReservation.customer.email.trim().toLowerCase();
      }

      console.log('Wysyłane dane rezerwacji:', reservationData);

      const res = await firstValueFrom(
        this.reservationService.createReservation(reservationData)
      );

      if (res.success) {
        // Odśwież dostępność
        await this.checkAvailability();
        // Zamknij modal
        this.closeReservationModal();
      }
    } catch (error: any) {
      console.error('Błąd dodawania rezerwacji:', error);
      
      // Wyświetl szczegółowe błędy walidacji
      if (error?.error?.errors && Array.isArray(error.error.errors)) {
        const errorMessages = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        this.reservationErrorMessage.set(`Błędy walidacji: ${errorMessages}`);
      } else {
        this.reservationErrorMessage.set(
          error?.error?.message || 'Błąd dodawania rezerwacji. Sprawdź dane i spróbuj ponownie.'
        );
      }
    } finally {
      this.savingReservation.set(false);
    }
  }
}
