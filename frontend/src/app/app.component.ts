import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookiesBannerComponent } from './shared/components/cookies-banner/cookies-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookiesBannerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-cookies-banner></app-cookies-banner>
  `,
  styles: []
})
export class AppComponent {
  title = 'Restauracja Złota';
}
