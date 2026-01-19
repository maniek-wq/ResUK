import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { LocationService, Location, Table } from '../../core/services/location.service';
import { ReservationService, AvailabilitySlot, CreateReservationDto } from '../../core/services/reservation.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <!-- Hero -->
    <section class="relative h-[40vh] min-h-[350px] flex items-center justify-center">
      <div class="absolute inset-0 bg-stone-900">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] 
                    bg-cover bg-center opacity-40"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/60"></div>
      </div>
      
      <div class="relative z-10 text-center px-6">
        <span class="font-accent text-brown-400 text-lg tracking-wider mb-4 block">Zarezerwuj</span>
        <h1 class="font-display text-5xl md:text-6xl text-warm-100 font-bold">
          Stolik
        </h1>
        <div class="w-24 h-0.5 bg-gradient-to-r from-transparent via-brown-500 to-transparent mx-auto mt-6"></div>
      </div>
    </section>

    <!-- Reservation Form -->
    <section class="py-20 bg-warm-50">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto">
          
          <!-- Progress Steps -->
          <div class="flex items-center justify-center mb-12">
            <div *ngFor="let step of steps; let i = index; let last = last" 
                 class="flex items-center">
              <div 
                class="flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300"
                [class]="currentStep() >= i + 1 
                         ? 'bg-brown-700 text-white' 
                         : 'bg-warm-200 text-stone-500'"
              >
                {{ i + 1 }}
              </div>
              <span 
                class="hidden sm:block mx-3 text-sm"
                [class]="currentStep() >= i + 1 ? 'text-brown-700' : 'text-stone-400'"
              >
                {{ step }}
              </span>
              <div *ngIf="!last" 
                   class="w-12 sm:w-20 h-0.5 mx-2"
                   [class]="currentStep() > i + 1 ? 'bg-brown-700' : 'bg-warm-200'">
              </div>
            </div>
          </div>

          <div class="bg-white rounded-sm shadow-lg p-8 md:p-12">
            
            <!-- Step 1: Location & Type -->
            <div *ngIf="currentStep() === 1" class="animate-fade-in">
              <h2 class="font-display text-2xl text-stone-800 font-semibold mb-6">
                Wybierz lokal i typ rezerwacji
              </h2>

              <!-- Location Selection -->
              <div class="mb-8">
                <label class="block text-stone-700 text-sm font-semibold mb-4">Lokal</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    *ngFor="let loc of locations()"
                    (click)="selectLocation(loc)"
                    class="p-6 border-2 rounded-sm text-left transition-all duration-300"
                    [class]="selectedLocation()?._id === loc._id 
                             ? 'border-brown-700 bg-brown-50' 
                             : 'border-warm-200 hover:border-brown-400'"
                  >
                    <h3 class="font-semibold text-stone-800 mb-1">{{ loc.name }}</h3>
                    <p class="text-stone-600 text-sm">{{ loc.address.street }}</p>
                    <p class="text-stone-500 text-sm">{{ loc.address.postalCode }} {{ loc.address.city }}</p>
                  </button>
                </div>
              </div>

              <!-- Reservation Type -->
              <div class="mb-8">
                <label class="block text-stone-700 text-sm font-semibold mb-4">Typ rezerwacji</label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    (click)="reservationType.set('table')"
                    class="p-4 border-2 rounded-sm text-center transition-all duration-300"
                    [class]="reservationType() === 'table' 
                             ? 'border-brown-700 bg-brown-50' 
                             : 'border-warm-200 hover:border-brown-400'"
                  >
                    <svg class="w-8 h-8 mx-auto mb-2 text-brown-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    <span class="text-sm font-medium">Stolik</span>
                  </button>
                  <button 
                    (click)="reservationType.set('event')"
                    class="p-4 border-2 rounded-sm text-center transition-all duration-300"
                    [class]="reservationType() === 'event' 
                             ? 'border-brown-700 bg-brown-50' 
                             : 'border-warm-200 hover:border-brown-400'"
                  >
                    <svg class="w-8 h-8 mx-auto mb-2 text-brown-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                            d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"/>
                    </svg>
                    <span class="text-sm font-medium">Wydarzenie</span>
                  </button>
                  <button 
                    (click)="reservationType.set('full_venue')"
                    class="p-4 border-2 rounded-sm text-center transition-all duration-300"
                    [class]="reservationType() === 'full_venue' 
                             ? 'border-brown-700 bg-brown-50' 
                             : 'border-warm-200 hover:border-brown-400'"
                  >
                    <svg class="w-8 h-8 mx-auto mb-2 text-brown-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <span class="text-sm font-medium">Cały lokal</span>
                  </button>
                </div>
              </div>

              <button 
                (click)="nextStep()"
                [disabled]="!selectedLocation() || !reservationType()"
                class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dalej
              </button>
            </div>

            <!-- Step 2: Date & Time -->
            <div *ngIf="currentStep() === 2" class="animate-fade-in">
              <h2 class="font-display text-2xl text-stone-800 font-semibold mb-6">
                Wybierz datę i godzinę
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">Data</label>
                  <input 
                    type="date"
                    [(ngModel)]="selectedDate"
                    (change)="onDateChange()"
                    [min]="minDate"
                    class="form-input"
                  >
                </div>
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">Liczba gości</label>
                  <select [(ngModel)]="guestCount" class="form-input">
                    <option *ngFor="let n of guestOptions" [value]="n">{{ n }} {{ n === 1 ? 'osoba' : (n < 5 ? 'osoby' : 'osób') }}</option>
                  </select>
                </div>
              </div>

              <!-- Available Time Slots -->
              <div class="mb-6">
                <label class="block text-stone-700 text-sm font-semibold mb-4">Dostępne godziny</label>
                
                <div *ngIf="loadingSlots()" class="text-center py-8">
                  <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
                  <p class="text-stone-500 mt-2">Sprawdzanie dostępności...</p>
                </div>

                <div *ngIf="!loadingSlots() && availableSlots().length === 0" class="text-center py-8 text-stone-500">
                  Wybierz datę, aby zobaczyć dostępne godziny.
                </div>

                <div *ngIf="!loadingSlots() && availableSlots().length > 0" class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <button 
                    *ngFor="let slot of availableSlots()"
                    (click)="selectTimeSlot(slot)"
                    [disabled]="!slot.available"
                    class="py-3 px-4 text-sm rounded-sm border transition-all duration-300"
                    [class]="selectedTimeSlot()?.time === slot.time 
                             ? 'border-brown-700 bg-brown-700 text-white' 
                             : slot.available 
                               ? 'border-warm-200 hover:border-brown-400' 
                               : 'border-warm-100 bg-warm-100 text-stone-400 cursor-not-allowed'"
                  >
                    {{ slot.time }}
                  </button>
                </div>
              </div>

              <div class="flex gap-4">
                <button (click)="prevStep()" class="btn-outline flex-1">
                  Wstecz
                </button>
                <button 
                  (click)="nextStep()"
                  [disabled]="!selectedDate || !selectedTimeSlot()"
                  class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dalej
                </button>
              </div>
            </div>

            <!-- Step 3: Customer Details -->
            <div *ngIf="currentStep() === 3" class="animate-fade-in">
              <h2 class="font-display text-2xl text-stone-800 font-semibold mb-6">
                Twoje dane
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">Imię *</label>
                  <input 
                    type="text"
                    [(ngModel)]="customerData.firstName"
                    class="form-input"
                    placeholder="Jan"
                  >
                </div>
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">Nazwisko *</label>
                  <input 
                    type="text"
                    [(ngModel)]="customerData.lastName"
                    class="form-input"
                    placeholder="Kowalski"
                  >
                </div>
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">Email *</label>
                  <input 
                    type="email"
                    [(ngModel)]="customerData.email"
                    class="form-input"
                    placeholder="jan@example.com"
                  >
                </div>
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">Telefon *</label>
                  <input 
                    type="tel"
                    [(ngModel)]="customerData.phone"
                    class="form-input"
                    placeholder="+48 123 456 789"
                  >
                </div>
              </div>

              <!-- Event Details (if event or full_venue) -->
              <div *ngIf="reservationType() !== 'table'" class="mb-6">
                <h3 class="font-display text-lg text-stone-800 font-semibold mb-4">Szczegóły wydarzenia</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-stone-700 text-sm font-semibold mb-2">Nazwa wydarzenia</label>
                    <input 
                      type="text"
                      [(ngModel)]="eventData.name"
                      class="form-input"
                      placeholder="np. Urodziny, Spotkanie firmowe"
                    >
                  </div>
                  <div>
                    <label class="block text-stone-700 text-sm font-semibold mb-2">Opis / Specjalne wymagania</label>
                    <textarea 
                      [(ngModel)]="eventData.specialRequirements"
                      rows="3"
                      class="form-input resize-none"
                      placeholder="Opisz swoje oczekiwania..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div class="mb-6">
                <label class="block text-stone-700 text-sm font-semibold mb-2">Dodatkowe uwagi</label>
                <textarea 
                  [(ngModel)]="notes"
                  rows="3"
                  class="form-input resize-none"
                  placeholder="Alergie, preferencje miejsca, okazja..."
                ></textarea>
              </div>

              <div class="flex gap-4">
                <button (click)="prevStep()" class="btn-outline flex-1">
                  Wstecz
                </button>
                <button 
                  (click)="nextStep()"
                  [disabled]="!isCustomerDataValid()"
                  class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dalej
                </button>
              </div>
            </div>

            <!-- Step 4: Confirmation -->
            <div *ngIf="currentStep() === 4" class="animate-fade-in">
              <h2 class="font-display text-2xl text-stone-800 font-semibold mb-6">
                Potwierdzenie rezerwacji
              </h2>

              <!-- Summary -->
              <div class="bg-warm-100 rounded-sm p-6 mb-6">
                <h3 class="font-semibold text-stone-800 mb-4">Podsumowanie</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-stone-500">Lokal:</span>
                    <span class="text-stone-800 font-medium">{{ selectedLocation()?.name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-500">Typ:</span>
                    <span class="text-stone-800 font-medium">{{ getReservationTypeLabel() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-500">Data:</span>
                    <span class="text-stone-800 font-medium">{{ formatDate(selectedDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-500">Godzina:</span>
                    <span class="text-stone-800 font-medium">{{ selectedTimeSlot()?.time }} - {{ getEndTime() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-500">Liczba gości:</span>
                    <span class="text-stone-800 font-medium">{{ guestCount }}</span>
                  </div>
                  <div class="border-t border-warm-200 my-3"></div>
                  <div class="flex justify-between">
                    <span class="text-stone-500">Imię i nazwisko:</span>
                    <span class="text-stone-800 font-medium">{{ customerData.firstName }} {{ customerData.lastName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-500">Email:</span>
                    <span class="text-stone-800 font-medium">{{ customerData.email }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-500">Telefon:</span>
                    <span class="text-stone-800 font-medium">{{ customerData.phone }}</span>
                  </div>
                </div>
              </div>

              <p class="text-stone-500 text-sm mb-6">
                Po złożeniu rezerwacji otrzymasz email z potwierdzeniem. 
                Nasz zespół skontaktuje się z Tobą w celu ostatecznego potwierdzenia.
              </p>

              <div class="flex gap-4">
                <button (click)="prevStep()" class="btn-outline flex-1">
                  Wstecz
                </button>
                <button 
                  (click)="submitReservation()"
                  [disabled]="isSubmitting()"
                  class="btn-primary flex-1 disabled:opacity-50"
                >
                  <span *ngIf="!isSubmitting()">Złóż rezerwację</span>
                  <span *ngIf="isSubmitting()">Wysyłanie...</span>
                </button>
              </div>
            </div>

            <!-- Success -->
            <div *ngIf="currentStep() === 5" class="animate-fade-in text-center py-8">
              <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 class="font-display text-3xl text-stone-800 font-semibold mb-4">
                Dziękujemy!
              </h2>
              <p class="text-stone-600 mb-8 max-w-md mx-auto">
                Twoja rezerwacja została złożona pomyślnie. 
                Wysłaliśmy potwierdzenie na adres {{ customerData.email }}.
              </p>
              <a routerLink="/" class="btn-primary">
                Powrót do strony głównej
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>

    <app-footer></app-footer>
  `
})
export class ReservationComponent implements OnInit {
  steps = ['Lokal', 'Data i godzina', 'Dane', 'Potwierdzenie'];
  currentStep = signal(1);
  
  locations = signal<Location[]>([]);
  selectedLocation = signal<Location | null>(null);
  reservationType = signal<'table' | 'event' | 'full_venue'>('table');
  
  selectedDate = '';
  minDate = '';
  guestCount = 2;
  guestOptions = Array.from({ length: 20 }, (_, i) => i + 1);
  
  availableSlots = signal<AvailabilitySlot[]>([]);
  loadingSlots = signal(false);
  selectedTimeSlot = signal<AvailabilitySlot | null>(null);
  
  customerData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };
  
  eventData = {
    name: '',
    specialRequirements: ''
  };
  
  notes = '';
  isSubmitting = signal(false);

  constructor(
    private locationService: LocationService,
    private reservationService: ReservationService,
    private route: ActivatedRoute
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.locationService.getLocations().subscribe(res => {
      if (res.success) {
        this.locations.set(res.data);
        
        // Check for location query param
        this.route.queryParams.subscribe(params => {
          if (params['location']) {
            const loc = res.data.find(l => 
              l.name.toLowerCase().includes(params['location'].toLowerCase())
            );
            if (loc) {
              this.selectLocation(loc);
            }
          }
        });
      }
    });
  }

  selectLocation(location: Location): void {
    this.selectedLocation.set(location);
  }

  nextStep(): void {
    if (this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onDateChange(): void {
    if (this.selectedDate && this.selectedLocation()) {
      this.loadingSlots.set(true);
      this.selectedTimeSlot.set(null);
      
      this.reservationService.getAvailability(
        this.selectedLocation()!._id,
        this.selectedDate,
        this.guestCount
      ).subscribe({
        next: (res) => {
          if (res.success) {
            this.availableSlots.set(res.data.slots);
          }
          this.loadingSlots.set(false);
        },
        error: () => {
          this.loadingSlots.set(false);
        }
      });
    }
  }

  selectTimeSlot(slot: AvailabilitySlot): void {
    if (slot.available) {
      this.selectedTimeSlot.set(slot);
    }
  }

  isCustomerDataValid(): boolean {
    return !!(
      this.customerData.firstName &&
      this.customerData.lastName &&
      this.customerData.email &&
      this.customerData.phone
    );
  }

  getReservationTypeLabel(): string {
    const labels: Record<string, string> = {
      'table': 'Rezerwacja stolika',
      'event': 'Wydarzenie',
      'full_venue': 'Wynajem całego lokalu'
    };
    return labels[this.reservationType()] || '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getEndTime(): string {
    if (!this.selectedTimeSlot()) return '';
    const [hours, minutes] = this.selectedTimeSlot()!.time.split(':').map(Number);
    const endHours = hours + 2; // Default 2 hours
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  submitReservation(): void {
    if (!this.selectedLocation() || !this.selectedTimeSlot()) return;
    
    this.isSubmitting.set(true);
    
    const reservation: CreateReservationDto = {
      location: this.selectedLocation()!._id,
      type: this.reservationType(),
      customer: this.customerData,
      date: this.selectedDate,
      timeSlot: {
        start: this.selectedTimeSlot()!.time,
        end: this.getEndTime()
      },
      guests: this.guestCount,
      notes: this.notes
    };
    
    if (this.reservationType() !== 'table') {
      reservation.eventDetails = {
        name: this.eventData.name,
        specialRequirements: this.eventData.specialRequirements
      };
    }
    
    this.reservationService.createReservation(reservation).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.currentStep.set(5);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        // Handle error
      }
    });
  }
}
