import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReservationService, Reservation, ReservationFilters, CreateReservationDto, AvailabilitySlot } from '../../../core/services/reservation.service';
import { LocationService, Location } from '../../../core/services/location.service';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
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
                <h1 class="font-display text-xl md:text-2xl text-stone-800 font-semibold">Rezerwacje</h1>
                <p class="text-stone-500 text-sm hidden md:block">Zarządzaj rezerwacjami w obu lokalach</p>
              </div>
            </div>
            <button 
              (click)="openAddModal()"
              class="btn-primary text-sm px-4 md:px-6 flex-shrink-0 whitespace-nowrap"
            >
              <span class="hidden md:inline">+ Dodaj rezerwację</span>
              <span class="md:hidden">+ Dodaj</span>
            </button>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 md:p-8">
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
            <!-- Table Header (Desktop only) -->
            <div class="hidden md:grid grid-cols-12 gap-4 p-4 bg-warm-50 border-b border-warm-200 text-sm font-semibold text-stone-600">
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

            <!-- Mobile Card Layout -->
            <div *ngIf="!loading() && reservations().length > 0" class="md:hidden space-y-4 p-4">
              <div *ngFor="let reservation of reservations()" 
                   class="bg-white border border-warm-200 rounded-sm p-4 shadow-sm hover:shadow-md transition-shadow">
                <!-- Header: Customer & Status -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="font-semibold text-stone-800 mb-1">
                      {{ reservation.customer.firstName }} {{ reservation.customer.lastName }}
                    </h3>
                    <p *ngIf="reservation.customer.email" class="text-stone-500 text-sm mb-1">{{ reservation.customer.email }}</p>
                    <p class="text-stone-400 text-xs">{{ reservation.customer.phone }}</p>
                  </div>
                  <span 
                    class="text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0"
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

                <!-- Details Grid -->
                <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p class="text-stone-500 text-xs mb-1">Lokal</p>
                    <p class="text-stone-800 font-medium">{{ reservation.location?.name || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-stone-500 text-xs mb-1">Goście</p>
                    <p class="text-stone-800 font-medium">{{ reservation.guests }} {{ reservation.guests === 1 ? 'osoba' : (reservation.guests < 5 ? 'osoby' : 'osób') }}</p>
                  </div>
                  <div>
                    <p class="text-stone-500 text-xs mb-1">Data</p>
                    <p class="text-stone-800 font-medium">{{ formatDate(reservation.date) }}</p>
                  </div>
                  <div>
                    <p class="text-stone-500 text-xs mb-1">Godzina</p>
                    <p class="text-stone-800 font-medium">{{ reservation.timeSlot.start }} - {{ reservation.timeSlot.end }}</p>
                  </div>
                </div>

                <!-- Type Badge -->
                <div class="mb-4">
                  <span class="text-xs px-2 py-1 rounded-full"
                        [ngClass]="{
                          'bg-blue-100 text-blue-800': reservation.type === 'table',
                          'bg-purple-100 text-purple-800': reservation.type === 'event',
                          'bg-amber-100 text-amber-800': reservation.type === 'full_venue'
                        }">
                    {{ getTypeLabel(reservation.type) }}
                  </span>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-2 pt-3 border-t border-warm-100">
                  <button 
                    *ngIf="reservation.status === 'pending'"
                    (click)="updateStatus(reservation._id, 'confirmed')"
                    class="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  >
                    Potwierdź
                  </button>
                  <button 
                    *ngIf="reservation.status === 'pending' || reservation.status === 'confirmed'"
                    (click)="updateStatus(reservation._id, 'cancelled')"
                    class="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button 
                    (click)="openEditModal(reservation)"
                    class="flex-1 px-3 py-2 bg-stone-600 text-white text-xs rounded hover:bg-stone-700 transition-colors"
                  >
                    Edytuj
                  </button>
                  <button 
                    (click)="deleteReservation(reservation._id)"
                    class="flex-1 px-3 py-2 bg-stone-200 text-stone-600 text-xs rounded hover:bg-stone-300 transition-colors"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>

            <!-- Desktop Table Rows -->
            <div *ngIf="!loading() && reservations().length > 0" class="hidden md:block">
              <div *ngFor="let reservation of reservations()" 
                   class="grid grid-cols-12 gap-4 p-4 border-b border-warm-100 hover:bg-warm-50 transition-colors items-center">
                <!-- Customer -->
                <div class="col-span-3">
                  <p class="font-medium text-stone-800">
                    {{ reservation.customer.firstName }} {{ reservation.customer.lastName }}
                  </p>
                  <p *ngIf="reservation.customer.email" class="text-stone-500 text-sm">{{ reservation.customer.email }}</p>
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
          </div>
        </main>
      </div>

      <!-- Add Reservation Modal -->
      <div *ngIf="showAddModal()" 
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-warm-200 flex items-center justify-between">
            <h2 class="font-display text-xl text-stone-800 font-semibold">Dodaj rezerwację</h2>
            <button (click)="closeAddModal()" class="text-stone-400 hover:text-stone-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <!-- Location -->
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Lokal *</label>
              <select 
                [(ngModel)]="newReservation.location"
                (change)="onAddLocationChange()"
                class="form-input text-sm"
                required
              >
                <option value="">Wybierz lokal</option>
                <option *ngFor="let loc of locations()" [value]="loc._id">
                  {{ loc.name }}
                </option>
              </select>
            </div>

            <!-- Type -->
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Typ rezerwacji *</label>
              <select [(ngModel)]="newReservation.type" (change)="onAddTypeChange()" class="form-input text-sm" required>
                <option value="">Wybierz typ</option>
                <option value="table">Stolik</option>
                <option value="event">Wydarzenie</option>
                <option value="full_venue">Cały lokal</option>
              </select>
            </div>

            <!-- Date & Guests -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Data *</label>
                <input 
                  type="date"
                  [(ngModel)]="newReservation.date"
                  (change)="onAddDateChange()"
                  [min]="today"
                  class="form-input text-sm"
                  required
                >
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Liczba gości *</label>
                <input 
                  type="number"
                  [(ngModel)]="newReservation.guests"
                  (change)="onAddDateChange()"
                  min="1"
                  class="form-input text-sm"
                  required
                >
              </div>
            </div>

            <!-- Time Slot -->
            <div *ngIf="newReservation.location && newReservation.date" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Godzina rozpoczęcia *</label>
                <select 
                  [(ngModel)]="newReservation.timeSlot.start"
                  (change)="calculateEndTime()"
                  class="form-input text-sm"
                  required
                >
                  <option value="">Wybierz godzinę</option>
                  <option *ngFor="let slot of availableTimeSlots()" [value]="slot.time">
                    {{ slot.time }} {{ slot.available ? '' : '(zajęte)' }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Godzina zakończenia *</label>
                <input 
                  type="time"
                  [(ngModel)]="newReservation.timeSlot.end"
                  class="form-input text-sm"
                  required
                >
              </div>
            </div>

            <!-- Customer Details -->
            <div class="border-t border-warm-200 pt-4">
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

            <!-- Event Details (if event or full_venue) -->
            <div *ngIf="(newReservation.type === 'event' || newReservation.type === 'full_venue') && newReservation.eventDetails" class="border-t border-warm-200 pt-4">
              <h3 class="font-semibold text-stone-800 mb-4">Szczegóły wydarzenia</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-stone-600 text-sm font-medium mb-2">Nazwa wydarzenia</label>
                  <input 
                    type="text"
                    [(ngModel)]="newReservation.eventDetails!.name"
                    class="form-input text-sm"
                    placeholder="np. Urodziny, Spotkanie firmowe"
                  >
                </div>
                <div>
                  <label class="block text-stone-600 text-sm font-medium mb-2">Opis / Specjalne wymagania</label>
                  <textarea 
                    [(ngModel)]="newReservation.eventDetails!.specialRequirements"
                    rows="3"
                    class="form-input text-sm resize-none"
                    placeholder="Opisz swoje oczekiwania..."
                  ></textarea>
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
            <div *ngIf="addErrorMessage()" class="p-4 bg-red-50 border border-red-200 rounded-sm">
              <p class="text-red-700 text-sm">{{ addErrorMessage() }}</p>
            </div>
          </div>
          <div class="p-6 border-t border-warm-200 flex justify-end gap-4">
            <button 
              (click)="closeAddModal()"
              class="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              Anuluj
            </button>
            <button 
              (click)="saveNewReservation()"
              [disabled]="!canSaveNewReservation() || addingReservation()"
              class="px-6 py-2 bg-brown-700 text-white rounded-sm hover:bg-brown-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!addingReservation()">Dodaj rezerwację</span>
              <span *ngIf="addingReservation()">Zapisywanie...</span>
            </button>
          </div>
        </div>
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

  showAddModal = signal(false);
  addingReservation = signal(false);
  addErrorMessage = signal('');
  availableTimeSlots = signal<AvailabilitySlot[]>([]);
  loadingAvailability = signal(false);

  newReservation: CreateReservationDto & { 
    status?: 'pending' | 'confirmed';
    eventDetails?: { name?: string; specialRequirements?: string };
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
    eventDetails: {}
  };

  today = new Date().toISOString().split('T')[0];

  constructor(
    private reservationService: ReservationService,
    private locationService: LocationService,
    public sidebarService: SidebarService
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

  openAddModal(): void {
    this.showAddModal.set(true);
    this.addErrorMessage.set('');
    this.newReservation = {
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
      eventDetails: {}
    };
    this.availableTimeSlots.set([]);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.addErrorMessage.set('');
    this.availableTimeSlots.set([]);
  }

  async onAddLocationChange(): Promise<void> {
    if (this.newReservation.location && this.newReservation.date) {
      await this.loadAvailability();
    }
  }

  async onAddTypeChange(): Promise<void> {
    // Reset czasów przy zmianie typu
    this.newReservation.timeSlot.start = '';
    this.newReservation.timeSlot.end = '';
    if (this.newReservation.location && this.newReservation.date) {
      await this.loadAvailability();
    }
  }

  async onAddDateChange(): Promise<void> {
    if (this.newReservation.location && this.newReservation.date) {
      await this.loadAvailability();
    }
  }

  async loadAvailability(): Promise<void> {
    if (!this.newReservation.location || !this.newReservation.date) {
      return;
    }

    this.loadingAvailability.set(true);
    this.addErrorMessage.set('');

    try {
      const res = await firstValueFrom(
        this.reservationService.getAvailability(
          this.newReservation.location,
          this.newReservation.date,
          this.newReservation.guests
        )
      );

      if (res.success) {
        this.availableTimeSlots.set(res.data.slots);
        
        // Ustaw domyślny czas zakończenia na podstawie wybranego czasu rozpoczęcia
        if (this.newReservation.timeSlot.start && !this.newReservation.timeSlot.end) {
          this.calculateEndTime();
        }
      }
    } catch (error: any) {
      console.error('Błąd pobierania dostępności:', error);
      this.addErrorMessage.set('Błąd sprawdzania dostępności. Spróbuj ponownie.');
      this.availableTimeSlots.set([]);
    } finally {
      this.loadingAvailability.set(false);
    }
  }

  calculateEndTime(): void {
    if (!this.newReservation.timeSlot.start) {
      return;
    }

    // Parsuj godzinę rozpoczęcia
    const [hours, minutes] = this.newReservation.timeSlot.start.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    // Dodaj 2 godziny (standardowy czas rezerwacji)
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    // Formatuj jako HH:MM
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    this.newReservation.timeSlot.end = `${endHours}:${endMinutes}`;
  }

  canSaveNewReservation(): boolean {
    return !!(
      this.newReservation.location &&
      this.newReservation.type &&
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

  async saveNewReservation(): Promise<void> {
    if (!this.canSaveNewReservation()) {
      return;
    }

    this.addingReservation.set(true);
    this.addErrorMessage.set('');

    try {
      // Przygotuj dane do wysłania
      const reservationData: any = {
        location: this.newReservation.location,
        type: this.newReservation.type,
        customer: {
          firstName: this.newReservation.customer.firstName.trim(),
          lastName: this.newReservation.customer.lastName.trim(),
          phone: this.newReservation.customer.phone.trim()
        },
        date: this.newReservation.date,
        timeSlot: {
          start: this.newReservation.timeSlot.start,
          end: this.newReservation.timeSlot.end
        },
        guests: this.newReservation.guests
      };

      // Email jest opcjonalny
      if (this.newReservation.customer.email && this.newReservation.customer.email.trim()) {
        reservationData.customer.email = this.newReservation.customer.email.trim().toLowerCase();
      }

      // Email jest opcjonalny
      if (this.newReservation.customer.email && this.newReservation.customer.email.trim()) {
        reservationData.customer.email = this.newReservation.customer.email.trim().toLowerCase();
      }

      // Dodaj status, jeśli jest ustawiony (backend go zaakceptuje)
      if (this.newReservation.status) {
        reservationData.status = this.newReservation.status;
      }

      // Dodaj opcjonalne pola
      if (this.newReservation.notes) {
        reservationData.notes = this.newReservation.notes.trim();
      }

      if ((this.newReservation.type === 'event' || this.newReservation.type === 'full_venue') && this.newReservation.eventDetails) {
        reservationData.eventDetails = {};
        if (this.newReservation.eventDetails.name) {
          reservationData.eventDetails.name = this.newReservation.eventDetails.name.trim();
        }
        if (this.newReservation.eventDetails.specialRequirements) {
          reservationData.eventDetails.specialRequirements = this.newReservation.eventDetails.specialRequirements.trim();
        }
      }

      const res = await firstValueFrom(
        this.reservationService.createReservation(reservationData)
      );

      if (res.success) {
        // Odśwież listę rezerwacji
        this.applyFilters();
        // Zamknij modal
        this.closeAddModal();
      }
    } catch (error: any) {
      console.error('Błąd dodawania rezerwacji:', error);
      this.addErrorMessage.set(
        error?.error?.message || 'Błąd dodawania rezerwacji. Sprawdź dane i spróbuj ponownie.'
      );
    } finally {
      this.addingReservation.set(false);
    }
  }
}
