import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookiesBannerComponent } from './shared/components/cookies-banner/cookies-banner.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookiesBannerComponent, BackToTopComponent],
  template: `
    <router-outlet></router-outlet>
    <app-cookies-banner></app-cookies-banner>
    <app-back-to-top></app-back-to-top>
  `,
  styles: []
})
export class AppComponent {
  title = 'Restauracja Złota';
}
