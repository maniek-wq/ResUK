import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { MenuService, MenuItem, MenuCategory, CreateMenuItemDto } from '../../../core/services/menu.service';

@Component({
  selector: 'app-item-editor',
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
                <h1 class="font-display text-xl md:text-2xl text-stone-800 font-semibold">
                  {{ isEditMode() ? 'Edytuj pozycję menu' : 'Dodaj pozycję menu' }}
                </h1>
              </div>
            </div>
            <a routerLink="/admin/menu" class="text-stone-500 hover:text-stone-700 flex-shrink-0 whitespace-nowrap hidden md:inline">
              ← Powrót do menu
            </a>
          </div>
        </header>

        <!-- Form -->
        <main class="p-4 md:p-8">
          <div class="max-w-3xl mx-auto">
            <div class="bg-white rounded-sm shadow-sm p-8">
              <form (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Kategoria -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">
                    Kategoria *
                  </label>
                  <select 
                    [(ngModel)]="formData.category"
                    name="category"
                    class="form-input"
                    required
                  >
                    <option value="">Wybierz kategorię</option>
                    <option *ngFor="let cat of categories()" [value]="cat._id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <!-- Nazwa -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">
                    Nazwa dania *
                  </label>
                  <input 
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    class="form-input"
                    placeholder="np. Polędwica wołowa"
                    required
                    maxlength="100"
                  >
                  <p class="text-stone-500 text-xs mt-1">{{ formData.name.length }}/100 znaków</p>
                </div>

                <!-- Opis -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">
                    Opis
                  </label>
                  <textarea 
                    [(ngModel)]="formData.description"
                    name="description"
                    rows="4"
                    class="form-input resize-none"
                    placeholder="Opis dania..."
                    maxlength="500"
                  ></textarea>
                  <p class="text-stone-500 text-xs mt-1">{{ (formData.description || '').length }}/500 znaków</p>
                </div>

                <!-- Cena -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-stone-700 text-sm font-semibold mb-2">
                      Cena (PLN) *
                    </label>
                    <input 
                      type="number"
                      [(ngModel)]="formData.price"
                      name="price"
                      step="0.01"
                      min="0.01"
                      max="9999.99"
                      class="form-input"
                      placeholder="48.00"
                      required
                    >
                  </div>
                  <div>
                    <label class="block text-stone-700 text-sm font-semibold mb-2">
                      Waluta
                    </label>
                    <input 
                      type="text"
                      [(ngModel)]="formData.currency"
                      name="currency"
                      class="form-input"
                      placeholder="PLN"
                      maxlength="3"
                      readonly
                    >
                  </div>
                </div>

                <!-- Tagi -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-3">
                    Tagi
                  </label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label class="flex items-center gap-2 cursor-pointer p-3 border border-warm-200 rounded-sm hover:bg-warm-50">
                      <input 
                        type="checkbox"
                        [(ngModel)]="tags.vege"
                        name="tag-vege"
                        (change)="updateTags()"
                        class="w-4 h-4 text-brown-700 border-stone-300 rounded"
                      >
                      <span class="text-sm">Vege</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-3 border border-warm-200 rounded-sm hover:bg-warm-50">
                      <input 
                        type="checkbox"
                        [(ngModel)]="tags.ostre"
                        name="tag-ostre"
                        (change)="updateTags()"
                        class="w-4 h-4 text-brown-700 border-stone-300 rounded"
                      >
                      <span class="text-sm">Ostre</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-3 border border-warm-200 rounded-sm hover:bg-warm-50">
                      <input 
                        type="checkbox"
                        [(ngModel)]="tags.szefPoleca"
                        name="tag-szefPoleca"
                        (change)="updateTags()"
                        class="w-4 h-4 text-brown-700 border-stone-300 rounded"
                      >
                      <span class="text-sm">Szef poleca</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-3 border border-warm-200 rounded-sm hover:bg-warm-50">
                      <input 
                        type="checkbox"
                        [(ngModel)]="tags.glutenFree"
                        name="tag-glutenFree"
                        (change)="updateTags()"
                        class="w-4 h-4 text-brown-700 border-stone-300 rounded"
                      >
                      <span class="text-sm">Bez glutenu</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-3 border border-warm-200 rounded-sm hover:bg-warm-50">
                      <input 
                        type="checkbox"
                        [(ngModel)]="tags.weganskie"
                        name="tag-weganskie"
                        (change)="updateTags()"
                        class="w-4 h-4 text-brown-700 border-stone-300 rounded"
                      >
                      <span class="text-sm">Wegańskie</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-3 border border-warm-200 rounded-sm hover:bg-warm-50">
                      <input 
                        type="checkbox"
                        [(ngModel)]="tags.wegetarianskie"
                        name="tag-wegetarianskie"
                        (change)="updateTags()"
                        class="w-4 h-4 text-brown-700 border-stone-300 rounded"
                      >
                      <span class="text-sm">Wegetariańskie</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-3 border border-warm-200 rounded-sm hover:bg-warm-50">
                      <input 
                        type="checkbox"
                        [(ngModel)]="tags.bezLaktozy"
                        name="tag-bezLaktozy"
                        (change)="updateTags()"
                        class="w-4 h-4 text-brown-700 border-stone-300 rounded"
                      >
                      <span class="text-sm">Bez laktozy</span>
                    </label>
                  </div>
                </div>

                <!-- Czas przygotowania -->
                <div>
                  <label class="block text-stone-700 text-sm font-semibold mb-2">
                    Czas przygotowania (minuty, opcjonalne)
                  </label>
                  <input 
                    type="number"
                    [(ngModel)]="formData.prepTime"
                    name="prepTime"
                    class="form-input w-32"
                    min="1"
                    max="300"
                    placeholder="np. 30"
                  >
                </div>

                <!-- Status -->
                <div>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      [(ngModel)]="formData.isAvailable"
                      name="isAvailable"
                      class="w-5 h-5 text-brown-700 border-stone-300 rounded focus:ring-brown-500"
                    >
                    <span class="text-stone-700 text-sm font-medium">Pozycja dostępna (widoczna dla klientów)</span>
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
                    [disabled]="isSubmitting() || !formData.name || !formData.category || !formData.price"
                    class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span *ngIf="!isSubmitting()">{{ isEditMode() ? 'Zapisz zmiany' : 'Utwórz pozycję' }}</span>
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
export class ItemEditorComponent implements OnInit {
  isEditMode = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  categories = signal<MenuCategory[]>([]);
  
  tags = {
    vege: false,
    ostre: false,
    szefPoleca: false,
    glutenFree: false,
    weganskie: false,
    wegetarianskie: false,
    bezLaktozy: false
  };
  
  formData: CreateMenuItemDto = {
    category: '',
    name: '',
    description: '',
    price: 0,
    currency: 'PLN',
    tags: [],
    allergens: [],
    imageUrl: '',
    isAvailable: true,
    prepTime: undefined
  };

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    public router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.loadItem(id);
    }
  }

  loadCategories(): void {
    this.menuService.getCategories(true).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data);
        }
      }
    });
  }

  loadItem(id: string): void {
    this.menuService.getItem(id).subscribe({
      next: (res) => {
        if (res.success) {
          const item = res.data;
          this.formData = {
            category: typeof item.category === 'string' ? item.category : item.category._id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            currency: item.currency || 'PLN',
            tags: item.tags || [],
            allergens: item.allergens || [],
            imageUrl: item.imageUrl || '',
            isAvailable: item.isAvailable,
            prepTime: item.prepTime
          };
          
          // Ustaw checkboxy tagów
          this.tags = {
            vege: item.tags?.includes('vege') || false,
            ostre: item.tags?.includes('ostre') || false,
            szefPoleca: item.tags?.includes('szef poleca') || false,
            glutenFree: item.tags?.includes('gluten-free') || false,
            weganskie: item.tags?.includes('wegańskie') || false,
            wegetarianskie: item.tags?.includes('wegetariańskie') || false,
            bezLaktozy: item.tags?.includes('bez laktozy') || false
          };
        }
      },
      error: () => {
        this.errorMessage.set('Nie udało się załadować pozycji menu');
      }
    });
  }

  updateTags(): void {
    const selectedTags: string[] = [];
    
    if (this.tags.vege) selectedTags.push('vege');
    if (this.tags.ostre) selectedTags.push('ostre');
    if (this.tags.szefPoleca) selectedTags.push('szef poleca');
    if (this.tags.glutenFree) selectedTags.push('gluten-free');
    if (this.tags.weganskie) selectedTags.push('wegańskie');
    if (this.tags.wegetarianskie) selectedTags.push('wegetariańskie');
    if (this.tags.bezLaktozy) selectedTags.push('bez laktozy');
    
    this.formData.tags = selectedTags;
  }

  onSubmit(): void {
    if (!this.formData.name || this.formData.name.trim().length < 2) {
      this.errorMessage.set('Nazwa dania musi mieć minimum 2 znaki');
      return;
    }

    if (!this.formData.category) {
      this.errorMessage.set('Wybierz kategorię');
      return;
    }

    if (!this.formData.price || this.formData.price <= 0) {
      this.errorMessage.set('Cena musi być większa od zera');
      return;
    }

    this.updateTags();
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const itemData: CreateMenuItemDto = {
      ...this.formData,
      name: this.formData.name.trim(),
      description: this.formData.description?.trim() || '',
      imageUrl: this.formData.imageUrl?.trim() || undefined,
      prepTime: this.formData.prepTime || undefined
    };

    if (this.isEditMode()) {
      const id = this.route.snapshot.params['id'];
      this.menuService.updateItem(id, itemData).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage.set('Pozycja menu została zaktualizowana!');
            setTimeout(() => {
              this.router.navigate(['/admin/menu']);
            }, 1500);
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Błąd aktualizacji pozycji menu');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.menuService.createItem(itemData).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage.set('Pozycja menu została utworzona!');
            setTimeout(() => {
              this.router.navigate(['/admin/menu']);
            }, 1500);
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Błąd tworzenia pozycji menu');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
