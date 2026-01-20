import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav 
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      [class]="isScrolled() ? 'bg-stone-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'"
    >
      <div class="container mx-auto px-6 flex items-center justify-between">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brown-600 to-brown-800 flex items-center justify-center shadow-lg group-hover:shadow-brown-600/30 transition-all duration-300">
            <span class="font-display text-white text-lg font-bold">Z</span>
          </div>
          <div class="hidden sm:block">
            <span class="font-display text-xl font-semibold" 
                  [class]="isScrolled() ? 'text-warm-100' : 'text-white'">
              Restauracja
            </span>
            <span class="font-accent text-brown-400 text-lg ml-1 italic">Złota</span>
          </div>
        </a>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8">
          <a *ngFor="let item of menuItems" 
             [routerLink]="item.path"
             routerLinkActive="text-brown-400"
             [routerLinkActiveOptions]="{exact: item.exact}"
             class="font-body text-sm tracking-wider uppercase transition-colors duration-300 elegant-underline"
             [class]="isScrolled() ? 'text-warm-200 hover:text-brown-400' : 'text-white/90 hover:text-white'">
            {{ item.label }}
          </a>
          
          <a routerLink="/rezerwacja" 
             class="ml-4 px-6 py-2.5 bg-brown-700 text-white font-body text-sm tracking-wider uppercase
                    hover:bg-brown-600 transform hover:scale-105 active:scale-95
                    shadow-lg hover:shadow-brown-600/30 transition-all duration-300 rounded-sm">
            Zarezerwuj
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          (click)="toggleMobileMenu()"
          class="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          [class]="isScrolled() ? 'text-warm-100' : 'text-white'"
        >
          <span 
            class="w-6 h-0.5 bg-current transition-all duration-300"
            [class.rotate-45]="isMobileMenuOpen()"
            [class.translate-y-2]="isMobileMenuOpen()"
          ></span>
          <span 
            class="w-6 h-0.5 bg-current transition-all duration-300"
            [class.opacity-0]="isMobileMenuOpen()"
          ></span>
          <span 
            class="w-6 h-0.5 bg-current transition-all duration-300"
            [class.-rotate-45]="isMobileMenuOpen()"
            [class.-translate-y-2]="isMobileMenuOpen()"
          ></span>
        </button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div 
        *ngIf="isMobileMenuOpen()"
        class="md:hidden fixed inset-0 top-0 left-0 right-0 bottom-0 z-40 bg-gradient-to-br from-stone-900 via-stone-800 to-brown-950 overflow-y-auto transition-opacity duration-300"
        [class.opacity-0]="!isMobileMenuOpen()"
        [class.opacity-100]="isMobileMenuOpen()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-6 border-b border-warm-800/30 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brown-600 to-brown-800 flex items-center justify-center shadow-lg">
              <span class="font-display text-white text-lg font-bold">Z</span>
            </div>
            <span class="font-display text-warm-100 text-lg font-semibold">Restauracja</span>
            <span class="font-accent text-brown-400 italic">Złota</span>
          </div>
          <button 
            (click)="closeMobileMenu()"
            class="w-10 h-10 flex items-center justify-center text-warm-200 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Menu Content -->
        <div class="container mx-auto px-6 py-8 flex flex-col gap-6">
          <nav class="flex flex-col gap-2">
            <a *ngFor="let item of menuItems; let i = index" 
               [routerLink]="item.path"
               routerLinkActive="bg-warm-800/50 text-brown-400 border-l-4 border-brown-600"
               [routerLinkActiveOptions]="{exact: item.exact}"
               (click)="closeMobileMenu()"
               class="font-body text-warm-100 text-lg py-4 px-6 rounded-sm
                      hover:bg-warm-800/40 hover:text-brown-400 hover:pl-8 transition-all duration-300
                      border-l-4 border-transparent">
              {{ item.label }}
            </a>
          </nav>
          
          <div class="pt-4 border-t border-warm-800/30 mt-4">
            <a routerLink="/rezerwacja" 
               (click)="closeMobileMenu()"
               class="block w-full py-4 bg-brown-700 text-white text-center font-body tracking-wider uppercase
                      hover:bg-brown-600 active:bg-brown-800 transition-all duration-300 rounded-sm shadow-lg">
              Zarezerwuj Stolik
            </a>
          </div>

          <!-- Location Info (optional, if you have locations data) -->
          <div class="pt-8 border-t border-warm-800/30 mt-6 space-y-6">
            <div class="text-center text-warm-300 text-sm">
              <p class="font-semibold mb-4 text-warm-100">Godziny otwarcia</p>
              <p class="mb-1">Pn-Cz: 11:00 - 22:00</p>
              <p class="mb-1">Pt-Sob: 11:00 - 23:00</p>
              <p>Niedziela: 11:00 - 21:00</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .elegant-underline::after {
      bottom: -4px;
    }
  `]
})
export class NavbarComponent {
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  menuItems = [
    { label: 'Strona główna', path: '/', exact: true },
    { label: 'Menu', path: '/menu', exact: false },
    { label: 'O nas', path: '/o-nas', exact: false },
    { label: 'Kontakt', path: '/kontakt', exact: false }
  ];

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleMobileMenu(): void {
    const newValue = !this.isMobileMenuOpen();
    this.isMobileMenuOpen.set(newValue);
    
    // Blokuj scroll strony gdy menu jest otwarte
    if (newValue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onWindowResize() {
    // Zamknij menu na większych ekranach
    if (window.innerWidth >= 768 && this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }
}
