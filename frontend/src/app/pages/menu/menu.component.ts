import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MenuService, MenuCategory, MenuItem } from '../../core/services/menu.service';

interface MenuCategoryWithItems extends MenuCategory {
  items: MenuItem[];
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <!-- Hero -->
    <section class="relative h-[50vh] min-h-[400px] flex items-center justify-center">
      <div class="absolute inset-0 bg-stone-900">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] 
                    bg-cover bg-center opacity-50"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/60"></div>
      </div>
      
      <div class="relative z-10 text-center px-6">
        <span class="font-accent text-brown-400 text-lg tracking-wider mb-4 block">Odkryj nasze</span>
        <h1 class="font-display text-5xl md:text-6xl lg:text-7xl text-warm-100 font-bold">
          Menu
        </h1>
        <div class="w-24 h-0.5 bg-gradient-to-r from-transparent via-brown-500 to-transparent mx-auto mt-6"></div>
      </div>
    </section>

    <!-- Menu Content -->
    <section class="py-20 bg-warm-50">
      <div class="container mx-auto px-6">
        
        <!-- Loading State -->
        <div *ngIf="loading()" class="text-center py-20">
          <div class="inline-block w-12 h-12 border-4 border-brown-200 border-t-brown-700 rounded-full animate-spin mb-4"></div>
          <p class="text-stone-600">Ładowanie menu...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error() && !loading()" class="text-center py-20">
          <p class="text-red-600 mb-4">{{ error() }}</p>
          <button (click)="loadMenu()" class="btn-primary">
            Spróbuj ponownie
          </button>
        </div>

        <!-- Category Navigation -->
        <div *ngIf="!loading() && !error()" class="flex flex-wrap justify-center gap-4 mb-16">
          <button 
            *ngFor="let category of menuCategories()"
            (click)="selectCategory(category.name)"
            class="px-6 py-2 font-body text-sm tracking-wider transition-all duration-300"
            [class]="selectedCategory() === category.name 
                     ? 'bg-brown-700 text-white' 
                     : 'bg-warm-200 text-stone-700 hover:bg-warm-300'"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Menu Items -->
        <div *ngIf="!loading() && !error()" class="max-w-4xl mx-auto">
          <div *ngFor="let category of menuCategories()">
            <div *ngIf="selectedCategory() === category.name" 
                 class="mb-16 last:mb-0">
              
              <!-- Category Header -->
              <div class="text-center mb-12">
                <h2 class="font-display text-3xl md:text-4xl text-stone-800 font-semibold">
                  {{ category.name }}
                </h2>
                <p *ngIf="category.description" class="text-stone-600 mt-2">{{ category.description }}</p>
                <div class="section-divider"></div>
              </div>

              <!-- Items Grid -->
              <div class="space-y-8">
                <div *ngIf="category.items.length === 0" class="text-center py-12 text-stone-500">
                  Brak pozycji w tej kategorii
                </div>
                <div 
                  *ngFor="let item of category.items"
                  class="group p-6 bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div class="flex justify-between items-start gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-display text-xl text-stone-800 font-semibold 
                                   group-hover:text-brown-700 transition-colors">
                          {{ item.name }}
                        </h3>
                        <div *ngIf="item.tags && item.tags.length > 0" class="flex gap-2">
                          <span 
                            *ngFor="let tag of item.tags"
                            class="px-2 py-0.5 text-xs font-body tracking-wide rounded-full"
                            [ngClass]="{
                              'bg-green-100 text-green-700': tag === 'vege' || tag === 'wegetariańskie',
                              'bg-orange-100 text-orange-700': tag === 'ostre',
                              'bg-yellow-100 text-yellow-700': tag === 'szef poleca',
                              'bg-blue-100 text-blue-700': tag === 'gluten-free' || tag === 'bez laktozy',
                              'bg-purple-100 text-purple-700': tag === 'wegańskie'
                            }"
                          >
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                      <p *ngIf="item.description" class="text-stone-600 text-sm leading-relaxed">
                        {{ item.description }}
                      </p>
                    </div>
                    <div class="font-display text-xl text-brown-700 font-semibold whitespace-nowrap">
                      {{ formatPrice(item.price, item.currency) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Note -->
        <div class="mt-16 text-center text-stone-500 text-sm">
          <p>Wszystkie ceny podane w PLN. Menu może ulec zmianie w zależności od sezonu.</p>
          <p class="mt-1">Poinformuj nas o alergiach pokarmowych przy składaniu zamówienia.</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-brown-800">
      <div class="container mx-auto px-6 text-center">
        <h2 class="font-display text-3xl text-warm-100 font-semibold mb-4">
          Skosztuj naszych dań
        </h2>
        <p class="text-warm-300 mb-8 max-w-xl mx-auto">
          Zarezerwuj stolik i pozwól, abyśmy zabrali Cię w kulinarną podróż.
        </p>
        <a routerLink="/rezerwacja" class="btn-primary">
          Zarezerwuj Stolik
        </a>
      </div>
    </section>

    <app-footer></app-footer>
  `
})
export class MenuComponent implements OnInit {
  selectedCategory = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  menuCategories = signal<MenuCategoryWithItems[]>([]);
  
  categoryNames = computed(() => {
    const categories = this.menuCategories();
    if (categories.length === 0) return [];
    return categories.map(cat => cat.name);
  });

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadMenu();
  }

  loadMenu(): void {
    this.loading.set(true);
    this.error.set(null);

    // Pobierz kategorie i pozycje
    this.menuService.getCategories().subscribe({
      next: (categoriesRes) => {
        if (categoriesRes.success) {
          // Pobierz pozycje dla każdej kategorii
          const categoryPromises = categoriesRes.data.map(category =>
            this.menuService.getItemsByCategory(category._id).toPromise().then(itemsRes => ({
              ...category,
              items: itemsRes?.success ? itemsRes.data : []
            }))
          );

          Promise.all(categoryPromises).then(categoriesWithItems => {
            this.menuCategories.set(categoriesWithItems);
            
            // Ustaw pierwszą kategorię jako domyślną
            if (categoriesWithItems.length > 0 && !this.selectedCategory()) {
              this.selectedCategory.set(categoriesWithItems[0].name);
            }
            
            this.loading.set(false);
          }).catch(() => {
            this.error.set('Błąd pobierania menu');
            this.loading.set(false);
          });
        }
      },
      error: () => {
        this.error.set('Błąd pobierania menu');
        this.loading.set(false);
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  formatPrice(price: number, currency: string = 'PLN'): string {
    return `${price.toFixed(2)} ${currency}`;
  }

  getSelectedCategoryData(): MenuCategoryWithItems | null {
    const selectedName = this.selectedCategory();
    if (!selectedName) return null;
    
    return this.menuCategories().find(cat => cat.name === selectedName) || null;
  }
}
