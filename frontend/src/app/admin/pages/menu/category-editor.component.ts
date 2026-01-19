import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { MenuService, MenuCategory, CreateCategoryDto } from '../../../core/services/menu.service';

@Component({
  selector: 'app-category-editor',
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
              <h1 class="font-display text-2xl text-stone-800 font-semibold">
                {{ isEditMode() ? 'Edytuj kategorię' : 'Dodaj kategorię' }}
              </h1>
            </div>
            <a routerLink="/admin/menu" class="text-stone-500 hover:text-stone-700">
              ← Powrót do menu
            </a>
          </div>
        </header>

        <!-- Form -->
        <main class="p-8">
          <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-sm shadow-sm p-8">
              <form (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Nazwa -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">
                    Nazwa kategorii *
                  </label>
                  <input 
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    class="form-input"
                    placeholder="np. Przystawki, Dania główne"
                    required
                    maxlength="50"
                  >
                  <p class="text-stone-500 text-xs mt-1">{{ formData.name.length }}/50 znaków</p>
                </div>

                <!-- Opis -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">
                    Opis
                  </label>
                  <textarea 
                    [(ngModel)]="formData.description"
                    name="description"
                    rows="3"
                    class="form-input resize-none"
                    placeholder="Krótki opis kategorii..."
                    maxlength="200"
                  ></textarea>
                  <p class="text-stone-500 text-xs mt-1">{{ (formData.description || '').length }}/200 znaków</p>
                </div>

                <!-- Kolejność -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">
                    Kolejność wyświetlania
                  </label>
                  <input 
                    type="number"
                    [(ngModel)]="formData.order"
                    name="order"
                    class="form-input w-32"
                    min="0"
                  >
                  <p class="text-stone-500 text-xs mt-1">Mniejsza liczba = wyższa pozycja</p>
                </div>

                <!-- Status -->
                <div>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      [(ngModel)]="formData.isActive"
                      name="isActive"
                      class="w-5 h-5 text-brown-700 border-stone-300 rounded focus:ring-brown-500"
                    >
                    <span class="text-stone-700 text-sm font-medium">Kategoria aktywna (widoczna dla klientów)</span>
                  </label>
                </div>

                <!-- URL zdjęcia -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">
                    URL zdjęcia (opcjonalne)
                  </label>
                  <input 
                    type="url"
                    [(ngModel)]="formData.imageUrl"
                    name="imageUrl"
                    class="form-input"
                    placeholder="https://example.com/image.jpg"
                  >
                </div>

                <!-- Messages -->
                <div *ngIf="errorMessage()" class="p-4 bg-red-50 border border-red-200 rounded-sm">
                  <p class="text-red-700 text-sm">{{ errorMessage() }}</p>
                </div>

                <div *ngIf="successMessage()" class="p-4 bg-green-50 border border-green-200 rounded-sm">
                  <p class="text-green-700 text-sm">{{ successMessage() }}</p>
                </div>

                <!-- Actions -->
                <div class="flex gap-4 pt-4 border-t border-warm-200">
                  <button 
                    type="button"
                    (click)="router.navigate(['/admin/menu'])"
                    class="btn-outline flex-1"
                  >
                    Anuluj
                  </button>
                  <button 
                    type="submit"
                    [disabled]="isSubmitting() || !formData.name"
                    class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span *ngIf="!isSubmitting()">{{ isEditMode() ? 'Zapisz zmiany' : 'Utwórz kategorię' }}</span>
                    <span *ngIf="isSubmitting()">Zapisywanie...</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class CategoryEditorComponent implements OnInit {
  isEditMode = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  formData: CreateCategoryDto = {
    name: '',
    description: '',
    order: 0,
    isActive: true,
    imageUrl: ''
  };

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.loadCategory(id);
    } else {
      // Tryb tworzenia - ustaw domyślną kolejność
      this.menuService.getCategories(true).subscribe(res => {
        if (res.success && res.data.length > 0) {
          const maxOrder = Math.max(...res.data.map(c => c.order));
          this.formData.order = maxOrder + 1;
        }
      });
    }
  }

  loadCategory(id: string): void {
    this.menuService.getCategory(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.formData = {
            name: res.data.name,
            description: res.data.description || '',
            order: res.data.order,
            isActive: res.data.isActive,
            imageUrl: res.data.imageUrl || ''
          };
        }
      },
      error: () => {
        this.errorMessage.set('Nie udało się załadować kategorii');
      }
    });
  }

  onSubmit(): void {
    if (!this.formData.name || this.formData.name.trim().length < 2) {
      this.errorMessage.set('Nazwa kategorii musi mieć minimum 2 znaki');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const categoryData = {
      ...this.formData,
      name: this.formData.name.trim(),
      description: this.formData.description?.trim() || '',
      imageUrl: this.formData.imageUrl?.trim() || undefined
    };

    if (this.isEditMode()) {
      const id = this.route.snapshot.params['id'];
      this.menuService.updateCategory(id, categoryData).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage.set('Kategoria została zaktualizowana!');
            setTimeout(() => {
              this.router.navigate(['/admin/menu']);
            }, 1500);
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Błąd aktualizacji kategorii');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.menuService.createCategory(categoryData).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage.set('Kategoria została utworzona!');
            setTimeout(() => {
              this.router.navigate(['/admin/menu']);
            }, 1500);
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Błąd tworzenia kategorii');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
