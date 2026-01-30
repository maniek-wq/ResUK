import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
        <header class="bg-white shadow-sm border-b border-warm-200 px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div class="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              <!-- Hamburger button (mobile only) -->
              <button 
                (click)="sidebarService.toggle()"
                class="md:hidden p-1.5 text-stone-600 hover:text-stone-800 hover:bg-warm-50 rounded-sm transition-colors flex-shrink-0"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <div class="min-w-0">
                <h1 class="font-display text-base sm:text-lg md:text-xl lg:text-2xl text-stone-800 font-semibold truncate">Rezerwacje</h1>
                <p class="text-stone-500 text-xs md:text-sm hidden md:block">Zarządzaj rezerwacjami w obu lokalach</p>
              </div>
            </div>
            <button 
              (click)="openAddModal()"
              class="btn-primary text-xs sm:text-sm px-3 sm:px-4 lg:px-6 py-2 flex-shrink-0 whitespace-nowrap"
            >
              <span class="hidden sm:inline">+ Dodaj rezerwację</span>
              <span class="sm:hidden">+ Dodaj</span>
            </button>
          </div>
        </header>

        <!-- Content -->
        <main class="p-3 sm:p-4 md:p-6 lg:p-8">
          <!-- Filters -->
          <div class="bg-white rounded-sm shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
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
            <div class="hidden xl:grid grid-cols-12 gap-4 p-4 bg-warm-50 border-b border-warm-200 text-sm font-semibold text-stone-600">
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

            <!-- Mobile/Tablet Card Layout -->
            <div *ngIf="!loading() && reservations().length > 0" class="xl:hidden space-y-3 p-3 md:p-4">
              <div *ngFor="let reservation of reservations()" 
                   class="bg-white border border-warm-200 rounded-sm p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
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

                <!-- Event Details (if event or full_venue) -->
                <div *ngIf="(reservation.type === 'event' || reservation.type === 'full_venue') && reservation.eventDetails" 
                     class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-sm text-sm space-y-2">
                  <div *ngIf="reservation.eventDetails.name" class="flex items-start gap-2">
                    <span class="text-blue-700 font-medium text-xs">Wydarzenie:</span>
                    <span class="text-blue-900 text-xs">{{ reservation.eventDetails.name }}</span>
                  </div>
                  <div *ngIf="reservation.eventDetails.description" class="flex items-start gap-2">
                    <span class="text-blue-700 font-medium text-xs">Opis:</span>
                    <span class="text-blue-900 text-xs">{{ reservation.eventDetails.description }}</span>
                  </div>
                  <div *ngIf="reservation.eventDetails.specialRequirements" class="flex items-start gap-2">
                    <span class="text-blue-700 font-medium text-xs">Wymagania:</span>
                    <span class="text-blue-900 text-xs">{{ reservation.eventDetails.specialRequirements }}</span>
                  </div>
                </div>

                <!-- Notes (if any) -->
                <div *ngIf="reservation.notes" class="mb-4 p-3 bg-warm-50 border border-warm-200 rounded-sm">
                  <p class="text-stone-500 text-xs mb-1">Notatki</p>
                  <p class="text-stone-800 text-sm">{{ reservation.notes }}</p>
                </div>

                <!-- Actions -->
                <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 pt-3 border-t border-warm-100">
                  <button 
                    *ngIf="reservation.status === 'pending'"
                    (click)="updateStatus(reservation._id, 'confirmed')"
                    class="px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 text-white text-[10px] sm:text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    Potwierdź
                  </button>
                  <button 
                    *ngIf="reservation.status === 'pending' || reservation.status === 'confirmed'"
                    (click)="updateStatus(reservation._id, 'cancelled')"
                    class="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white text-[10px] sm:text-xs rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                  >
                    Anuluj
                  </button>
                  <button 
                    (click)="openEditModal(reservation)"
                    class="px-2 sm:px-3 py-1.5 sm:py-2 bg-stone-600 text-white text-[10px] sm:text-xs rounded hover:bg-stone-700 transition-colors whitespace-nowrap"
                  >
                    Edytuj
                  </button>
                  <button 
                    (click)="deleteReservation(reservation._id)"
                    class="px-2 sm:px-3 py-1.5 sm:py-2 bg-stone-200 text-stone-600 text-[10px] sm:text-xs rounded hover:bg-stone-300 transition-colors whitespace-nowrap"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>

            <!-- Desktop Table Rows -->
            <div *ngIf="!loading() && reservations().length > 0" class="hidden xl:block">
              <div *ngFor="let reservation of reservations()" 
                   class="grid grid-cols-12 gap-3 p-3 lg:gap-4 lg:p-4 border-b border-warm-100 hover:bg-warm-50 transition-colors items-center">
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
                <div class="col-span-2 flex justify-end gap-1.5">
                  <button 
                    *ngIf="reservation.status === 'pending'"
                    (click)="updateStatus(reservation._id, 'confirmed')"
                    class="px-2 py-1 bg-green-600 text-white text-[10px] xl:text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    Potwierdź
                  </button>
                  <button 
                    *ngIf="reservation.status === 'pending' || reservation.status === 'confirmed'"
                    (click)="updateStatus(reservation._id, 'cancelled')"
                    class="px-2 py-1 bg-red-600 text-white text-[10px] xl:text-xs rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                  >
                    Anuluj
                  </button>
                  <button 
                    (click)="openEditModal(reservation)"
                    class="px-2 py-1 bg-stone-600 text-white text-[10px] xl:text-xs rounded hover:bg-stone-700 transition-colors whitespace-nowrap"
                  >
                    Edytuj
                  </button>
                  <button 
                    (click)="deleteReservation(reservation._id)"
                    class="px-2 py-1 bg-stone-200 text-stone-600 text-[10px] xl:text-xs rounded hover:bg-stone-300 transition-colors whitespace-nowrap"
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
            <!-- Informacje o utworzeniu i potwierdzeniu -->
            <div class="bg-warm-50 border border-warm-200 rounded-sm p-4 text-sm space-y-2">
              <div *ngIf="editingReservation()?.createdBy" class="flex items-start gap-2">
                <span class="text-stone-500 min-w-[100px]">Utworzona przez:</span>
                <span class="text-stone-800 font-medium">
                  {{ editingReservation()!.createdBy.firstName }} {{ editingReservation()!.createdBy.lastName }}
                </span>
              </div>
              <div *ngIf="editingReservation()?.confirmedBy" class="flex items-start gap-2">
                <span class="text-stone-500 min-w-[100px]">Potwierdzona przez:</span>
                <span class="text-stone-800 font-medium">
                  {{ editingReservation()!.confirmedBy.firstName }} {{ editingReservation()!.confirmedBy.lastName }}
                  <span class="text-stone-500 text-xs ml-2" *ngIf="editingReservation()?.confirmedAt">
                    ({{ formatDateTime(editingReservation()!.confirmedAt!) }})
                  </span>
                </span>
              </div>
              <div *ngIf="editingReservation()?.updatedBy" class="flex items-start gap-2">
                <span class="text-stone-500 min-w-[100px]">Ostatnia zmiana:</span>
                <span class="text-stone-800 font-medium">
                  {{ editingReservation()!.updatedBy.firstName }} {{ editingReservation()!.updatedBy.lastName }}
                  <span class="text-stone-500 text-xs ml-2">
                    ({{ formatDateTime(editingReservation()!.updatedAt) }})
                  </span>
                </span>
              </div>
            </div>

            <!-- Typ rezerwacji i szczegóły wydarzenia -->
            <div class="bg-blue-50 border border-blue-200 rounded-sm p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <h3 class="font-semibold text-blue-900 text-sm">
                  {{ getReservationTypeLabel(editingReservation()!.type) }}
                </h3>
              </div>
              
              <!-- Event details - only for event/full_venue types -->
              <div *ngIf="editingReservation()!.type === 'event' || editingReservation()!.type === 'full_venue'" class="space-y-2 text-sm">
                <div *ngIf="editingReservation()?.eventDetails?.name" class="flex items-start gap-2">
                  <span class="text-blue-700 font-medium min-w-[120px]">Nazwa wydarzenia:</span>
                  <span class="text-blue-900">{{ editingReservation()!.eventDetails!.name }}</span>
                </div>
                <div *ngIf="editingReservation()?.eventDetails?.description" class="flex items-start gap-2">
                  <span class="text-blue-700 font-medium min-w-[120px]">Opis:</span>
                  <span class="text-blue-900">{{ editingReservation()!.eventDetails!.description }}</span>
                </div>
                <div *ngIf="editingReservation()?.eventDetails?.specialRequirements" class="flex items-start gap-2">
                  <span class="text-blue-700 font-medium min-w-[120px]">Specjalne wymagania:</span>
                  <span class="text-blue-900">{{ editingReservation()!.eventDetails!.specialRequirements }}</span>
                </div>
                <div *ngIf="!editingReservation()?.eventDetails?.name && !editingReservation()?.eventDetails?.description && !editingReservation()?.eventDetails?.specialRequirements" class="text-blue-700 text-xs italic">
                  Brak dodatkowych szczegółów wydarzenia
                </div>
              </div>
            </div>

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
            
            <!-- Historia zmian -->
            <div *ngIf="editingReservation()?.statusHistory && editingReservation()!.statusHistory!.length > 0" 
                 class="border-t border-warm-200 pt-4">
              <h3 class="font-semibold text-stone-800 mb-3 text-sm">Historia zmian statusu</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div *ngFor="let change of editingReservation()!.statusHistory" 
                     class="text-xs p-3 bg-warm-50 border border-warm-100 rounded-sm">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <span 
                      class="px-2 py-0.5 rounded-full font-medium"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': change.status === 'pending',
                        'bg-green-100 text-green-800': change.status === 'confirmed',
                        'bg-red-100 text-red-800': change.status === 'cancelled',
                        'bg-stone-100 text-stone-800': change.status === 'completed'
                      }"
                    >
                      {{ getStatusLabel(change.status) }}
                    </span>
                    <span class="text-stone-500">
                      {{ formatDateTime(change.changedAt) }}
                    </span>
                  </div>
                  <p class="text-stone-700">
                    <span class="font-medium">
                      {{ change.changedBy?.firstName }} {{ change.changedBy?.lastName }}
                    </span>
                    <span *ngIf="change.reason" class="text-stone-500"> • {{ change.reason }}</span>
                  </p>
                </div>
              </div>
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
    public sidebarService: SidebarService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLocations();
    
    // Sprawdź czy jest reservationId w query params (z powiadomienia)
    this.route.queryParams.subscribe(params => {
      if (params['reservationId']) {
        const reservationId = params['reservationId'];
        // Usuń query param z URL od razu
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
        // Załaduj rezerwacje i otwórz modal
        this.applyFiltersWithCallback(() => {
          const reservation = this.reservations().find(r => r._id === reservationId);
          if (reservation) {
            this.openEditModal(reservation);
          }
        });
      } else {
        this.applyFilters();
      }
    });
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe(res => {
      if (res.success) {
        this.locations.set(res.data);
      }
    });
  }

  applyFilters(): void {
    this.applyFiltersWithCallback();
  }

  applyFiltersWithCallback(callback?: () => void): void {
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
        if (callback) {
          callback();
        }
      },
      error: () => {
        this.loading.set(false);
        if (callback) {
          callback();
        }
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

  async openEditModal(reservation: Reservation): Promise<void> {
    // Pobierz pełne dane rezerwacji z historią zmian
    try {
      const res = await firstValueFrom(this.reservationService.getReservation(reservation._id));
      if (res.success) {
        this.editingReservation.set(res.data);
        this.editForm = {
          date: res.data.date.split('T')[0],
          guests: res.data.guests,
          timeStart: res.data.timeSlot.start,
          timeEnd: res.data.timeSlot.end,
          status: res.data.status,
          notes: res.data.notes || ''
        };
      }
    } catch (error) {
      console.error('Error loading reservation details:', error);
      // Fallback do oryginalnych danych
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
  }

  closeEditModal(): void {
    this.editingReservation.set(null);
  }

  async saveEdit(): Promise<void> {
    const reservation = this.editingReservation();
    if (!reservation) return;

    try {
      // Jeśli status się zmienił, użyj dedykowanego endpointu do zmiany statusu
      if (this.editForm.status !== reservation.status) {
        await firstValueFrom(
          this.reservationService.updateStatus(reservation._id, this.editForm.status as any)
        );
      }

      // Zaktualizuj pozostałe pola
      const updates: Partial<Reservation> = {
        date: this.editForm.date,
        guests: this.editForm.guests,
        timeSlot: {
          start: this.editForm.timeStart,
          end: this.editForm.timeEnd
        },
        notes: this.editForm.notes
      };

      const res = await firstValueFrom(
        this.reservationService.updateReservation(reservation._id, updates)
      );
      
      if (res.success) {
        this.closeEditModal();
        this.applyFilters();
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Błąd zapisywania zmian');
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  getReservationTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'table': 'Rezerwacja stolika',
      'event': 'Wydarzenie',
      'full_venue': 'Rezerwacja całego lokalu'
    };
    return labels[type] || 'Rezerwacja';
  }
}
