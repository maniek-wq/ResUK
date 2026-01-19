import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

interface MenuItem {
  name: string;
  description: string;
  price: string;
  tags?: string[];
}

interface MenuCategory {
  name: string;
  description: string;
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
        
        <!-- Category Navigation -->
        <div class="flex flex-wrap justify-center gap-4 mb-16">
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
        <div class="max-w-4xl mx-auto">
          <div *ngFor="let category of menuCategories()">
            <div *ngIf="selectedCategory() === category.name || selectedCategory() === 'Wszystkie'" 
                 class="mb-16 last:mb-0">
              
              <!-- Category Header -->
              <div class="text-center mb-12">
                <h2 class="font-display text-3xl md:text-4xl text-stone-800 font-semibold">
                  {{ category.name }}
                </h2>
                <p class="text-stone-600 mt-2">{{ category.description }}</p>
                <div class="section-divider"></div>
              </div>

              <!-- Items Grid -->
              <div class="space-y-8">
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
                        <div *ngIf="item.tags" class="flex gap-2">
                          <span 
                            *ngFor="let tag of item.tags"
                            class="px-2 py-0.5 text-xs font-body tracking-wide rounded-full"
                            [ngClass]="{
                              'bg-green-100 text-green-700': tag === 'vege',
                              'bg-orange-100 text-orange-700': tag === 'ostre',
                              'bg-yellow-100 text-yellow-700': tag === 'szef poleca'
                            }"
                          >
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                      <p class="text-stone-600 text-sm leading-relaxed">
                        {{ item.description }}
                      </p>
                    </div>
                    <div class="font-display text-xl text-brown-700 font-semibold whitespace-nowrap">
                      {{ item.price }}
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
export class MenuComponent {
  selectedCategory = signal('Przystawki');

  menuCategories = signal<MenuCategory[]>([
    {
      name: 'Przystawki',
      description: 'Rozpocznij swoją kulinarną przygodę',
      items: [
        { name: 'Tatar wołowy', description: 'Klasyczny tatar z polędwicy wołowej, podawany z żółtkiem, kaparami i korniszonami', price: '48 zł', tags: ['szef poleca'] },
        { name: 'Carpaccio z buraka', description: 'Marynowany burak z kozim serem, rukolą i orzechami włoskimi', price: '36 zł', tags: ['vege'] },
        { name: 'Śledź w oleju', description: 'Tradycyjny śledź matias z cebulką i ogórkiem kiszonym', price: '32 zł' },
        { name: 'Bruschetta z pomidorami', description: 'Chrupiące pieczywo z dojrzałymi pomidorami, bazylią i oliwą', price: '28 zł', tags: ['vege'] }
      ]
    },
    {
      name: 'Zupy',
      description: 'Domowe receptury i świeże składniki',
      items: [
        { name: 'Żurek staropolski', description: 'Na zakwasie, z białą kiełbasą i jajkiem', price: '26 zł' },
        { name: 'Krem z dyni', description: 'Z pestkami dyni, śmietanką i odrobiną imbiru', price: '24 zł', tags: ['vege'] },
        { name: 'Rosół z makaronem', description: 'Klarowny rosół z domowym makaronem i warzywami', price: '22 zł' },
        { name: 'Zupa pomidorowa', description: 'Ze świeżych pomidorów z ryżem lub makaronem', price: '20 zł', tags: ['vege'] }
      ]
    },
    {
      name: 'Dania główne',
      description: 'Serca naszej kuchni',
      items: [
        { name: 'Polędwica wołowa', description: 'Grillowana polędwica z sosem z zielonego pieprzu, puree ziemniaczanym i warzywami sezonowymi', price: '98 zł', tags: ['szef poleca'] },
        { name: 'Kaczka konfitowana', description: 'Udko kacze konfit z modrą kapustą i kluskami śląskimi', price: '78 zł' },
        { name: 'Łosoś na parze', description: 'Z sosem cytrynowo-kaparowym, szpinakiem i młodymi ziemniakami', price: '72 zł' },
        { name: 'Kotlet schabowy', description: 'Tradycyjny schabowy z ziemniakami i surówką z kapusty', price: '52 zł' },
        { name: 'Pierogi ruskie', description: 'Domowe pierogi z twarogiem i ziemniakami, podawane ze skwarkami', price: '38 zł', tags: ['vege'] },
        { name: 'Risotto z grzybami', description: 'Kremowe risotto z mieszanką leśnych grzybów i parmezanem', price: '56 zł', tags: ['vege'] }
      ]
    },
    {
      name: 'Desery',
      description: 'Słodkie zakończenie',
      items: [
        { name: 'Sernik nowojorski', description: 'Kremowy sernik na kruchym spodzie z sosem malinowym', price: '28 zł' },
        { name: 'Makowiec tradycyjny', description: 'Domowy makowiec z bakaliami i lukrem', price: '24 zł' },
        { name: 'Panna cotta', description: 'Włoski deser z wanilią i sosem z owoców leśnych', price: '26 zł' },
        { name: 'Szarlotka na ciepło', description: 'Z lodami waniliowymi i sosem karmelowym', price: '30 zł', tags: ['szef poleca'] }
      ]
    },
    {
      name: 'Napoje',
      description: 'Do wyboru do koloru',
      items: [
        { name: 'Kawa espresso', description: 'Włoska kawa z najlepszych ziaren arabiki', price: '12 zł' },
        { name: 'Herbata liściasta', description: 'Wybór herbat premium: czarna, zielona, owocowa', price: '14 zł' },
        { name: 'Lemoniada domowa', description: 'Świeżo wyciskana z cytryną, miętą i miodem', price: '16 zł' },
        { name: 'Wino - kieliszek', description: 'Selekcja win z naszej karty, zapytaj kelnera', price: 'od 24 zł' }
      ]
    }
  ]);

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
