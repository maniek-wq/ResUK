import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

interface Admin {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'staff';
  locations: any[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface AdminFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'staff';
  locations: string[];
}

@Component({
  selector: 'app-admins-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-warm-100 flex overflow-x-hidden">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="flex-1 md:ml-64 min-w-0">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-warm-200 px-3 sm:px-4 md:px-8 py-3 sm:py-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <button 
                (click)="sidebarService.toggle()"
                class="md:hidden p-1.5 sm:p-2 text-stone-600 hover:text-stone-800 hover:bg-warm-50 rounded-sm transition-colors flex-shrink-0"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <h1 class="font-display text-base sm:text-xl md:text-2xl text-stone-800 font-semibold truncate">
                Zarządzanie Administratorami
              </h1>
            </div>
            <button
              (click)="showAddForm()"
              class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
            >
              + Dodaj admina
            </button>
          </div>
        </header>

        <!-- Content -->
        <main class="p-3 sm:p-4 md:p-8">
          <!-- Add/Edit Form -->
          <div *ngIf="isFormVisible()" class="bg-white rounded-sm shadow-sm p-4 md:p-6 mb-6">
            <h2 class="font-display text-lg text-stone-800 font-semibold mb-4">
              {{ editingAdmin() ? 'Edytuj administratora' : 'Dodaj nowego administratora' }}
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Email *</label>
                <input 
                  type="email"
                  [(ngModel)]="formData.email"
                  class="form-input text-sm"
                  placeholder="admin@restauracja.pl"
                  required
                  [disabled]="!!editingAdmin()"
                >
              </div>
              
              <div *ngIf="!editingAdmin()">
                <label class="block text-stone-600 text-sm font-medium mb-2">Hasło *</label>
                <input 
                  type="password"
                  [(ngModel)]="formData.password"
                  class="form-input text-sm"
                  placeholder="Min. 12 znaków, wielka/mała litera, cyfra, znak specjalny"
                  required
                >
                <p class="text-xs text-stone-500 mt-1">
                  Hasło musi zawierać min. 12 znaków, wielką literę, małą literę, cyfrę i znak specjalny
                </p>
              </div>
              
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Imię *</label>
                <input 
                  type="text"
                  [(ngModel)]="formData.firstName"
                  class="form-input text-sm"
                  placeholder="Jan"
                  required
                >
              </div>
              
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Nazwisko *</label>
                <input 
                  type="text"
                  [(ngModel)]="formData.lastName"
                  class="form-input text-sm"
                  placeholder="Kowalski"
                  required
                >
              </div>
              
              <div>
                <label class="block text-stone-600 text-sm font-medium mb-2">Rola *</label>
                <select 
                  [(ngModel)]="formData.role"
                  class="form-input text-sm"
                  required
                >
                  <option value="staff">Personel (staff)</option>
                  <option value="manager">Menedżer (manager)</option>
                  <option value="admin">Administrator (admin)</option>
                </select>
                <p class="text-xs text-stone-500 mt-1">
                  Admin = pełny dostęp, Manager = zarządzanie rezerwacjami, Staff = podstawowe operacje
                </p>
              </div>
            </div>
            
            <div *ngIf="errorMessage()" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm">
              <p class="text-red-700 text-sm">{{ errorMessage() }}</p>
            </div>
            
            <div *ngIf="successMessage()" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-sm">
              <p class="text-green-700 text-sm">{{ successMessage() }}</p>
            </div>
            
            <div class="flex justify-end gap-2">
              <button
                (click)="cancelForm()"
                class="px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded hover:bg-stone-300 transition-colors"
              >
                Anuluj
              </button>
              <button
                (click)="saveAdmin()"
                [disabled]="submitting()"
                class="btn-primary text-sm px-6 disabled:opacity-50"
              >
                {{ submitting() ? 'Zapisywanie...' : 'Zapisz' }}
              </button>
            </div>
          </div>

          <!-- Admins List -->
          <div class="bg-white rounded-sm shadow-sm">
            <div *ngIf="loading()" class="p-12 text-center">
              <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
            </div>

            <div *ngIf="!loading() && admins().length === 0" class="p-12 text-center text-stone-500">
              <p>Brak administratorów</p>
            </div>

            <div *ngIf="!loading() && admins().length > 0" class="p-3 sm:p-4 flex flex-col gap-3">
              <div 
                *ngFor="let admin of admins()"
                class="p-4 border border-warm-200 rounded-sm hover:shadow-md transition-shadow"
                [class.opacity-50]="!admin.isActive"
              >
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="font-display text-base md:text-lg text-stone-800 font-semibold">
                        {{ admin.firstName }} {{ admin.lastName }}
                      </h3>
                      <span 
                        class="px-2 py-0.5 text-xs rounded-full"
                        [class]="getRoleBadgeClass(admin.role)"
                      >
                        {{ getRoleLabel(admin.role) }}
                      </span>
                      <span 
                        *ngIf="!admin.isActive"
                        class="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800"
                      >
                        Nieaktywny
                      </span>
                    </div>
                    
                    <p class="text-stone-600 text-sm mb-2">{{ admin.email }}</p>
                    
                    <div class="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span *ngIf="admin.lastLogin">
                        Ostatnie logowanie: {{ formatDate(admin.lastLogin) }}
                      </span>
                      <span>
                        Utworzono: {{ formatDate(admin.createdAt) }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex gap-2">
                    <button
                      (click)="editAdmin(admin)"
                      class="px-3 py-2 bg-stone-200 text-stone-700 text-xs sm:text-sm rounded hover:bg-stone-300 transition-colors"
                    >
                      Edytuj
                    </button>
                    <button
                      *ngIf="admin.isActive && admin._id !== currentAdminId()"
                      (click)="deactivateAdmin(admin._id)"
                      class="px-3 py-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded hover:bg-yellow-200 transition-colors"
                    >
                      Dezaktywuj
                    </button>
                    <button
                      *ngIf="!admin.isActive"
                      (click)="activateAdmin(admin._id)"
                      class="px-3 py-2 bg-green-100 text-green-800 text-xs sm:text-sm rounded hover:bg-green-200 transition-colors"
                    >
                      Aktywuj
                    </button>
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
export class AdminsManagementComponent implements OnInit {
  admins = signal<Admin[]>([]);
  loading = signal(false);
  submitting = signal(false);
  isFormVisible = signal(false);
  editingAdmin = signal<Admin | null>(null);
  errorMessage = signal('');
  successMessage = signal('');
  currentAdminId = signal('');

  formData: AdminFormData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'staff',
    locations: []
  };

  constructor(
    public sidebarService: SidebarService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
    this.loadCurrentAdmin();
  }

  async loadAdmins(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.api.get<{ success: boolean; count: number; data: Admin[] }>('/admins')
      );
      if (res.success) {
        this.admins.set(res.data);
      }
    } catch (error: any) {
      console.error('Error loading admins:', error);
      this.errorMessage.set('Błąd ładowania administratorów');
    } finally {
      this.loading.set(false);
    }
  }

  async loadCurrentAdmin(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.api.get<{ success: boolean; data: Admin }>('/admins/me')
      );
      if (res.success) {
        this.currentAdminId.set(res.data._id);
      }
    } catch (error) {
      console.error('Error loading current admin:', error);
    }
  }

  showAddForm(): void {
    this.resetForm();
    this.editingAdmin.set(null);
    this.isFormVisible.set(true);
  }

  editAdmin(admin: Admin): void {
    this.editingAdmin.set(admin);
    this.formData = {
      email: admin.email,
      password: '',
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      locations: admin.locations?.map(l => l._id) || []
    };
    this.isFormVisible.set(true);
  }

  cancelForm(): void {
    this.isFormVisible.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'staff',
      locations: []
    };
    this.errorMessage.set('');
    this.successMessage.set('');
    this.editingAdmin.set(null);
  }

  async saveAdmin(): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      if (this.editingAdmin()) {
        // Update
        const res = await firstValueFrom(
          this.api.put<{ success: boolean; message: string; data: Admin }>(
            `/admins/${this.editingAdmin()?._id}`,
            {
              firstName: this.formData.firstName,
              lastName: this.formData.lastName,
              role: this.formData.role,
              locations: this.formData.locations
            }
          )
        );
        if (res.success) {
          this.successMessage.set('Administrator zaktualizowany pomyślnie');
          await this.loadAdmins();
          setTimeout(() => this.cancelForm(), 2000);
        }
      } else {
        // Create
        const res = await firstValueFrom(
          this.api.post<{ success: boolean; message: string; data: Admin }>(
            '/admins',
            this.formData
          )
        );
        if (res.success) {
          this.successMessage.set('Administrator utworzony pomyślnie');
          await this.loadAdmins();
          setTimeout(() => this.cancelForm(), 2000);
        }
      }
    } catch (error: any) {
      this.errorMessage.set(error?.error?.message || 'Błąd zapisu');
    } finally {
      this.submitting.set(false);
    }
  }

  async deactivateAdmin(adminId: string): Promise<void> {
    if (!confirm('Czy na pewno chcesz dezaktywować tego administratora?')) {
      return;
    }

    try {
      const res = await firstValueFrom(
        this.api.delete<{ success: boolean; message: string }>(`/admins/${adminId}`)
      );
      if (res.success) {
        await this.loadAdmins();
      }
    } catch (error: any) {
      alert(error?.error?.message || 'Błąd dezaktywacji');
    }
  }

  async activateAdmin(adminId: string): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.api.put<{ success: boolean; message: string }>(
          `/admins/${adminId}`,
          { isActive: true }
        )
      );
      if (res.success) {
        await this.loadAdmins();
      }
    } catch (error: any) {
      alert(error?.error?.message || 'Błąd aktywacji');
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Menedżer';
      case 'staff':
        return 'Personel';
      default:
        return role;
    }
  }

  formatDate(dateStr: string | Date): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
