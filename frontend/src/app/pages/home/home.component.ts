import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { LocationService, Location } from '../../core/services/location.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <!-- Hero Section -->
    <section class="relative h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 bg-gradient-to-br from-stone-900 via-brown-950 to-stone-900">
        <div class="absolute inset-0 bg-[url('/assets/images/bg.jpg')] 
                    bg-cover bg-center opacity-40"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/50"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <span class="inline-block font-accent text-brown-400 text-lg md:text-xl tracking-widest uppercase mb-4
                     animate-fade-in-down">
          Witamy w
        </span>
        
        <h1 class="font-display text-5xl md:text-7xl lg:text-8xl text-warm-100 font-bold mb-6
                   animate-fade-in-up delay-200">
          Restauracji
          <span class="block font-accent text-brown-500 italic font-normal mt-2">U Kelnerów</span>
        </h1>
        
        <p class="font-body text-warm-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed
                  animate-fade-in delay-400">
          Odkryj wykwintną kuchnię polską i europejską w eleganckiej atmosferze 
          naszych dwóch wyjątkowych lokalizacji w Warszawie.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-600">
          <a routerLink="/rezerwacja" class="btn-primary">
            Zarezerwuj Stolik
          </a>
          <a routerLink="/menu" class="btn-outline border-warm-300 text-warm-300 hover:bg-warm-300 hover:text-stone-900">
            Zobacz Menu
          </a>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-24 bg-warm-50">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <!-- Image -->
          <div class="relative">
            <div class="aspect-[4/5] bg-warm-200 rounded-sm overflow-hidden shadow-2xl">
              <img 
                src="/assets/images/historia.jpg" 
                alt="Wnętrze restauracji"
                class="w-full h-full object-cover"
              >
            </div>
            <!-- Decorative element -->
            <div class="absolute -bottom-6 -right-6 w-48 h-48 border-2 border-brown-600/30 rounded-sm -z-10"></div>
          </div>

          <!-- Content -->
          <div>
            <span class="font-accent text-brown-600 text-lg tracking-wider">Nasza Historia</span>
            <h2 class="font-display text-4xl md:text-5xl text-stone-800 font-semibold mt-2 mb-6">
              Tradycja spotyka nowoczesność
            </h2>
            <div class="section-divider !mx-0 !my-6"></div>
            <p class="text-stone-600 leading-relaxed mb-6">
              Od 2010 roku tworzymy wyjątkowe doznania kulinarne, łącząc klasyczne polskie smaki 
              z europejskimi inspiracjami. Każde danie to opowieść o najlepszych składnikach, 
              tradycyjnych recepturach i nowoczesnych technikach.
            </p>
            <p class="text-stone-600 leading-relaxed mb-8">
              Nasze dwa lokale — w sercu Centrum i na malowniczym Mokotowie — oferują 
              niepowtarzalną atmosferę dla każdej okazji. Od romantycznej kolacji po 
              eleganckie przyjęcie firmowe.
            </p>
            <a routerLink="/o-nas" class="btn-outline">
              Poznaj nas bliżej
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Locations Section -->
    <section class="py-24 bg-stone-900 text-warm-100">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <span class="font-accent text-brown-400 text-lg tracking-wider">Odwiedź nas</span>
          <h2 class="font-display text-4xl md:text-5xl font-semibold mt-2">
            Nasz Lokal
          </h2>
          <div class="section-divider !bg-gradient-to-r !from-transparent !via-brown-500 !to-transparent"></div>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- Location -->
          <div class="group relative overflow-hidden rounded-sm">
            <div class="aspect-[16/10] bg-stone-800">
              <img 
                src="/assets/images/bg.jpg"
                alt="U Kelnerów"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              >
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <h3 class="font-display text-2xl font-semibold mb-2">U Kelnerów</h3>
              <p class="text-warm-400 mb-1">al. Wyzwolenia 41/u3a, Szczecin</p>
              <p class="text-brown-400">+48 734 213 403</p>
              <a routerLink="/rezerwacja" 
                 class="inline-block mt-4 text-sm text-warm-200 border-b border-warm-200 
                        hover:text-brown-400 hover:border-brown-400 transition-colors">
                Zarezerwuj stolik →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-warm-100">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <span class="font-accent text-brown-600 text-lg tracking-wider">Co nas wyróżnia</span>
          <h2 class="font-display text-4xl md:text-5xl text-stone-800 font-semibold mt-2">
            Wyjątkowe Doświadczenie
          </h2>
          <div class="section-divider"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-8">
            <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-brown-700/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-brown-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="font-display text-xl text-stone-800 font-semibold mb-3">Sezonowe Menu</h3>
            <p class="text-stone-600 leading-relaxed">
              Nasze menu zmienia się wraz z porami roku, wykorzystując 
              najświeższe lokalne składniki.
            </p>
          </div>

          <div class="text-center p-8">
            <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-brown-700/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-brown-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"/>
              </svg>
            </div>
            <h3 class="font-display text-xl text-stone-800 font-semibold mb-3">Wydarzenia</h3>
            <p class="text-stone-600 leading-relaxed">
              Organizujemy niezapomniane wydarzenia — od kameralnych przyjęć 
              po wielkie celebracje.
            </p>
          </div>

          <div class="text-center p-8">
            <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-brown-700/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-brown-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <h3 class="font-display text-xl text-stone-800 font-semibold mb-3">Elegancja</h3>
            <p class="text-stone-600 leading-relaxed">
              Wyrafinowane wnętrza i profesjonalna obsługa tworzą 
              atmosferę prawdziwego luksusu.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-gradient-to-br from-brown-800 via-brown-900 to-stone-900 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-0 left-0 w-64 h-64 bg-brown-700/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-brown-600/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <div class="container mx-auto px-6 text-center relative z-10">
        <h2 class="font-display text-4xl md:text-5xl text-warm-100 font-semibold mb-6">
          Zarezerwuj Swój Stolik
        </h2>
        <p class="font-body text-warm-300 text-lg max-w-2xl mx-auto mb-10">
          Wybierz lokal, datę i godzinę — resztą zajmiemy się my. 
          Czekamy, aby stworzyć dla Ciebie niezapomniane wspomnienia.
        </p>
        <a routerLink="/rezerwacja" class="inline-block px-12 py-4 bg-warm-100 text-brown-900 
                                           font-body font-semibold tracking-wider rounded-sm
                                           hover:bg-white transform hover:scale-105 
                                           shadow-xl hover:shadow-2xl transition-all duration-300">
          Zarezerwuj Teraz
        </a>
      </div>
    </section>

    <app-footer></app-footer>
  `,
  styles: [`
    .delay-200 { animation-delay: 200ms; }
    .delay-400 { animation-delay: 400ms; }
    .delay-600 { animation-delay: 600ms; }
  `]
})
export class HomeComponent implements OnInit {
  locations = signal<Location[]>([]);

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.locationService.getLocations().subscribe();
  }
}
