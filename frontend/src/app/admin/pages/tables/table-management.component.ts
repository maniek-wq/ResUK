import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { LocationService, Table, Location } from '../../../core/services/location.service';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

interface CreateTableDto {
  location: string;
  tableNumber: number;
  seats: number;
  zone: 'sala_glowna' | 'ogrodek' | 'vip' | 'bar';
  description?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-table-management',
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
                <h1 class="font-display text-xl md:text-2xl text-stone-800 font-semibold">Ułóż Stoliki</h1>
                <p class="text-stone-500 text-sm hidden md:block">Zarządzaj stolikami w poszczególnych lokalach</p>
              </div>
            </div>
            <button 
              (click)="openCreateModal()"
              class="btn-primary text-sm px-3 md:px-4 whitespace-nowrap"
              [disabled]="!selectedLocationId()"
            >
              <span class="hidden sm:inline">+ Dodaj stolik</span>
              <span class="sm:hidden">+ Dodaj</span>
            </button>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 md:p-8">
          <!-- Location Filter -->
          <div class="bg-white rounded-sm shadow-sm p-4 md:p-6 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="flex-1">
                <label class="block text-stone-600 text-sm font-medium mb-2">Lokal</label>
                <select 
                  [(ngModel)]="selectedLocationId"
                  (change)="onLocationChange()"
                  class="form-input text-sm w-full"
                >
                  <option value="">Wybierz lokal</option>
                  <option *ngFor="let loc of locations()" [value]="loc._id">
                    {{ loc.name }}
                  </option>
                </select>
              </div>
              <div *ngIf="selectedLocationId()" class="flex items-end sm:items-center">
                <div class="text-sm text-stone-600">
                  <p class="font-semibold text-stone-800">{{ tablesByLocation().length }} stolików</p>
                  <p class="text-xs">{{ activeTables().length }} aktywnych</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="loading()" class="text-center py-20">
            <div class="inline-block w-12 h-12 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin mb-4"></div>
            <p class="text-stone-600">Ładowanie stolików...</p>
          </div>

          <!-- Tables List -->
          <div *ngIf="!loading() && selectedLocationId() && tablesByLocation().length > 0" class="space-y-4">
            <div 
              *ngFor="let table of tablesByLocation(); trackBy: trackByTableId"
              class="bg-white rounded-sm shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 class="font-display text-base md:text-lg text-stone-800 font-semibold">
                      Stolik #{{ table.tableNumber }}
                    </h3>
                    <div class="flex flex-wrap items-center gap-2">
                      <span 
                        class="px-2 py-1 text-xs rounded-full whitespace-nowrap"
                        [class]="table.isActive 
                                 ? 'bg-green-100 text-green-800' 
                                 : 'bg-stone-100 text-stone-800'"
                      >
                        {{ table.isActive ? 'Aktywny' : 'Nieaktywny' }}
                      </span>
                      <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                        {{ table.seats }} miejsc
                      </span>
                      <span class="px-2 py-1 text-xs rounded-full bg-warm-200 text-stone-700 whitespace-nowrap">
                        {{ getZoneLabel(table.zone) }}
                      </span>
                    </div>
                  </div>
                  <p *ngIf="table.description" class="text-stone-600 text-xs md:text-sm">
                    {{ table.description }}
                  </p>
                </div>
                <div class="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                  <button 
                    (click)="openEditModal(table)"
                    class="px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded hover:bg-stone-300 transition-colors flex-1 sm:flex-none text-center"
                  >
                    Edytuj
                  </button>
                  <button 
                    (click)="toggleTable(table)"
                    class="px-4 py-2 text-sm rounded transition-colors flex-1 sm:flex-none"
                    [class]="table.isActive
                             ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                             : 'bg-green-100 text-green-800 hover:bg-green-200'"
                  >
                    {{ table.isActive ? 'Deaktywuj' : 'Aktywuj' }}
                  </button>
                  <button 
                    (click)="deleteTable(table)"
                    class="px-4 py-2 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors flex-1 sm:flex-none"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading() && selectedLocationId() && tablesByLocation().length === 0" class="text-center py-20 text-stone-500">
            <p class="mb-4">Brak stolików w wybranym lokalu</p>
            <button 
              (click)="openCreateModal()"
              class="btn-primary text-sm inline-block"
            >
              Dodaj pierwszy stolik
            </button>
          </div>

          <div *ngIf="!loading() && !selectedLocationId()" class="text-center py-20 text-stone-500">
            <p>Wybierz lokal aby zobaczyć stoliki</p>
          </div>
        </main>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal()" 
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
           (click)="closeModal()"
      >
        <div 
          class="bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="p-6 border-b border-warm-200 flex items-center justify-between">
            <h2 class="font-display text-xl text-stone-800 font-semibold">
              {{ editingTable() ? 'Edytuj stolik' : 'Dodaj stolik' }}
            </h2>
            <button (click)="closeModal()" class="text-stone-400 hover:text-stone-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <!-- Lokal (tylko przy tworzeniu) -->
            <div *ngIf="!editingTable()">
              <label class="block text-stone-600 text-sm font-medium mb-2">Lokal *</label>
              <select 
                [(ngModel)]="formData.location"
                class="form-input text-sm"
                required
              >
                <option value="">Wybierz lokal</option>
                <option *ngFor="let loc of locations()" [value]="loc._id">
                  {{ loc.name }}
                </option>
              </select>
            </div>

            <!-- Numer stolika -->
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Numer stolika *</label>
              <input 
                type="number"
                [(ngModel)]="formData.tableNumber"
                min="1"
                class="form-input text-sm"
                placeholder="np. 1"
                required
              >
              <p class="text-stone-500 text-xs mt-1">Unikalny numer w lokalu</p>
            </div>

            <!-- Liczba miejsc -->
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Liczba miejsc *</label>
              <input 
                type="number"
                [(ngModel)]="formData.seats"
                min="1"
                max="20"
                class="form-input text-sm"
                placeholder="np. 4"
                required
              >
              <p class="text-stone-500 text-xs mt-1">Od 1 do 20 miejsc</p>
            </div>

            <!-- Strefa -->
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Strefa *</label>
              <select 
                [(ngModel)]="formData.zone"
                class="form-input text-sm"
                required
              >
                <option value="sala_glowna">Sala główna</option>
                <option value="ogrodek">Ogródek</option>
                <option value="vip">VIP</option>
                <option value="bar">Bar</option>
              </select>
            </div>

            <!-- Opis -->
            <div>
              <label class="block text-stone-600 text-sm font-medium mb-2">Opis (opcjonalne)</label>
              <textarea 
                [(ngModel)]="formData.description"
                rows="3"
                class="form-input text-sm resize-none"
                placeholder="Dodatkowe informacje o stoliku..."
              ></textarea>
            </div>

            <!-- Status -->
            <div *ngIf="editingTable()">
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  [(ngModel)]="formData.isActive"
                  class="w-5 h-5 text-brown-700 border-stone-300 rounded focus:ring-brown-500"
                >
                <span class="text-stone-700 text-sm font-medium">Stolik aktywny</span>
              </label>
            </div>

            <!-- Messages -->
            <div *ngIf="errorMessage()" class="p-4 bg-red-50 border border-red-200 rounded-sm">
              <p class="text-red-700 text-sm">{{ errorMessage() }}</p>
            </div>

            <div *ngIf="successMessage()" class="p-4 bg-green-50 border border-green-200 rounded-sm">
              <p class="text-green-700 text-sm">{{ successMessage() }}</p>
            </div>
          </div>
          <div class="p-6 border-t border-warm-200 flex justify-end gap-4">
            <button 
              (click)="closeModal()"
              class="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              Anuluj
            </button>
            <button 
              (click)="saveTable()"
              [disabled]="isSubmitting() || !isFormValid()"
              class="px-6 py-2 bg-brown-700 text-white rounded-sm hover:bg-brown-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isSubmitting()">{{ editingTable() ? 'Zapisz zmiany' : 'Utwórz stolik' }}</span>
              <span *ngIf="isSubmitting()">Zapisywanie...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TableManagementComponent implements OnInit {
  locations = signal<Location[]>([]);
  allTables = signal<Table[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingTable = signal<Table | null>(null);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  selectedLocationId = signal<string>('');

  formData: CreateTableDto = {
    location: '',
    tableNumber: 1,
    seats: 4,
    zone: 'sala_glowna',
    description: '',
    isActive: true
  };

  tablesByLocation = computed(() => {
    const locationId = this.selectedLocationId();
    if (!locationId) return [];
    return this.allTables().filter(t => {
      const tableLocationId = this.getTableLocationId(t);
      return tableLocationId === locationId;
    });
  });

  activeTables = computed(() => 
    this.tablesByLocation().filter(t => t.isActive)
  );

  constructor(
    private locationService: LocationService,
    private api: ApiService,
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadLocations();
    this.loadTables();
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

  async loadTables(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.locationService.getTables());
      if (res.success) {
        this.allTables.set(res.data);
      }
    } catch (error) {
      console.error('Błąd pobierania stolików:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onLocationChange(): void {
    // Automatycznie synchronizuj z wybranym lokalem
    // Dane są już w allTables, więc tylko filtrujemy
  }

  trackByTableId(index: number, table: Table): string {
    return table._id;
  }

  getTableLocationId(table: Table): string {
    if (typeof table.location === 'string') {
      return table.location;
    }
    // TypeScript type guard - jeśli jest obiektem, ma _id
    const location = table.location as any;
    return location?._id || location?.id || '';
  }

  openCreateModal(): void {
    const locationId = this.selectedLocationId();
    if (!locationId) {
      this.errorMessage.set('Najpierw wybierz lokal');
      return;
    }

    this.editingTable.set(null);
    this.formData = {
      location: locationId,
      tableNumber: this.getNextTableNumber(locationId),
      seats: 4,
      zone: 'sala_glowna',
      description: '',
      isActive: true
    };
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showModal.set(true);
  }

  openEditModal(table: Table): void {
    this.editingTable.set(table);
    this.formData = {
      location: this.getTableLocationId(table),
      tableNumber: table.tableNumber,
      seats: table.seats,
      zone: table.zone,
      description: table.description || '',
      isActive: table.isActive
    };
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTable.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  getNextTableNumber(locationId: string): number {
    const tables = this.tablesByLocation();
    if (tables.length === 0) return 1;
    const maxNumber = Math.max(...tables.map(t => t.tableNumber));
    return maxNumber + 1;
  }

  isFormValid(): boolean {
    return !!(
      this.formData.location &&
      this.formData.tableNumber > 0 &&
      this.formData.seats >= 1 &&
      this.formData.seats <= 20 &&
      this.formData.zone
    );
  }

  async saveTable(): Promise<void> {
    if (!this.isFormValid()) {
      this.errorMessage.set('Wypełnij wszystkie wymagane pola');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      if (this.editingTable()) {
        // Update
        const tableId = this.editingTable()!._id;
        const res = await firstValueFrom(
          this.api.put<{ success: boolean; data: Table }>(`/tables/${tableId}`, this.formData)
        );
        if (res.success) {
          this.successMessage.set('Stolik został zaktualizowany!');
          await this.loadTables();
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        }
      } else {
        // Create
        const res = await firstValueFrom(
          this.api.post<{ success: boolean; data: Table }>('/tables', this.formData)
        );
        if (res.success) {
          this.successMessage.set('Stolik został utworzony!');
          await this.loadTables();
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        }
      }
    } catch (error: any) {
      this.errorMessage.set(error?.error?.message || 'Błąd zapisywania stolika');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async toggleTable(table: Table): Promise<void> {
    try {
      const updateData = { isActive: !table.isActive };
      await firstValueFrom(
        this.api.put<{ success: boolean; data: Table }>(`/tables/${table._id}`, updateData)
      );
      await this.loadTables();
    } catch (error: any) {
      alert(error?.error?.message || 'Błąd zmiany statusu stolika');
    }
  }

  async deleteTable(table: Table): Promise<void> {
    if (!confirm(`Czy na pewno chcesz usunąć stolik #${table.tableNumber}?`)) {
      return;
    }

    try {
      await firstValueFrom(
        this.api.delete<{ success: boolean; message: string }>(`/tables/${table._id}`)
      );
      await this.loadTables();
    } catch (error: any) {
      alert(error?.error?.message || 'Błąd usuwania stolika');
    }
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
}
