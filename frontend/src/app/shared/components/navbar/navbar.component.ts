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

      <!-- Mobile Menu -->
      <div 
        class="md:hidden absolute top-full left-0 right-0 bg-stone-900/98 backdrop-blur-md overflow-hidden transition-all duration-500"
        [class.max-h-0]="!isMobileMenuOpen()"
        [class.max-h-screen]="isMobileMenuOpen()"
      >
        <div class="container mx-auto px-6 py-6 flex flex-col gap-4">
          <a *ngFor="let item of menuItems; let i = index" 
             [routerLink]="item.path"
             routerLinkActive="text-brown-400"
             (click)="closeMobileMenu()"
             class="font-body text-warm-200 text-lg py-3 border-b border-warm-800/30 
                    hover:text-brown-400 hover:pl-2 transition-all duration-300"
             [style.animation-delay.ms]="i * 100">
            {{ item.label }}
          </a>
          
          <a routerLink="/rezerwacja" 
             (click)="closeMobileMenu()"
             class="mt-4 py-4 bg-brown-700 text-white text-center font-body tracking-wider uppercase
                    hover:bg-brown-600 transition-all duration-300 rounded-sm">
            Zarezerwuj Stolik
          </a>
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
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
