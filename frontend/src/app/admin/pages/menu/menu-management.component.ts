import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AdminSidebarComponent } from '../../components/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { MenuService, MenuCategory, MenuItem } from '../../../core/services/menu.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-menu-management',
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
                <h1 class="font-display text-xl md:text-2xl text-stone-800 font-semibold">Zarządzanie Menu</h1>
                <p class="text-stone-500 text-sm hidden md:block">Edycja kategorii i pozycji menu</p>
              </div>
            </div>
            <div class="flex gap-2 md:gap-4 flex-shrink-0">
              <a routerLink="/admin/menu/categories/new" class="btn-primary text-sm px-3 md:px-4 whitespace-nowrap">
                <span class="hidden md:inline">+ Dodaj kategorię</span>
                <span class="md:hidden">+ Kategoria</span>
              </a>
              <a routerLink="/admin/menu/items/new" class="btn-primary text-sm px-3 md:px-4 whitespace-nowrap">
                <span class="hidden md:inline">+ Dodaj pozycję</span>
                <span class="md:hidden">+ Pozycja</span>
              </a>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 md:p-8">
          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-sm shadow-sm">
              <h3 class="text-stone-500 text-sm font-medium mb-2">Kategorie</h3>
              <p class="font-display text-3xl text-stone-800 font-bold">{{ categories().length }}</p>
              <p class="text-stone-500 text-sm mt-1">{{ activeCategories().length }} aktywnych</p>
            </div>
            <div class="bg-white p-6 rounded-sm shadow-sm">
              <h3 class="text-stone-500 text-sm font-medium mb-2">Pozycje menu</h3>
              <p class="font-display text-3xl text-stone-800 font-bold">{{ items().length }}</p>
              <p class="text-stone-500 text-sm mt-1">{{ availableItems().length }} dostępnych</p>
            </div>
            <div class="bg-white p-6 rounded-sm shadow-sm">
              <h3 class="text-stone-500 text-sm font-medium mb-2">Nieaktywne</h3>
              <p class="font-display text-3xl text-stone-800 font-bold">
                {{ inactiveCategories().length + unavailableItems().length }}
              </p>
              <p class="text-stone-500 text-sm mt-1">Wymaga uwagi</p>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="bg-white rounded-sm shadow-sm mb-6">
            <div class="border-b border-warm-200">
              <nav class="flex -mb-px">
                <button 
                  (click)="activeTab.set('categories')"
                  class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
                  [class]="activeTab() === 'categories'
                           ? 'border-brown-700 text-brown-700'
                           : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'"
                >
                  Kategorie
                </button>
                <button 
                  (click)="activeTab.set('items')"
                  class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
                  [class]="activeTab() === 'items'
                           ? 'border-brown-700 text-brown-700'
                           : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'"
                >
                  Pozycje menu
                </button>
              </nav>
            </div>

            <!-- Categories Tab -->
            <div *ngIf="activeTab() === 'categories'" class="p-6">
              <div *ngIf="loading()" class="text-center py-12">
                <div class="inline-block w-8 h-8 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin"></div>
              </div>

              <div *ngIf="!loading() && categories().length === 0" class="text-center py-12 text-stone-500">
                <p class="mb-4">Brak kategorii</p>
                <a routerLink="/admin/menu/categories/new" class="btn-primary text-sm inline-block">
                  Utwórz pierwszą kategorię
                </a>
              </div>

              <div *ngIf="!loading() && categories().length > 0" class="space-y-4">
                <div 
                  *ngFor="let category of categories()"
                  class="p-6 border border-warm-200 rounded-sm hover:shadow-md transition-shadow"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-display text-lg text-stone-800 font-semibold">
                          {{ category.name }}
                        </h3>
                        <span 
                          class="px-2 py-1 text-xs rounded-full"
                          [class]="category.isActive 
                                   ? 'bg-green-100 text-green-800' 
                                   : 'bg-stone-100 text-stone-800'"
                        >
                          {{ category.isActive ? 'Aktywna' : 'Nieaktywna' }}
                        </span>
                      </div>
                      <p *ngIf="category.description" class="text-stone-600 text-sm mb-2">
                        {{ category.description }}
                      </p>
                      <div class="flex items-center gap-4 text-sm text-stone-500">
                        <span>{{ category.itemCount || 0 }} pozycji</span>
                        <span>{{ category.activeItemCount || 0 }} aktywnych</span>
                        <span>Kolejność: {{ category.order }}</span>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <a 
                        [routerLink]="['/admin/menu/categories', category._id]"
                        class="px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded hover:bg-stone-300 transition-colors"
                      >
                        Edytuj
                      </a>
                      <button 
                        (click)="toggleCategory(category._id)"
                        class="px-4 py-2 text-sm rounded transition-colors"
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
            </div>

            <!-- Items Tab -->
            <div *ngIf="activeTab() === 'items'" class="p-6">
              <!-- Filters -->
              <div class="mb-6 flex gap-4">
                <select 
                  [ngModel]="selectedCategoryFilter()"
                  (ngModelChange)="selectedCategoryFilter.set($event)"
                  class="form-input text-sm w-48"
                >
                  <option value="">Wszystkie kategorie</option>
                  <option *ngFor="let cat of categories()" [value]="cat._id">{{ cat.name }}</option>
                </select>
                <select 
                  [ngModel]="availabilityFilter()"
                  (ngModelChange)="availabilityFilter.set($event)"
                  class="form-input text-sm w-48"
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

              <div *ngIf="!loading() && filteredItems().length > 0" class="space-y-4">
                <div 
                  *ngFor="let item of filteredItems()"
                  class="p-6 border border-warm-200 rounded-sm hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-display text-lg text-stone-800 font-semibold">
                          {{ item.name }}
                        </h3>
                        <span 
                          class="px-2 py-1 text-xs rounded-full"
                          [class]="item.isAvailable 
                                   ? 'bg-green-100 text-green-800' 
                                   : 'bg-stone-100 text-stone-800'"
                        >
                          {{ item.isAvailable ? 'Dostępne' : 'Niedostępne' }}
                        </span>
                      </div>
                      <p *ngIf="item.description" class="text-stone-600 text-sm mb-3">
                        {{ item.description }}
                      </p>
                      <div class="flex items-center gap-4 text-sm text-stone-500 mb-2">
                        <span class="font-semibold text-brown-700">
                          {{ menuService.formatPrice(item.price, item.currency) }}
                        </span>
                        <span *ngIf="item.prepTime">{{ item.prepTime }} min</span>
                        <span>
                          {{ getCategoryName(item.category) }}
                        </span>
                      </div>
                      <div *ngIf="item.tags && item.tags.length > 0" class="flex gap-2 flex-wrap">
                        <span 
                          *ngFor="let tag of item.tags"
                          class="px-2 py-0.5 text-xs rounded-full bg-warm-200 text-stone-700"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                    <div class="flex gap-2 flex-col">
                      <a 
                        [routerLink]="['/admin/menu/items', item._id]"
                        class="px-4 py-2 bg-stone-200 text-stone-700 text-sm rounded hover:bg-stone-300 transition-colors text-center"
                      >
                        Edytuj
                      </a>
                      <button 
                        (click)="toggleItemAvailability(item._id)"
                        class="px-4 py-2 text-sm rounded transition-colors"
                        [class]="item.isAvailable
                                 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                 : 'bg-green-100 text-green-800 hover:bg-green-200'"
                      >
                        {{ item.isAvailable ? 'Ukryj' : 'Pokaż' }}
                      </button>
                      <button 
                        (click)="duplicateItem(item._id)"
                        class="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
                      >
                        Duplikuj
                      </button>
                    </div>
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

  loadData(): void {
    this.loading.set(true);
    
    // Pobierz kategorie i pozycje równolegle
    Promise.all([
      this.menuService.getCategories(true).toPromise(),
      this.menuService.getItems(undefined, true).toPromise()
    ]).then(([categoriesRes, itemsRes]) => {
      if (categoriesRes?.success) {
        this.categories.set(categoriesRes.data);
      }
      if (itemsRes?.success) {
        this.items.set(itemsRes.data);
      }
      this.loading.set(false);
    }).catch((error) => {
      console.error('Error loading menu data:', error);
      this.loading.set(false);
      // Jeśli błąd 401, przekieruj do logowania
      if (error?.status === 401 || error?.status === 403) {
        window.location.href = '/admin/login';
      }
    });
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
