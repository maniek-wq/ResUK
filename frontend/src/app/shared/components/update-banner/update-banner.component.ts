import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PwaUpdateService } from '../../../core/services/pwa-update.service';

@Component({
  selector: 'app-update-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="updateService.updateAvailable() && isAdminPanel()"
      class="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up"
    >
      <div class="bg-gradient-to-r from-brown-700 to-brown-800 text-white shadow-2xl border-t-4 border-brown-500">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <!-- Icon & Message -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 sm:w-8 sm:h-8 text-brown-200 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm sm:text-base font-semibold">
                  Wymagana aktualizacja!
                </p>
                <p class="text-xs sm:text-sm text-brown-100 mt-0.5">
                  Kliknij "Aktualizuj teraz" aby zainstalować nową wersję (zajmie ~5 sekund)
                </p>
              </div>
            </div>

            <!-- Action Button -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                (click)="update()"
                class="px-4 sm:px-6 py-2 text-xs sm:text-sm bg-white text-brown-800 font-semibold 
                       rounded-sm hover:bg-brown-50 transition-all shadow-lg hover:shadow-xl
                       transform hover:scale-105 animate-pulse"
              >
                Aktualizuj teraz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
  `]
})
export class UpdateBannerComponent implements OnInit {
  constructor(
    public updateService: PwaUpdateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Sprawdź aktualizacje przy starcie komponentu (tylko w panelu admina)
    if (this.isAdminPanel()) {
      this.updateService.checkForUpdate();
    }
  }

  isAdminPanel(): boolean {
    // Pokazuj banner tylko w panelu admina (URL zaczyna się od /admin)
    return this.router.url.startsWith('/admin');
  }

  update(): void {
    this.updateService.applyUpdate();
  }
}
