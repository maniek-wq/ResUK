import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { LocationService, Location } from '../../../core/services/location.service';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

interface DailyReport {
  _id: string;
  location: string | Location;
  date: string;
  revenue: number;
  currency: string;
  statistics: {
    totalGuests?: number;
    totalReservations?: number;
    tablesOccupied?: number;
    averageGuestsPerReservation?: number;
    averageRevenuePerGuest?: number;
    confirmedReservations?: number;
    cancelledReservations?: number;
    completedReservations?: number;
    notes?: string;
  };
  createdBy?: any;
  updatedBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface StatisticsFromReservations {
  totalGuests: number;
  totalReservations: number;
  tablesOccupied: number;
  averageGuestsPerReservation: number;
  confirmedReservations: number;
  cancelledReservations: number;
  completedReservations: number;
}

@Component({
  selector: 'app-locations-management',
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
                <h1 class="font-display text-xl md:text-2xl text-stone-800 font-semibold">Zarządzanie Lokalmi</h1>
                <p class="text-stone-500 text-sm hidden md:block">Zarządzaj lokalami i wprowadzaj dzienne raporty</p>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 md:p-8">
          <!-- Navigation Tabs -->
          <div class="bg-white rounded-sm shadow-sm mb-6">
            <div class="border-b border-warm-200">
              <nav class="flex -mb-px">
                <button 
                  (click)="activeTab.set('locations')"
                  class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
                  [class]="activeTab() === 'locations'
                           ? 'border-brown-700 text-brown-700'
                           : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'"
                >
                  Lokale
                </button>
                <button 
                  (click)="activeTab.set('reports')"
                  class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
                  [class]="activeTab() === 'reports'
                           ? 'border-brown-700 text-brown-700'
                           : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'"
                >
                  Raporty dzienne
                </button>
                <button 
                  (click)="activeTab.set('comparison')"
                  class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
                  [class]="activeTab() === 'comparison'
                           ? 'border-brown-700 text-brown-700'
                           : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'"
                >
                  Zestawienie
                </button>
              </nav>
            </div>

            <!-- Locations Tab -->
            <div *ngIf="activeTab() === 'locations'" class="p-6">
              <div *ngIf="loading()" class="text-center py-12">
                <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
              </div>

              <div *ngIf="!loading() && locations().length === 0" class="text-center py-12 text-stone-500">
                <p>Brak lokali</p>
              </div>

              <div *ngIf="!loading() && locations().length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  *ngFor="let location of locations()"
                  class="p-6 border border-warm-200 rounded-sm hover:shadow-md transition-shadow bg-white"
                >
                  <h3 class="font-display text-xl text-stone-800 font-semibold mb-2">
                    {{ location.name }}
                  </h3>
                  <p class="text-stone-600 text-sm mb-4">
                    {{ location.address.street }}, {{ location.address.city }}
                  </p>
                  <div class="flex items-center gap-4 text-sm text-stone-500 mb-4">
                    <span>{{ location.totalTables }} stolików</span>
                    <span>Max {{ location.maxCapacity }} osób</span>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      (click)="viewLocationReports(location._id)"
                      class="px-4 py-2 bg-brown-700 text-white text-sm rounded hover:bg-brown-800 transition-colors"
                    >
                      Zobacz raporty
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reports Tab -->
            <div *ngIf="activeTab() === 'reports'" class="p-6">
              <!-- Report Form -->
              <div class="bg-white rounded-sm shadow-sm p-6 mb-6">
                <h2 class="font-display text-lg text-stone-800 font-semibold mb-4">
                  Wprowadź raport dzienny
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Lokal *</label>
                    <select 
                      [(ngModel)]="reportForm.location"
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
                    <label class="block text-stone-600 text-sm font-medium mb-2">Data *</label>
                    <input 
                      type="date"
                      [(ngModel)]="reportForm.date"
                      (change)="onDateChange()"
                      [max]="today"
                      class="form-input text-sm"
                      required
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Przychód (PLN) *</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.revenue"
                      (ngModelChange)="calculateAverageRevenuePerGuest()"
                      step="0.01"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0.00"
                      required
                    >
                  </div>
                </div>
                <div class="mb-4 flex gap-2">
                  <button 
                    (click)="loadStatisticsFromReservations()"
                    [disabled]="!canLoadStatistics() || loadingStatistics()"
                    class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <span *ngIf="!loadingStatistics()">Pobierz statystyki z rezerwacji</span>
                    <span *ngIf="loadingStatistics()">Ładowanie...</span>
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Łączna liczba gości</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.statistics.totalGuests"
                      (ngModelChange)="onStatisticsChange()"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Liczba rezerwacji</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.statistics.totalReservations"
                      (ngModelChange)="onStatisticsChange()"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Stoliki zajęte</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.statistics.tablesOccupied"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Średnia gości/rezerwacja</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.statistics.averageGuestsPerReservation"
                      step="0.01"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0.00"
                      readonly
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Potwierdzone</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.statistics.confirmedReservations"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Anulowane</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.statistics.cancelledReservations"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Ukończone</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.statistics.completedReservations"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Średni przychód/gość</label>
                    <input 
                      type="number"
                      [(ngModel)]="reportForm.statistics.averageRevenuePerGuest"
                      step="0.01"
                      min="0"
                      class="form-input text-sm"
                      placeholder="0.00"
                      readonly
                    >
                  </div>
                </div>
                <div class="mb-4">
                  <label class="block text-stone-600 text-sm font-medium mb-2">Notatki</label>
                  <textarea 
                    [(ngModel)]="reportForm.statistics.notes"
                    rows="3"
                    class="form-input text-sm resize-none"
                    placeholder="Dodatkowe informacje..."
                    maxlength="1000"
                  ></textarea>
                  <p class="text-stone-500 text-xs mt-1">{{ (reportForm.statistics.notes || '').length }}/1000 znaków</p>
                </div>
                <div *ngIf="errorMessage()" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm">
                  <p class="text-red-700 text-sm">{{ errorMessage() }}</p>
                </div>
                <div *ngIf="successMessage()" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-sm">
                  <p class="text-green-700 text-sm">{{ successMessage() }}</p>
                </div>
                <div class="flex justify-end">
                  <button 
                    (click)="saveReport()"
                    [disabled]="!canSaveReport() || submitting()"
                    class="btn-primary text-sm px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span *ngIf="!submitting()">Zapisz raport</span>
                    <span *ngIf="submitting()">Zapisywanie...</span>
                  </button>
                </div>
              </div>

              <!-- Reports List -->
              <div class="bg-white rounded-sm shadow-sm overflow-hidden">
                <div class="p-6 border-b border-warm-200 bg-warm-50">
                  <h3 class="font-display text-lg text-stone-800 font-semibold">
                    Historia raportów
                  </h3>
                </div>
                <div class="p-6">
                  <!-- Filters -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label class="block text-stone-600 text-sm font-medium mb-2">Lokal</label>
                      <select 
                        [(ngModel)]="reportFilter.location"
                        (change)="loadReports()"
                        class="form-input text-sm"
                      >
                        <option value="">Wszystkie lokale</option>
                        <option *ngFor="let loc of locations()" [value]="loc._id">
                          {{ loc.name }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-stone-600 text-sm font-medium mb-2">Od daty</label>
                      <input 
                        type="date"
                        [(ngModel)]="reportFilter.dateFrom"
                        (change)="loadReports()"
                        class="form-input text-sm"
                      >
                    </div>
                    <div>
                      <label class="block text-stone-600 text-sm font-medium mb-2">Do daty</label>
                      <input 
                        type="date"
                        [(ngModel)]="reportFilter.dateTo"
                        (change)="loadReports()"
                        class="form-input text-sm"
                      >
                    </div>
                  </div>

                  <!-- Loading -->
                  <div *ngIf="loadingReports()" class="text-center py-12">
                    <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
                  </div>

                  <!-- Reports List -->
                  <div *ngIf="!loadingReports() && dailyReports().length > 0" class="space-y-4">
                    <div 
                      *ngFor="let report of dailyReports()"
                      class="p-6 border border-warm-200 rounded-sm hover:shadow-md transition-shadow"
                    >
                      <div class="flex items-center justify-between mb-4">
                        <div>
                          <h4 class="font-display text-lg text-stone-800 font-semibold">
                            {{ getLocationName(report.location) }}
                          </h4>
                          <p class="text-stone-500 text-sm">{{ formatDate(report.date) }}</p>
                        </div>
                        <div class="text-right">
                          <p class="font-display text-2xl text-brown-700 font-bold">
                            {{ formatPrice(report.revenue, report.currency) }}
                          </p>
                          <p class="text-stone-500 text-xs">
                            {{ report.statistics.totalGuests || 0 }} gości
                          </p>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p class="text-stone-500 text-xs mb-1">Rezerwacje</p>
                          <p class="font-semibold text-stone-800">{{ report.statistics.totalReservations || 0 }}</p>
                        </div>
                        <div>
                          <p class="text-stone-500 text-xs mb-1">Potwierdzone</p>
                          <p class="font-semibold text-green-700">{{ report.statistics.confirmedReservations || 0 }}</p>
                        </div>
                        <div>
                          <p class="text-stone-500 text-xs mb-1">Ukończone</p>
                          <p class="font-semibold text-blue-700">{{ report.statistics.completedReservations || 0 }}</p>
                        </div>
                        <div>
                          <p class="text-stone-500 text-xs mb-1">Średnia/przychód</p>
                          <p class="font-semibold text-stone-800">
                            {{ formatPrice(report.statistics.averageRevenuePerGuest || 0, report.currency) }}
                          </p>
                        </div>
                      </div>
                      <p *ngIf="report.statistics.notes" class="text-stone-600 text-sm mt-4 italic">
                        "{{ report.statistics.notes }}"
                      </p>
                      <div class="mt-4 flex justify-end gap-2">
                        <button 
                          (click)="editReport(report)"
                          class="px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded hover:bg-stone-300 transition-colors"
                        >
                          Edytuj
                        </button>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="!loadingReports() && dailyReports().length === 0" class="text-center py-12 text-stone-500">
                    <p>Brak raportów dla wybranych kryteriów</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comparison Tab -->
            <div *ngIf="activeTab() === 'comparison'" class="p-6">
              <!-- Filters -->
              <div class="bg-white rounded-sm shadow-sm p-6 mb-6">
                <h2 class="font-display text-lg text-stone-800 font-semibold mb-4">
                  Zestawienie lokali
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Od daty</label>
                    <input 
                      type="date"
                      [(ngModel)]="comparisonFilter.dateFrom"
                      (change)="loadComparison()"
                      class="form-input text-sm"
                    >
                  </div>
                  <div>
                    <label class="block text-stone-600 text-sm font-medium mb-2">Do daty</label>
                    <input 
                      type="date"
                      [(ngModel)]="comparisonFilter.dateTo"
                      (change)="loadComparison()"
                      class="form-input text-sm"
                    >
                  </div>
                </div>
              </div>

              <!-- Loading -->
              <div *ngIf="loadingComparison()" class="text-center py-12">
                <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
              </div>

              <!-- Comparison Content -->
              <div *ngIf="!loadingComparison()" class="space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div *ngFor="let location of locations(); let i = index" 
                       class="bg-white rounded-sm shadow-sm p-6">
                    <h3 class="font-display text-xl text-stone-800 font-semibold mb-4">
                      {{ location.name }}
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="p-4 bg-warm-50 rounded-sm">
                        <p class="text-stone-500 text-xs mb-1">Łączny przychód</p>
                        <p class="font-display text-2xl text-brown-700 font-bold">
                          {{ formatPrice(getLocationTotalRevenue(location._id), 'PLN') }}
                        </p>
                      </div>
                      <div class="p-4 bg-warm-50 rounded-sm">
                        <p class="text-stone-500 text-xs mb-1">Średni przychód/dzień</p>
                        <p class="font-display text-xl text-stone-800 font-semibold">
                          {{ formatPrice(getLocationAverageRevenue(location._id), 'PLN') }}
                        </p>
                      </div>
                      <div class="p-4 bg-blue-50 rounded-sm">
                        <p class="text-blue-600 text-xs mb-1">Łączna liczba gości</p>
                        <p class="font-display text-xl text-blue-800 font-semibold">
                          {{ getLocationTotalGuests(location._id) }}
                        </p>
                      </div>
                      <div class="p-4 bg-green-50 rounded-sm">
                        <p class="text-green-600 text-xs mb-1">Rezerwacje</p>
                        <p class="font-display text-xl text-green-800 font-semibold">
                          {{ getLocationTotalReservations(location._id) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Revenue Comparison Chart -->
                <div class="bg-white rounded-sm shadow-sm p-6">
                  <h3 class="font-display text-lg text-stone-800 font-semibold mb-6">
                    Porównanie przychodów
                  </h3>
                  <div class="space-y-6">
                    <div *ngFor="let location of locations(); let i = index">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-stone-600 text-sm font-medium">{{ location.name }}</span>
                        <span class="text-stone-800 font-semibold">
                          {{ formatPrice(getLocationTotalRevenue(location._id), 'PLN') }}
                        </span>
                      </div>
                      <div class="w-full bg-warm-100 rounded-full h-8 overflow-hidden">
                        <div 
                          class="h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                          [style.width.%]="getRevenuePercentage(location._id)"
                          [style.background-color]="i === 0 ? '#92400e' : '#a16207'"
                        >
                          <span *ngIf="getRevenuePercentage(location._id) > 10">
                            {{ formatPrice(getLocationTotalRevenue(location._id), 'PLN') }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Guests Comparison Chart -->
                <div class="bg-white rounded-sm shadow-sm p-6">
                  <h3 class="font-display text-lg text-stone-800 font-semibold mb-6">
                    Porównanie liczby gości
                  </h3>
                  <div class="space-y-6">
                    <div *ngFor="let location of locations(); let i = index">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-stone-600 text-sm font-medium">{{ location.name }}</span>
                        <span class="text-stone-800 font-semibold">
                          {{ getLocationTotalGuests(location._id) }} gości
                        </span>
                      </div>
                      <div class="w-full bg-warm-100 rounded-full h-8 overflow-hidden">
                        <div 
                          class="h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                          [style.width.%]="getGuestsPercentage(location._id)"
                          [style.background-color]="i === 0 ? '#0891b2' : '#0e7490'"
                        >
                          <span *ngIf="getGuestsPercentage(location._id) > 10">
                            {{ getLocationTotalGuests(location._id) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Reservations Comparison Chart -->
                <div class="bg-white rounded-sm shadow-sm p-6">
                  <h3 class="font-display text-lg text-stone-800 font-semibold mb-6">
                    Porównanie rezerwacji
                  </h3>
                  <div class="space-y-6">
                    <div *ngFor="let location of locations(); let i = index">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-stone-600 text-sm font-medium">{{ location.name }}</span>
                        <span class="text-stone-800 font-semibold">
                          {{ getLocationTotalReservations(location._id) }} rezerwacji
                        </span>
                      </div>
                      <div class="w-full bg-warm-100 rounded-full h-8 overflow-hidden">
                        <div 
                          class="h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                          [style.width.%]="getReservationsPercentage(location._id)"
                          [style.background-color]="i === 0 ? '#059669' : '#047857'"
                        >
                          <span *ngIf="getReservationsPercentage(location._id) > 10">
                            {{ getLocationTotalReservations(location._id) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Detailed Comparison Table -->
                <div class="bg-white rounded-sm shadow-sm overflow-hidden">
                  <div class="p-6 border-b border-warm-200 bg-warm-50">
                    <h3 class="font-display text-lg text-stone-800 font-semibold">
                      Szczegółowe zestawienie
                    </h3>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead class="bg-warm-100">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase">
                            Metryka
                          </th>
                          <th *ngFor="let location of locations()" 
                              class="px-6 py-3 text-center text-xs font-semibold text-stone-600 uppercase">
                            {{ location.name }}
                          </th>
                          <th class="px-6 py-3 text-center text-xs font-semibold text-stone-600 uppercase">
                            Razem
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-warm-200">
                        <tr>
                          <td class="px-6 py-4 text-sm text-stone-600 font-medium">Przychód</td>
                          <td *ngFor="let location of locations()" 
                              class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ formatPrice(getLocationTotalRevenue(location._id), 'PLN') }}
                          </td>
                          <td class="px-6 py-4 text-sm text-center text-brown-700 font-bold">
                            {{ formatPrice(getTotalRevenue(), 'PLN') }}
                          </td>
                        </tr>
                        <tr>
                          <td class="px-6 py-4 text-sm text-stone-600 font-medium">Średni przychód/dzień</td>
                          <td *ngFor="let location of locations()" 
                              class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ formatPrice(getLocationAverageRevenue(location._id), 'PLN') }}
                          </td>
                          <td class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ formatPrice(getAverageRevenue(), 'PLN') }}
                          </td>
                        </tr>
                        <tr>
                          <td class="px-6 py-4 text-sm text-stone-600 font-medium">Goście</td>
                          <td *ngFor="let location of locations()" 
                              class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ getLocationTotalGuests(location._id) }}
                          </td>
                          <td class="px-6 py-4 text-sm text-center text-blue-700 font-bold">
                            {{ getTotalGuests() }}
                          </td>
                        </tr>
                        <tr>
                          <td class="px-6 py-4 text-sm text-stone-600 font-medium">Rezerwacje</td>
                          <td *ngFor="let location of locations()" 
                              class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ getLocationTotalReservations(location._id) }}
                          </td>
                          <td class="px-6 py-4 text-sm text-center text-green-700 font-bold">
                            {{ getTotalReservations() }}
                          </td>
                        </tr>
                        <tr>
                          <td class="px-6 py-4 text-sm text-stone-600 font-medium">Średni przychód/gość</td>
                          <td *ngFor="let location of locations()" 
                              class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ formatPrice(getLocationAverageRevenuePerGuest(location._id), 'PLN') }}
                          </td>
                          <td class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ formatPrice(getAverageRevenuePerGuest(), 'PLN') }}
                          </td>
                        </tr>
                        <tr>
                          <td class="px-6 py-4 text-sm text-stone-600 font-medium">Średnia gości/rezerwacja</td>
                          <td *ngFor="let location of locations()" 
                              class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ getLocationAverageGuestsPerReservation(location._id).toFixed(2) }}
                          </td>
                          <td class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ getAverageGuestsPerReservation().toFixed(2) }}
                          </td>
                        </tr>
                        <tr>
                          <td class="px-6 py-4 text-sm text-stone-600 font-medium">Liczba dni z raportami</td>
                          <td *ngFor="let location of locations()" 
                              class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ getLocationReportDays(location._id) }}
                          </td>
                          <td class="px-6 py-4 text-sm text-center text-stone-800 font-semibold">
                            {{ getTotalReportDays() }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
export class LocationsManagementComponent implements OnInit {
  locations = signal<Location[]>([]);
  dailyReports = signal<DailyReport[]>([]);
  loading = signal(false);
  loadingReports = signal(false);
  loadingStatistics = signal(false);
  submitting = signal(false);
  activeTab = signal<'locations' | 'reports' | 'comparison'>('locations');
  comparisonFilter = {
    dateFrom: '',
    dateTo: ''
  };
  loadingComparison = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  editingReport = signal<DailyReport | null>(null);

  reportForm = {
    location: '',
    date: '',
    revenue: 0,
    currency: 'PLN',
    statistics: {
      totalGuests: 0,
      totalReservations: 0,
      tablesOccupied: 0,
      averageGuestsPerReservation: 0,
      averageRevenuePerGuest: 0,
      confirmedReservations: 0,
      cancelledReservations: 0,
      completedReservations: 0,
      notes: ''
    }
  };

  reportFilter = {
    location: '',
    dateFrom: '',
    dateTo: ''
  };

  today = new Date().toISOString().split('T')[0];

  constructor(
    private locationService: LocationService,
    private api: ApiService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadLocations();
    this.loadReports();
  }

  async loadLocations(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.locationService.getLocations());
      if (res.success) {
        this.locations.set(res.data.filter(loc => loc.isActive));
      }
    } catch (error) {
      console.error('Błąd pobierania lokali:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadReports(): Promise<void> {
    this.loadingReports.set(true);
    try {
      const params: any = {};
      if (this.reportFilter.location) params.location = this.reportFilter.location;
      if (this.reportFilter.dateFrom) params.dateFrom = this.reportFilter.dateFrom;
      if (this.reportFilter.dateTo) params.dateTo = this.reportFilter.dateTo;

      const res = await firstValueFrom(
        this.api.get<{ success: boolean; count: number; data: DailyReport[] }>('/daily-reports', params)
      );
      if (res.success) {
        this.dailyReports.set(res.data);
      }
    } catch (error) {
      console.error('Błąd pobierania raportów:', error);
    } finally {
      this.loadingReports.set(false);
    }
  }

  async loadStatisticsFromReservations(): Promise<void> {
    if (!this.reportForm.location || !this.reportForm.date) return;

    this.loadingStatistics.set(true);
    try {
      const res = await firstValueFrom(
        this.api.get<{ success: boolean; data: StatisticsFromReservations }>(
          `/daily-reports/statistics/${this.reportForm.location}/${this.reportForm.date}`
        )
      );
      if (res.success) {
        const stats = res.data;
        this.reportForm.statistics = {
          ...this.reportForm.statistics,
          totalGuests: stats.totalGuests,
          totalReservations: stats.totalReservations,
          tablesOccupied: stats.tablesOccupied,
          averageGuestsPerReservation: parseFloat(stats.averageGuestsPerReservation.toString()),
          confirmedReservations: stats.confirmedReservations,
          cancelledReservations: stats.cancelledReservations,
          completedReservations: stats.completedReservations
        };
        this.calculateAverageRevenuePerGuest();
      }
    } catch (error: any) {
      console.error('Błąd pobierania statystyk:', error);
      this.errorMessage.set(error?.error?.message || 'Błąd pobierania statystyk z rezerwacji');
    } finally {
      this.loadingStatistics.set(false);
    }
  }

  onLocationChange(): void {
    // Resetuj statystyki gdy zmienia się lokal
  }

  onDateChange(): void {
    // Resetuj statystyki gdy zmienia się data
    if (this.reportForm.location && this.reportForm.date) {
      // Można automatycznie załadować statystyki, ale nie musimy
    }
  }

  calculateAverageRevenuePerGuest(): void {
    const guests = this.reportForm.statistics.totalGuests || 0;
    const revenue = this.reportForm.revenue || 0;
    if (guests > 0) {
      this.reportForm.statistics.averageRevenuePerGuest = parseFloat((revenue / guests).toFixed(2));
    } else {
      this.reportForm.statistics.averageRevenuePerGuest = 0;
    }
  }

  onStatisticsChange(): void {
    // Oblicz średnią liczbę gości na rezerwację
    const guests = this.reportForm.statistics.totalGuests || 0;
    const reservations = this.reportForm.statistics.totalReservations || 0;
    if (reservations > 0) {
      this.reportForm.statistics.averageGuestsPerReservation = parseFloat((guests / reservations).toFixed(2));
    } else {
      this.reportForm.statistics.averageGuestsPerReservation = 0;
    }
    // Oblicz średni przychód na gościa
    this.calculateAverageRevenuePerGuest();
  }

  canLoadStatistics(): boolean {
    return !!(this.reportForm.location && this.reportForm.date);
  }

  canSaveReport(): boolean {
    return !!(this.reportForm.location && this.reportForm.date && this.reportForm.revenue >= 0);
  }

  async saveReport(): Promise<void> {
    if (!this.canSaveReport()) return;

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Oblicz średnie przed zapisem
    this.calculateAverageRevenuePerGuest();
    const guests = this.reportForm.statistics.totalGuests || 0;
    const reservations = this.reportForm.statistics.totalReservations || 0;
    if (reservations > 0 && !this.reportForm.statistics.averageGuestsPerReservation) {
      this.reportForm.statistics.averageGuestsPerReservation = parseFloat((guests / reservations).toFixed(2));
    }

    try {
      const res = await firstValueFrom(
        this.api.post<{ success: boolean; data: DailyReport; message: string }>('/daily-reports', this.reportForm)
      );
      if (res.success) {
        this.successMessage.set(res.message || 'Raport został zapisany!');
        await this.loadReports();
        // Resetuj formularz po zapisaniu
        setTimeout(() => {
          this.resetReportForm();
        }, 2000);
      }
    } catch (error: any) {
      this.errorMessage.set(error?.error?.message || 'Błąd zapisywania raportu');
    } finally {
      this.submitting.set(false);
    }
  }

  resetReportForm(): void {
    this.reportForm = {
      location: '',
      date: '',
      revenue: 0,
      currency: 'PLN',
      statistics: {
        totalGuests: 0,
        totalReservations: 0,
        tablesOccupied: 0,
        averageGuestsPerReservation: 0,
        averageRevenuePerGuest: 0,
        confirmedReservations: 0,
        cancelledReservations: 0,
        completedReservations: 0,
        notes: ''
      }
    };
    this.editingReport.set(null);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  editReport(report: DailyReport): void {
    this.editingReport.set(report);
    this.reportForm = {
      location: this.getLocationId(report.location),
      date: report.date.split('T')[0],
      revenue: report.revenue,
      currency: report.currency || 'PLN',
      statistics: {
        totalGuests: report.statistics.totalGuests || 0,
        totalReservations: report.statistics.totalReservations || 0,
        tablesOccupied: report.statistics.tablesOccupied || 0,
        averageGuestsPerReservation: report.statistics.averageGuestsPerReservation || 0,
        averageRevenuePerGuest: report.statistics.averageRevenuePerGuest || 0,
        confirmedReservations: report.statistics.confirmedReservations || 0,
        cancelledReservations: report.statistics.cancelledReservations || 0,
        completedReservations: report.statistics.completedReservations || 0,
        notes: report.statistics.notes || ''
      }
    };
    this.activeTab.set('reports');
    // Scroll do formularza
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewLocationReports(locationId: string): void {
    this.reportFilter.location = locationId;
    this.activeTab.set('reports');
    this.loadReports();
  }

  getLocationName(location: string | Location): string {
    if (typeof location === 'string') {
      const loc = this.locations().find(l => l._id === location);
      return loc?.name || 'Nieznany lokal';
    }
    return location.name;
  }

  getLocationId(location: string | Location): string {
    if (typeof location === 'string') return location;
    return location._id;
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

  formatPrice(price: number, currency: string = 'PLN'): string {
    return `${price.toFixed(2)} ${currency}`;
  }

  async loadComparison(): Promise<void> {
    this.loadingComparison.set(true);
    try {
      // Przeładuj raporty z filtrami porównania
      const params: any = {};
      if (this.comparisonFilter.dateFrom) params.dateFrom = this.comparisonFilter.dateFrom;
      if (this.comparisonFilter.dateTo) params.dateTo = this.comparisonFilter.dateTo;

      const res = await firstValueFrom(
        this.api.get<{ success: boolean; count: number; data: DailyReport[] }>('/daily-reports', params)
      );
      if (res.success) {
        this.dailyReports.set(res.data);
      }
    } catch (error) {
      console.error('Błąd ładowania zestawienia:', error);
    } finally {
      this.loadingComparison.set(false);
    }
  }

  getFilteredReports(): DailyReport[] {
    let reports = this.dailyReports();
    
    if (this.comparisonFilter.dateFrom) {
      const from = new Date(this.comparisonFilter.dateFrom);
      from.setHours(0, 0, 0, 0);
      reports = reports.filter(r => new Date(r.date) >= from);
    }
    
    if (this.comparisonFilter.dateTo) {
      const to = new Date(this.comparisonFilter.dateTo);
      to.setHours(23, 59, 59, 999);
      reports = reports.filter(r => new Date(r.date) <= to);
    }
    
    return reports;
  }

  getLocationReports(locationId: string): DailyReport[] {
    return this.getFilteredReports().filter(r => 
      this.getLocationId(r.location) === locationId
    );
  }

  getLocationTotalRevenue(locationId: string): number {
    return this.getLocationReports(locationId).reduce((sum, r) => sum + (r.revenue || 0), 0);
  }

  getLocationAverageRevenue(locationId: string): number {
    const reports = this.getLocationReports(locationId);
    if (reports.length === 0) return 0;
    return this.getLocationTotalRevenue(locationId) / reports.length;
  }

  getLocationTotalGuests(locationId: string): number {
    return this.getLocationReports(locationId).reduce((sum, r) => 
      sum + (r.statistics.totalGuests || 0), 0
    );
  }

  getLocationTotalReservations(locationId: string): number {
    return this.getLocationReports(locationId).reduce((sum, r) => 
      sum + (r.statistics.totalReservations || 0), 0
    );
  }

  getLocationAverageRevenuePerGuest(locationId: string): number {
    const guests = this.getLocationTotalGuests(locationId);
    const revenue = this.getLocationTotalRevenue(locationId);
    if (guests === 0) return 0;
    return revenue / guests;
  }

  getLocationAverageGuestsPerReservation(locationId: string): number {
    const reservations = this.getLocationTotalReservations(locationId);
    const guests = this.getLocationTotalGuests(locationId);
    if (reservations === 0) return 0;
    return guests / reservations;
  }

  getLocationReportDays(locationId: string): number {
    return this.getLocationReports(locationId).length;
  }

  getTotalRevenue(): number {
    return this.getFilteredReports().reduce((sum, r) => sum + (r.revenue || 0), 0);
  }

  getAverageRevenue(): number {
    const reports = this.getFilteredReports();
    if (reports.length === 0) return 0;
    const uniqueDates = new Set(reports.map(r => r.date.split('T')[0]));
    return this.getTotalRevenue() / uniqueDates.size;
  }

  getTotalGuests(): number {
    return this.getFilteredReports().reduce((sum, r) => 
      sum + (r.statistics.totalGuests || 0), 0
    );
  }

  getTotalReservations(): number {
    return this.getFilteredReports().reduce((sum, r) => 
      sum + (r.statistics.totalReservations || 0), 0
    );
  }

  getAverageRevenuePerGuest(): number {
    const guests = this.getTotalGuests();
    const revenue = this.getTotalRevenue();
    if (guests === 0) return 0;
    return revenue / guests;
  }

  getAverageGuestsPerReservation(): number {
    const reservations = this.getTotalReservations();
    const guests = this.getTotalGuests();
    if (reservations === 0) return 0;
    return guests / reservations;
  }

  getTotalReportDays(): number {
    const uniqueDates = new Set(this.getFilteredReports().map(r => r.date.split('T')[0]));
    return uniqueDates.size;
  }

  getRevenuePercentage(locationId: string): number {
    const total = this.getTotalRevenue();
    if (total === 0) return 0;
    return (this.getLocationTotalRevenue(locationId) / total) * 100;
  }

  getGuestsPercentage(locationId: string): number {
    const total = this.getTotalGuests();
    if (total === 0) return 0;
    return (this.getLocationTotalGuests(locationId) / total) * 100;
  }

  getReservationsPercentage(locationId: string): number {
    const total = this.getTotalReservations();
    if (total === 0) return 0;
    return (this.getLocationTotalReservations(locationId) / total) * 100;
  }
}
