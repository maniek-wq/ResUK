import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { MenuService, MenuCategory, MenuItem } from '../../../core/services/menu.service';
import { filter, Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-warm-100 flex overflow-x-hidden">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="flex-1 md:ml-64 min-w-0">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-warm-200 px-3 sm:px-4 md:px-8 py-3 sm:py-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <!-- Hamburger button (mobile only) -->
              <button 
                (click)="sidebarService.toggle()"
                class="md:hidden p-1.5 sm:p-2 text-stone-600 hover:text-stone-800 hover:bg-warm-50 rounded-sm transition-colors flex-shrink-0"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <h1 class="font-display text-base sm:text-xl md:text-2xl text-stone-800 font-semibold truncate">Zarządzanie Menu</h1>
            </div>
            <div class="flex gap-1.5 sm:gap-2 flex-shrink-0">
              <a routerLink="/admin/menu/categories/new" class="btn-primary text-[11px] sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap">
                + Kat.
              </a>
              <a routerLink="/admin/menu/items/new" class="btn-primary text-[11px] sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap">
                + Poz.
              </a>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-3 sm:p-4 md:p-8">
          <!-- Stats -->
          <div class="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div class="bg-white p-2 sm:p-4 md:p-6 rounded-sm shadow-sm min-w-0">
              <h3 class="text-stone-500 text-[10px] sm:text-xs md:text-sm font-medium mb-1 truncate">Kategorie</h3>
              <p class="font-display text-lg sm:text-2xl md:text-3xl text-stone-800 font-bold">{{ categories().length }}</p>
              <p class="text-stone-500 text-[10px] sm:text-xs md:text-sm truncate">{{ activeCategories().length }} aktywnych</p>
            </div>
            <div class="bg-white p-2 sm:p-4 md:p-6 rounded-sm shadow-sm min-w-0">
              <h3 class="text-stone-500 text-[10px] sm:text-xs md:text-sm font-medium mb-1 truncate">Pozycje</h3>
              <p class="font-display text-lg sm:text-2xl md:text-3xl text-stone-800 font-bold">{{ items().length }}</p>
              <p class="text-stone-500 text-[10px] sm:text-xs md:text-sm truncate">{{ availableItems().length }} dostępnych</p>
            </div>
            <div class="bg-white p-2 sm:p-4 md:p-6 rounded-sm shadow-sm min-w-0">
              <h3 class="text-stone-500 text-[10px] sm:text-xs md:text-sm font-medium mb-1 truncate">Nieaktywne</h3>
              <p class="font-display text-lg sm:text-2xl md:text-3xl text-stone-800 font-bold">
                {{ inactiveCategories().length + unavailableItems().length }}
              </p>
              <p class="text-stone-500 text-[10px] sm:text-xs md:text-sm truncate">Wymaga uwagi</p>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="bg-white rounded-sm shadow-sm mb-4 sm:mb-6">
            <div class="border-b border-warm-200">
              <nav class="flex -mb-px">
                <button 
                  (click)="activeTab.set('categories')"
                  class="flex-1 sm:flex-none px-4 md:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                  [class]="activeTab() === 'categories'
                           ? 'border-brown-700 text-brown-700'
                           : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'"
                >
                  Kategorie
                </button>
                <button 
                  (click)="activeTab.set('items')"
                  class="flex-1 sm:flex-none px-4 md:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                  [class]="activeTab() === 'items'
                           ? 'border-brown-700 text-brown-700'
                           : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'"
                >
                  Pozycje menu
                </button>
              </nav>
            </div>

            <!-- Categories Tab -->
            <div *ngIf="activeTab() === 'categories'" class="p-3 sm:p-4 md:p-6">
              <div *ngIf="loading()" class="text-center py-12">
                <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
              </div>

              <div *ngIf="!loading() && categories().length === 0" class="text-center py-12 text-stone-500">
                <p class="mb-4">Brak kategorii</p>
                <a routerLink="/admin/menu/categories/new" class="btn-primary text-sm inline-block">
                  Utwórz pierwszą kategorię
                </a>
              </div>

              <div *ngIf="!loading() && categories().length > 0" class="space-y-3">
                <div 
                  *ngFor="let category of categories()"
                  class="p-3 sm:p-4 md:p-6 border border-warm-200 rounded-sm hover:shadow-md transition-shadow"
                >
                  <!-- Header: Name + Badge -->
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <h3 class="font-display text-sm sm:text-base md:text-lg text-stone-800 font-semibold">
                      {{ category.name }}
                    </h3>
                    <span 
                      class="px-2 py-0.5 text-[10px] sm:text-xs rounded-full flex-shrink-0"
                      [class]="category.isActive 
                               ? 'bg-green-100 text-green-800' 
                               : 'bg-stone-100 text-stone-800'"
                    >
                      {{ category.isActive ? 'Aktywna' : 'Nieaktywna' }}
                    </span>
                  </div>
                  
                  <!-- Description -->
                  <p *ngIf="category.description" class="text-stone-600 text-xs sm:text-sm mb-2 line-clamp-2">
                    {{ category.description }}
                  </p>
                  
                  <!-- Stats -->
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-stone-500 mb-3">
                    <span>{{ category.itemCount || 0 }} pozycji</span>
                    <span class="text-stone-300">•</span>
                    <span>{{ category.activeItemCount || 0 }} aktywnych</span>
                    <span class="text-stone-300">•</span>
                    <span>Kolejność: {{ category.order }}</span>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex gap-2">
                    <a 
                      [routerLink]="['/admin/menu/categories', category._id]"
                      class="flex-1 sm:flex-none px-3 py-1.5 bg-stone-200 text-stone-700 text-xs sm:text-sm rounded hover:bg-stone-300 transition-colors text-center"
                    >
                      Edytuj
                    </a>
                    <button 
                      (click)="toggleCategory(category._id)"
                      class="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded transition-colors"
                      [class]="category.isActive
                               ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                               : 'bg-green-100 text-green-800 hover:bg-green-200'"
                    >
                      {{ category.isActive ? 'Deaktywuj' : 'Aktywuj' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Tab -->
            <div *ngIf="activeTab() === 'items'" class="p-3 sm:p-4 md:p-6">
              <!-- Filters -->
              <div class="mb-4 flex gap-2 sm:gap-3">
                <select 
                  [ngModel]="selectedCategoryFilter()"
                  (ngModelChange)="selectedCategoryFilter.set($event)"
                  class="form-input text-xs sm:text-sm flex-1 sm:flex-none sm:w-44"
                >
                  <option value="">Wszystkie kategorie</option>
                  <option *ngFor="let cat of categories()" [value]="cat._id">{{ cat.name }}</option>
                </select>
                <select 
                  [ngModel]="availabilityFilter()"
                  (ngModelChange)="availabilityFilter.set($event)"
                  class="form-input text-xs sm:text-sm flex-1 sm:flex-none sm:w-36"
                >
                  <option value="">Wszystkie</option>
                  <option value="available">Dostępne</option>
                  <option value="unavailable">Niedostępne</option>
                </select>
              </div>

              <div *ngIf="loading()" class="text-center py-12">
                <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
              </div>

              <div *ngIf="!loading() && filteredItems().length === 0" class="text-center py-12 text-stone-500">
                <p class="mb-4">Brak pozycji menu</p>
                <a routerLink="/admin/menu/items/new" class="btn-primary text-sm inline-block">
                  Dodaj pierwszą pozycję
                </a>
              </div>

              <div *ngIf="!loading() && filteredItems().length > 0" class="space-y-3">
                <div 
                  *ngFor="let item of filteredItems()"
                  class="p-3 sm:p-4 md:p-6 border border-warm-200 rounded-sm hover:shadow-md transition-shadow"
                >
                  <!-- Header: Name + Badge + Price -->
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-display text-sm sm:text-base md:text-lg text-stone-800 font-semibold">
                        {{ item.name }}
                      </h3>
                      <span class="font-semibold text-brown-700 text-xs sm:text-sm">
                        {{ menuService.formatPrice(item.price, item.currency) }}
                      </span>
                    </div>
                    <span 
                      class="px-2 py-0.5 text-[10px] sm:text-xs rounded-full flex-shrink-0"
                      [class]="item.isAvailable 
                               ? 'bg-green-100 text-green-800' 
                               : 'bg-stone-100 text-stone-800'"
                    >
                      {{ item.isAvailable ? 'Dostępne' : 'Niedostępne' }}
                    </span>
                  </div>
                  
                  <!-- Description -->
                  <p *ngIf="item.description" class="text-stone-600 text-xs sm:text-sm mb-2 line-clamp-2">
                    {{ item.description }}
                  </p>
                  
                  <!-- Meta info -->
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-stone-500 mb-2">
                    <span *ngIf="item.prepTime">{{ item.prepTime }} min</span>
                    <span *ngIf="item.prepTime" class="text-stone-300">•</span>
                    <span>{{ getCategoryName(item.category) }}</span>
                  </div>
                  
                  <!-- Tags -->
                  <div *ngIf="item.tags && item.tags.length > 0" class="flex gap-1.5 flex-wrap mb-3">
                    <span 
                      *ngFor="let tag of item.tags"
                      class="px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-warm-200 text-stone-700"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex gap-2">
                    <a 
                      [routerLink]="['/admin/menu/items', item._id]"
                      class="flex-1 sm:flex-none px-3 py-1.5 bg-stone-200 text-stone-700 text-xs sm:text-sm rounded hover:bg-stone-300 transition-colors text-center"
                    >
                      Edytuj
                    </a>
                    <button 
                      (click)="toggleItemAvailability(item._id)"
                      class="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded transition-colors"
                      [class]="item.isAvailable
                               ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                               : 'bg-green-100 text-green-800 hover:bg-green-200'"
                    >
                      {{ item.isAvailable ? 'Ukryj' : 'Pokaż' }}
                    </button>
                    <button 
                      (click)="duplicateItem(item._id)"
                      class="flex-1 sm:flex-none px-3 py-1.5 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded hover:bg-blue-200 transition-colors"
                    >
                      Duplikuj
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
export class MenuManagementComponent implements OnInit, OnDestroy {
  activeTab = signal<'categories' | 'items'>('categories');
  loading = signal(false);
  categories = signal<MenuCategory[]>([]);
  items = signal<MenuItem[]>([]);
  selectedCategoryFilter = signal<string>('');
  availabilityFilter = signal<string>('');
  private routerSubscription?: Subscription;

  filteredItems = computed(() => {
    let filtered = this.items();
    
    // Filtruj po kategorii
    const categoryFilter = this.selectedCategoryFilter();
    if (categoryFilter) {
      filtered = filtered.filter(item => {
        const categoryId = typeof item.category === 'string' ? item.category : item.category._id;
        return categoryId === categoryFilter;
      });
    }
    
    // Filtruj po dostępności
    const availability = this.availabilityFilter();
    if (availability === 'available') {
      filtered = filtered.filter(item => item.isAvailable);
    } else if (availability === 'unavailable') {
      filtered = filtered.filter(item => !item.isAvailable);
    }
    
    return filtered.sort((a, b) => {
      // Sortuj po kategorii, potem po kolejności
      const catA = typeof a.category === 'string' ? a.category : a.category._id;
      const catB = typeof b.category === 'string' ? b.category : b.category._id;
      if (catA !== catB) {
        const catAOrder = this.getCategoryOrder(catA);
        const catBOrder = this.getCategoryOrder(catB);
        return catAOrder - catBOrder;
      }
      return a.order - b.order;
    });
  });

  activeCategories = computed(() => 
    this.categories().filter(cat => cat.isActive)
  );

  availableItems = computed(() => 
    this.items().filter(item => item.isAvailable)
  );

  inactiveCategories = computed(() => 
    this.categories().filter(cat => !cat.isActive)
  );

  unavailableItems = computed(() => 
    this.items().filter(item => !item.isAvailable)
  );

  constructor(
    public menuService: MenuService,
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadData();
    
    // Odśwież dane po każdej nawigacji (np. po powrocie z edytora)
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Odśwież tylko jeśli jesteśmy na tej samej stronie (/admin/menu)
      if (event.url === '/admin/menu' || event.url.startsWith('/admin/menu?')) {
        this.loadData();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    
    try {
      // Pobierz kategorie i pozycje równolegle
      const [categoriesRes, itemsRes] = await Promise.all([
        firstValueFrom(this.menuService.getCategories(true)),
        firstValueFrom(this.menuService.getItems(undefined, true))
      ]);
      
      if (categoriesRes?.success) {
        this.categories.set(categoriesRes.data);
      }
      if (itemsRes?.success) {
        this.items.set(itemsRes.data);
      }
      this.loading.set(false);
    } catch (error: any) {
      console.error('Error loading menu data:', error);
      this.loading.set(false);
      // Jeśli błąd 401, przekieruj do logowania
      if (error?.status === 401 || error?.status === 403) {
        window.location.href = '/admin/login';
      }
    }
  }

  filterItems(): void {
    // Computed signal automatycznie się zaktualizuje dzięki użyciu signal dla filtrów
    // Metoda pozostaje dla kompatybilności, ale nie jest już potrzebna
  }

  toggleCategory(id: string): void {
    this.menuService.toggleCategory(id).subscribe(res => {
      if (res.success) {
        this.loadData();
      }
    });
  }

  toggleItemAvailability(id: string): void {
    this.menuService.toggleItemAvailability(id).subscribe(res => {
      if (res.success) {
        const items = this.items();
        const index = items.findIndex(i => i._id === id);
        if (index !== -1) {
          items[index] = res.data;
          this.items.set([...items]);
        }
      }
    });
  }

  duplicateItem(id: string): void {
    this.menuService.duplicateItem(id).subscribe(res => {
      if (res.success) {
        this.loadData();
      }
    });
  }

  getCategoryName(category: string | MenuCategory): string {
    if (typeof category === 'string') {
      const cat = this.categories().find(c => c._id === category);
      return cat?.name || 'Nieznana';
    }
    return category.name;
  }

  getCategoryOrder(categoryId: string): number {
    const cat = this.categories().find(c => c._id === categoryId);
    return cat?.order || 999;
  }
}
