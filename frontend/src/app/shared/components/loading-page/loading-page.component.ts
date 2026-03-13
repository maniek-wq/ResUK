import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 text-warm-100">
      <div class="flex flex-col items-center gap-6 px-8 py-10 rounded-sm border border-warm-800/40 bg-gradient-to-br from-stone-900 via-stone-900/95 to-brown-950/90 shadow-2xl">
        <!-- Logo / monogram -->
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-brown-700 to-brown-500 flex items-center justify-center shadow-xl ring-2 ring-brown-600/40">
          <span class="font-display text-3xl text-white">U</span>
        </div>

        <!-- Text -->
        <div class="text-center space-y-2">
          <p class="font-accent text-brown-400 text-lg tracking-[0.25em] uppercase">Restauracja</p>
          <p class="font-display text-2xl text-warm-50">U Kelnerów</p>
          <p class="font-body text-sm text-warm-400">
            Przygotowujemy dla Ciebie wyjątkowe doświadczenie…
          </p>
        </div>

        <!-- Subtle loader -->
        <div class="flex items-center gap-2 text-brown-300">
          <span class="sr-only">Ładowanie</span>
          <div class="h-0.5 w-20 bg-warm-800/60 overflow-hidden rounded-full">
            <div class="h-full w-1/2 bg-gradient-to-r from-brown-500 to-brown-300 animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-loading-bar {
      animation: loading-bar 1.4s ease-in-out infinite;
    }

    @keyframes loading-bar {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class LoadingPageComponent {}

