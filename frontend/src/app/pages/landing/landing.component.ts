import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-hidden" *ngIf="!isExiting()">
      <!-- Background -->
      <div class="absolute inset-0 bg-stone-900">
        <!-- Animated gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-brown-950/90 via-stone-900 to-brown-900/80"></div>
        
        <!-- Subtle pattern -->
        <div class="absolute inset-0 opacity-5"
             [style.background-image]="patternStyle">
        </div>
        
        <!-- Floating particles -->
        <div class="absolute inset-0 overflow-hidden">
          <div *ngFor="let particle of particles; let i = index"
               class="absolute w-1 h-1 bg-brown-500/30 rounded-full animate-float"
               [style.left.%]="particle.x"
               [style.top.%]="particle.y"
               [style.animation-delay.s]="i * 0.5"
               [style.animation-duration.s]="3 + i * 0.3">
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="relative h-full flex flex-col items-center justify-center px-6 text-center"
           [class.animate-fade-in]="showContent()">
        
        <!-- Logo -->
        <div class="mb-8 opacity-0 animate-scale-in" [class.opacity-100]="showContent()">
          <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-brown-600 to-brown-800 
                      flex items-center justify-center shadow-2xl shadow-brown-900/50
                      ring-2 ring-brown-600/30 ring-offset-4 ring-offset-stone-900">
            <span class="font-display text-white text-4xl font-bold">Z</span>
          </div>
        </div>

        <!-- Title -->
        <div class="overflow-hidden mb-4">
          <h1 class="font-display text-5xl md:text-7xl lg:text-8xl text-warm-100 font-bold tracking-tight
                     opacity-0 animate-fade-in-up delay-200"
              [class.opacity-100]="showContent()">
            Restauracja
          </h1>
        </div>
        
        <div class="overflow-hidden mb-8">
          <span class="font-accent text-4xl md:text-5xl lg:text-6xl text-brown-500 italic
                       opacity-0 animate-fade-in-up delay-400"
                [class.opacity-100]="showContent()">
            Złota
          </span>
        </div>

        <!-- Tagline -->
        <div class="overflow-hidden mb-12">
          <p class="font-body text-warm-400 text-lg md:text-xl tracking-widest uppercase
                    opacity-0 animate-fade-in-up delay-500"
             [class.opacity-100]="showContent()">
            Wykwintna kuchnia w eleganckim wydaniu
          </p>
        </div>

        <!-- Divider -->
        <div class="w-32 h-px bg-gradient-to-r from-transparent via-brown-600 to-transparent mb-12
                    opacity-0 animate-fade-in delay-600"
             [class.opacity-100]="showContent()">
        </div>

        <!-- CTA Button -->
        <button 
          (click)="enterSite()"
          class="group relative px-12 py-4 overflow-hidden rounded-sm
                 opacity-0 animate-fade-in-up delay-700"
          [class.opacity-100]="showContent()">
          <!-- Button background -->
          <div class="absolute inset-0 bg-brown-700 transition-transform duration-500 
                      group-hover:scale-105"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-brown-800 to-brown-600 opacity-0 
                      group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- Button border glow -->
          <div class="absolute inset-0 rounded-sm ring-1 ring-brown-500/50 
                      group-hover:ring-brown-400 transition-all duration-500"></div>
          
          <!-- Button text -->
          <span class="relative font-body text-white text-sm tracking-[0.3em] uppercase
                       group-hover:tracking-[0.4em] transition-all duration-500">
            Wejdź
          </span>
          
          <!-- Arrow icon -->
          <svg class="relative inline-block w-4 h-4 ml-3 text-white transform 
                      group-hover:translate-x-1 transition-transform duration-300"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Scroll hint -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-1000"
             [class.opacity-100]="showContent()">
          <div class="flex flex-col items-center gap-2 text-warm-500 animate-bounce">
            <span class="text-xs tracking-widest uppercase">lub przewiń</span>
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Exit animation overlay -->
      <div 
        class="absolute inset-0 bg-warm-50 transition-transform duration-700 ease-in-out"
        [class.translate-y-full]="!isExiting()"
        [class.translate-y-0]="isExiting()">
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .delay-200 { animation-delay: 200ms; }
    .delay-400 { animation-delay: 400ms; }
    .delay-500 { animation-delay: 500ms; }
    .delay-600 { animation-delay: 600ms; }
    .delay-700 { animation-delay: 700ms; }
    .delay-1000 { animation-delay: 1000ms; }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  showContent = signal(false);
  isExiting = signal(false);
  particles = Array.from({ length: 20 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  patternStyle = 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if user has seen landing before in this session
    if (sessionStorage.getItem('hasSeenLanding')) {
      this.router.navigate(['/'], { replaceUrl: true });
      return;
    }

    // Trigger animations after a short delay
    setTimeout(() => {
      this.showContent.set(true);
    }, 300);
  }

  ngOnDestroy(): void {}

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (window.scrollY > 50) {
      this.enterSite();
    }
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (event.deltaY > 0) {
      this.enterSite();
    }
  }

  enterSite(): void {
    if (this.isExiting()) return;
    
    sessionStorage.setItem('hasSeenLanding', 'true');
    this.isExiting.set(true);
    
    setTimeout(() => {
      this.router.navigate(['/'], { replaceUrl: true });
    }, 700);
  }
}
