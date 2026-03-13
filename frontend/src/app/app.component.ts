import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CookiesBannerComponent } from './shared/components/cookies-banner/cookies-banner.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top.component';
import { UpdateBannerComponent } from './shared/components/update-banner/update-banner.component';
import { LoadingPageComponent } from './shared/components/loading-page/loading-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CookiesBannerComponent, BackToTopComponent, UpdateBannerComponent, LoadingPageComponent],
  template: `
    <!-- Pełnoekranowy loader przy pierwszym wejściu / ładowaniu zasobów -->
    <app-loading-page *ngIf="showLoader()"></app-loading-page>

    <!-- Główna treść aplikacji -->
    <div [class.opacity-0]="showLoader()" [class.pointer-events-none]="showLoader()">
      <router-outlet></router-outlet>
      <app-cookies-banner></app-cookies-banner>
      <app-back-to-top></app-back-to-top>
      <app-update-banner></app-update-banner>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'U kelnerów';

  // Loader widoczny tylko na pierwszym wejściu i do pełnego załadowania zasobów (w tym obrazów)
  showLoader = signal(true);

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      // Na serwerze loader nie ma sensu
      this.showLoader.set(false);
      return;
    }

    // Pokazujemy loader przez stałe 2 sekundy przy KAŻDYM wejściu
    setTimeout(() => {
      if (this.showLoader()) {
        this.finishLoading();
      }
    }, 2000);
  }

  private finishLoading(): void {
    this.showLoader.set(false);
  }
}
