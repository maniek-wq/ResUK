import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookies-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="showBanner()" 
         class="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 text-warm-200 shadow-2xl border-t border-stone-800">
      <div class="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex-1">
            <h3 class="font-display text-lg text-warm-100 font-semibold mb-2">
              Pliki cookies
            </h3>
            <p class="text-warm-400 text-sm leading-relaxed mb-2">
              Ta strona wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania oraz 
              poprawy komfortu korzystania ze strony. Kontynuując przeglądanie, wyrażasz zgodę na 
              używanie plików cookies.
            </p>
            <div class="flex flex-wrap gap-4 text-xs text-warm-500 mt-2">
              <a routerLink="/polityka-prywatnosci" 
                 class="text-brown-400 hover:text-brown-300 underline transition-colors">
                Polityka prywatności
              </a>
              <a routerLink="/regulamin" 
                 class="text-brown-400 hover:text-brown-300 underline transition-colors">
                Regulamin
              </a>
            </div>
          </div>
          <div class="flex gap-3 flex-shrink-0">
            <button 
              (click)="acceptCookies()"
              class="px-6 py-2 bg-brown-700 text-white text-sm rounded-sm hover:bg-brown-600 transition-colors whitespace-nowrap">
              Akceptuję
            </button>
            <button 
              (click)="rejectCookies()"
              class="px-6 py-2 bg-stone-800 text-warm-300 text-sm rounded-sm hover:bg-stone-700 transition-colors whitespace-nowrap">
              Odrzuć
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CookiesBannerComponent implements OnInit {
  showBanner = signal(false);

  ngOnInit(): void {
    // Sprawdź czy użytkownik już wyraził zgodę
    const cookiesConsent = localStorage.getItem('cookiesConsent');
    if (!cookiesConsent) {
      // Pokaż banner po krótkim opóźnieniu
      setTimeout(() => {
        this.showBanner.set(true);
      }, 1000);
    }
  }

  acceptCookies(): void {
    localStorage.setItem('cookiesConsent', 'accepted');
    localStorage.setItem('cookiesConsentDate', new Date().toISOString());
    this.showBanner.set(false);
  }

  rejectCookies(): void {
    localStorage.setItem('cookiesConsent', 'rejected');
    localStorage.setItem('cookiesConsentDate', new Date().toISOString());
    this.showBanner.set(false);
    // Tutaj można wyłączyć wszystkie nieistotne cookies
  }
}
