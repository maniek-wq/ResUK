import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <!-- Hero -->
    <section class="relative h-[50vh] min-h-[400px] flex items-center justify-center">
      <div class="absolute inset-0 bg-stone-900">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')] 
                    bg-cover bg-center opacity-50"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/60"></div>
      </div>
      
      <div class="relative z-10 text-center px-6">
        <span class="font-accent text-brown-400 text-lg tracking-wider mb-4 block">Poznaj nas</span>
        <h1 class="font-display text-5xl md:text-6xl text-warm-100 font-bold">
          O Nas
        </h1>
        <div class="w-24 h-0.5 bg-gradient-to-r from-transparent via-brown-500 to-transparent mx-auto mt-6"></div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="py-24 bg-warm-50">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span class="font-accent text-brown-600 text-lg tracking-wider">Nasza Historia</span>
            <h2 class="font-display text-4xl md:text-5xl text-stone-800 font-semibold mt-2 mb-6">
              Pasja do smaku od 2010 roku
            </h2>
            <div class="section-divider !mx-0 !my-6"></div>
            <p class="text-stone-600 leading-relaxed mb-6">
              Restauracja Złota powstała z miłości do dobrego jedzenia i pragnienia dzielenia się 
              wyjątkowymi doznaniami kulinarnymi z naszymi gośćmi. Nasz pierwszy lokal w Centrum 
              Warszawy szybko zyskał uznanie koneserów dobrej kuchni.
            </p>
            <p class="text-stone-600 leading-relaxed mb-6">
              W 2015 roku, odpowiadając na potrzeby naszych gości, otworzyliśmy drugi lokal na 
              Mokotowie — kameralny i przytulny, z pięknym ogrodem na ciepłe dni.
            </p>
            <p class="text-stone-600 leading-relaxed">
              Dziś, po latach doskonalenia naszego rzemiosła, kontynuujemy tradycję serwowania 
              dań, które łączą klasyczne polskie smaki z europejską finezją.
            </p>
          </div>
          <div class="relative">
            <div class="aspect-[4/5] bg-warm-200 rounded-sm overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Szef kuchni przygotowujący danie"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="absolute -bottom-6 -left-6 w-48 h-48 border-2 border-brown-600/30 rounded-sm -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-24 bg-stone-900 text-warm-100">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <span class="font-accent text-brown-400 text-lg tracking-wider">Nasze wartości</span>
          <h2 class="font-display text-4xl md:text-5xl font-semibold mt-2">
            Co nas wyróżnia
          </h2>
          <div class="section-divider !bg-gradient-to-r !from-transparent !via-brown-500 !to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-brown-700/20 flex items-center justify-center">
              <svg class="w-10 h-10 text-brown-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h3 class="font-display text-xl font-semibold mb-4">Pasja</h3>
            <p class="text-warm-400 leading-relaxed">
              Gotowanie to dla nas nie praca — to pasja. Każde danie tworzymy z sercem i oddaniem, 
              dbając o najmniejsze detale.
            </p>
          </div>

          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-brown-700/20 flex items-center justify-center">
              <svg class="w-10 h-10 text-brown-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="font-display text-xl font-semibold mb-4">Jakość</h3>
            <p class="text-warm-400 leading-relaxed">
              Współpracujemy tylko z najlepszymi dostawcami. Świeże, lokalne produkty to podstawa 
              wszystkich naszych dań.
            </p>
          </div>

          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-brown-700/20 flex items-center justify-center">
              <svg class="w-10 h-10 text-brown-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="font-display text-xl font-semibold mb-4">Gościnność</h3>
            <p class="text-warm-400 leading-relaxed">
              Nasi goście są dla nas rodziną. Tworzymy atmosferę, w której każdy czuje się wyjątkowo 
              i mile widziany.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Chef Section -->
    <section class="py-24 bg-warm-100">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="order-2 lg:order-1">
            <span class="font-accent text-brown-600 text-lg tracking-wider">Szef Kuchni</span>
            <h2 class="font-display text-4xl md:text-5xl text-stone-800 font-semibold mt-2 mb-6">
              Michał Kowalczyk
            </h2>
            <div class="section-divider !mx-0 !my-6"></div>
            <p class="text-stone-600 leading-relaxed mb-6">
              Szef kuchni Michał Kowalczyk to wirtuoz smaku z ponad 20-letnim doświadczeniem 
              w najlepszych restauracjach Europy. Jego kulinarną podróż rozpoczął we Francji, 
              kontynuował we Włoszech, aby ostatecznie powrócić do Polski i tchnąć nowe życie 
              w tradycyjne receptury.
            </p>
            <p class="text-stone-600 leading-relaxed mb-6">
              "Gotowanie to sztuka opowiadania historii poprzez smaki. Każde danie w Restauracji 
              Złotej to moja osobista opowieść o podróżach, wspomnieniach i miłości do dobrego jedzenia."
            </p>
            <p class="font-accent text-brown-700 text-lg italic">
              — Michał Kowalczyk
            </p>
          </div>
          <div class="order-1 lg:order-2 relative">
            <div class="aspect-square bg-warm-200 rounded-full overflow-hidden shadow-2xl mx-auto max-w-md">
              <img 
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1977&q=80" 
                alt="Szef kuchni Michał Kowalczyk"
                class="w-full h-full object-cover"
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 bg-brown-800">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span class="font-display text-5xl md:text-6xl text-brown-400 font-bold">15+</span>
            <p class="text-warm-300 mt-2">Lat doświadczenia</p>
          </div>
          <div>
            <span class="font-display text-5xl md:text-6xl text-brown-400 font-bold">2</span>
            <p class="text-warm-300 mt-2">Lokalizacje</p>
          </div>
          <div>
            <span class="font-display text-5xl md:text-6xl text-brown-400 font-bold">50k+</span>
            <p class="text-warm-300 mt-2">Zadowolonych gości</p>
          </div>
          <div>
            <span class="font-display text-5xl md:text-6xl text-brown-400 font-bold">4.9</span>
            <p class="text-warm-300 mt-2">Średnia ocena</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-warm-50">
      <div class="container mx-auto px-6 text-center">
        <h2 class="font-display text-3xl md:text-4xl text-stone-800 font-semibold mb-6">
          Przekonaj się sam
        </h2>
        <p class="text-stone-600 max-w-2xl mx-auto mb-8">
          Zapraszamy do odkrycia naszego świata smaków. Zarezerwuj stolik i pozwól nam 
          pokazać Ci, dlaczego Restauracja Złota jest wyjątkowa.
        </p>
        <a routerLink="/rezerwacja" class="btn-primary">
          Zarezerwuj Stolik
        </a>
      </div>
    </section>

    <app-footer></app-footer>
  `
})
export class AboutComponent {}
