import { Component, signal, HostListener, ViewEncapsulation, OnInit, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Navbar - scrolluje się na mobile, fixed na desktop -->
    <!-- Używamy Tailwind responsive classes: relative na mobile, fixed na desktop -->
    <nav 
      class="restauracja-navbar w-full bg-stone-900/95 md:backdrop-blur-md shadow-lg py-4 md:py-3  md:relative md:top-0 md:left-0 md:right-0 md:z-50"
      [attr.data-mobile]="isMobile() ? 'true' : 'false'"
    >
      <div class="container mx-auto px-6 flex items-center justify-between">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-3 group">
          <img 
            src="/assets/images/logo.jpg" 
            alt="U kelnerów"
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-lg group-hover:shadow-brown-600/30 transition-all duration-300"
          >
          <div class="hidden sm:block">
            <span class="font-display text-xl font-semibold text-warm-100">
              U kelnerów
            </span>
          </div>
        </a>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8">
          <a *ngFor="let item of menuItems" 
             [routerLink]="item.path"
             routerLinkActive="text-brown-400"
             [routerLinkActiveOptions]="{exact: item.exact}"
             class="font-body text-sm tracking-wider uppercase transition-colors duration-300 elegant-underline text-warm-200 hover:text-brown-400">
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
          class="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-warm-100"
          aria-label="Toggle menu"
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
    </nav>

    <!-- Mobile Offcanvas - wysuwa się z prawej strony -->
    <div 
      class="md:hidden fixed inset-0 z-[60] offcanvas-container"
      [class.offcanvas-open]="isMobileMenuOpen()"
      [class.offcanvas-closed]="!isMobileMenuOpen()"
    >
      <!-- Backdrop -->
      <div 
        (click)="closeMobileMenu()"
        class="absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out"
        [class.opacity-0]="!isMobileMenuOpen()"
        [class.opacity-100]="isMobileMenuOpen()"
      ></div>
      
      <!-- Offcanvas Panel - wysuwa się z prawej, pełna szerokość (100dvw) -->
      <div 
        class="absolute right-0 top-0 bottom-0 bg-gradient-to-br from-stone-900 via-stone-800 to-brown-950 
               shadow-2xl overflow-y-auto pointer-events-auto offcanvas-panel"
        [style.width]="'100dvw'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-6 border-b border-warm-800/30 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <img 
              src="/assets/images/logo.jpg" 
              alt="U kelnerów"
              class="w-10 h-10 rounded-full object-cover shadow-lg"
            >
            <span class="font-display text-warm-100 text-lg font-semibold">U kelnerów</span>
          </div>
          <button 
            (click)="closeMobileMenu()"
            class="w-10 h-10 flex items-center justify-center text-warm-200 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Menu Content -->
        <div class="px-6 py-8 flex flex-col gap-6">
          <nav class="flex flex-col gap-2">
            <a *ngFor="let item of menuItems" 
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

          <!-- Location Info -->
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
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: static;
    }

    .elegant-underline::after {
      bottom: -4px;
    }

    /* Offcanvas container - ukryty gdy zamknięty, ale w DOM dla animacji */
    .offcanvas-container.offcanvas-closed {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .offcanvas-container.offcanvas-open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    /* Offcanvas panel - animacja slide-in z prawej */
    .offcanvas-panel {
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
    }

    .offcanvas-container.offcanvas-open .offcanvas-panel {
      transform: translateX(0);
    }

    /* Smooth transition dla container */
    .offcanvas-container {
      transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
    }
  `]
})
export class NavbarComponent implements OnInit, AfterViewInit {
  isMobileMenuOpen = signal(false);
  
  // Inicjalizacja windowWidth - domyślnie 0, potem ustawiane w ngOnInit
  // Używamy 0 zamiast window.innerWidth żeby uniknąć problemów z SSR i pierwszym renderowaniem
  windowWidth = signal(0);

  // Computed signal dla isMobile - automatycznie się aktualizuje
  // Jeśli width jest 0 (nie zainicjalizowany), zwracamy true (mobile-first approach)
  isMobile = computed(() => {
    const width = this.windowWidth();
    // Jeśli width jest 0, zwracamy true (mobile-first)
    // Jeśli width jest >= 768, zwracamy false (desktop)
    // Jeśli width jest < 768, zwracamy true (mobile)
    return width === 0 || width < 768;
  });

  menuItems = [
    { label: 'Strona główna', path: '/', exact: true },
    { label: 'Menu', path: '/menu', exact: false },
    { label: 'O nas', path: '/o-nas', exact: false },
    { label: 'Kontakt', path: '/kontakt', exact: false }
  ];

  ngOnInit(): void {
    // Ustaw szerokość od razu - CRITICAL dla poprawnego działania
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      this.windowWidth.set(width);
      console.log('[Navbar] ngOnInit - windowWidth:', width, 'isMobile:', this.isMobile());
    }
  }

  ngAfterViewInit(): void {
    // Upewnij się że szerokość jest ustawiona po renderowaniu
    if (typeof window !== 'undefined') {
      // Użyj requestAnimationFrame dla pewności że DOM jest gotowy
      requestAnimationFrame(() => {
        const width = window.innerWidth;
        this.windowWidth.set(width);
        console.log('[Navbar] ngAfterViewInit - windowWidth:', width, 'isMobile:', this.isMobile());
        
        // DEBUG: Sprawdź computed style navbar i rodziców
        // WAŻNE: Używamy ViewChild lub bezpośredniego dostępu do głównego navbara
        // Offcanvas też ma <nav>, więc querySelector może znaleźć zły element!
        setTimeout(() => {
          // Znajdź główny navbar - pierwszy <nav> który jest bezpośrednim dzieckiem app-navbar
          // NIE offcanvas nav (który jest wewnątrz offcanvas-container)
          const hostElement = document.querySelector('app-navbar');
          if (!hostElement) return;
          
          // Główny navbar to pierwszy <nav> który NIE jest w offcanvas-container
          const allNavs = hostElement.querySelectorAll('nav');
          let navElement: Element | null = null;
          for (let i = 0; i < allNavs.length; i++) {
            const nav = allNavs[i];
            // Sprawdź czy nav NIE jest w offcanvas-container
            if (!nav.closest('.offcanvas-container')) {
              navElement = nav;
              break;
            }
          }
          
          if (!navElement) {
            console.error('[Navbar] Could not find main navbar element!');
            return;
          }
          
          console.log('[Navbar] Found main navbar:', navElement, 'Class:', navElement.className);
          if (navElement && hostElement) {
            const navStyle = window.getComputedStyle(navElement);
            const hostStyle = window.getComputedStyle(hostElement);
            const bodyStyle = window.getComputedStyle(document.body);
            const htmlStyle = window.getComputedStyle(document.documentElement);
            
            // Sprawdź rodziców
            let parent = navElement.parentElement;
            const parentStyles: any[] = [];
            while (parent && parent !== document.body) {
              const parentStyle = window.getComputedStyle(parent);
              parentStyles.push({
                tag: parent.tagName,
                class: parent.className,
                position: parentStyle.position,
                overflow: parentStyle.overflow,
                overflowY: parentStyle.overflowY,
                height: parentStyle.height,
                maxHeight: parentStyle.maxHeight
              });
              parent = parent.parentElement;
            }
            
            // Sprawdź czy scrollowanie działa
            const scrollTest = {
              windowScrollY: window.scrollY,
              documentHeight: document.documentElement.scrollHeight,
              windowHeight: window.innerHeight,
              canScroll: document.documentElement.scrollHeight > window.innerHeight
            };
            
            console.log('[Navbar] DEBUG - Full analysis:', {
              nav: {
                position: navStyle.position,
                top: navStyle.top,
                left: navStyle.left,
                right: navStyle.right,
                width: navStyle.width,
                zIndex: navStyle.zIndex,
                dataMobile: navElement.getAttribute('data-mobile'),
                dataWidth: navElement.getAttribute('data-width')
              },
              host: {
                position: hostStyle.position,
                display: hostStyle.display,
                width: hostStyle.width
              },
              body: {
                overflow: bodyStyle.overflow,
                overflowY: bodyStyle.overflowY,
                position: bodyStyle.position,
                height: bodyStyle.height
              },
              html: {
                overflow: htmlStyle.overflow,
                overflowY: htmlStyle.overflowY,
                position: htmlStyle.position,
                height: htmlStyle.height
              },
              parents: parentStyles,
              scrollTest: scrollTest
            });
            
            // Jeśli nie można scrollować, wymuś scrollowanie
            if (!scrollTest.canScroll) {
              console.warn('[Navbar] WARNING - Page cannot scroll! Document height:', scrollTest.documentHeight, 'Window height:', scrollTest.windowHeight);
            }
            
            // Test: Sprawdź czy GŁÓWNY navbar scrolluje się ze stroną (nie offcanvas!)
            if (this.isMobile()) {
              console.log('[Navbar] Mobile detected - testing MAIN navbar scroll behavior...');
              const navRect = navElement.getBoundingClientRect();
              const navPosition = window.getComputedStyle(navElement).position;
              
              console.log('[Navbar] Main navbar state:', {
                position: navPosition,
                top: navRect.top,
                className: navElement.className,
                isMainNavbar: !navElement.closest('.offcanvas-container')
              });
              
              // Jeśli navbar ma position: fixed, to nie będzie scrollować się
              if (navPosition === 'fixed') {
                console.error('[Navbar] PROBLEM: Main navbar has position: fixed on mobile! Should be relative!');
              }
              
              // Zapisz początkową pozycję GŁÓWNEGO navbara
              const initialNavTop = navRect.top;
              const initialScrollY = window.scrollY;
              
              console.log('[Navbar] Initial state of MAIN navbar:', {
                navbarTop: initialNavTop,
                scrollY: initialScrollY,
                position: navPosition
              });
              
              // Listener na scroll - sprawdź czy GŁÓWNY navbar się przesuwa
              let scrollCount = 0;
              const scrollListener = () => {
                // Upewnij się że sprawdzamy główny navbar, nie offcanvas
                const mainNav = hostElement.querySelector('nav:not(.offcanvas-container nav)');
                if (!mainNav || mainNav !== navElement) {
                  console.warn('[Navbar] Wrong navbar element detected in scroll listener!');
                  return;
                }
                
                scrollCount++;
                const currentNavRect = navElement.getBoundingClientRect();
                const currentScrollY = window.scrollY;
                const navbarMoved = Math.abs(currentNavRect.top - initialNavTop) > 1;
                
                // Loguj tylko pierwsze 5 eventów, żeby nie spamować
                if (scrollCount <= 5) {
                  console.log(`[Navbar] MAIN navbar scroll event #${scrollCount}:`, {
                    scrollY: currentScrollY,
                    navbarTop: currentNavRect.top,
                    navbarMoved: navbarMoved,
                    'navbarScrollingWithPage': navbarMoved && currentScrollY > 0,
                    'If navbarMoved=false, navbar is FIXED (not scrolling)!': !navbarMoved && currentScrollY > 0
                  });
                }
              };
              
              window.addEventListener('scroll', scrollListener, { passive: true });
              console.log('[Navbar] Scroll listener added for MAIN navbar - scroll the page and check if navbar moves!');
              
              // Sprawdź czy navbar jest w normalnym flow
              const navParent = navElement.parentElement;
              const navParentStyle = navParent ? window.getComputedStyle(navParent) : null;
              console.log('[Navbar] Parent element:', {
                tag: navParent?.tagName,
                class: navParent?.className,
                position: navParentStyle?.position,
                overflow: navParentStyle?.overflow,
                display: navParentStyle?.display
              });
            }
          }
        }, 100);
      });
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event) {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      this.windowWidth.set(width);
      console.log('[Navbar] resize - windowWidth:', width, 'isMobile:', this.isMobile());
      // Zamknij menu na większych ekranach
      if (width >= 768 && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    }
  }
}
