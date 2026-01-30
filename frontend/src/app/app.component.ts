import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookiesBannerComponent } from './shared/components/cookies-banner/cookies-banner.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top.component';
import { UpdateBannerComponent } from './shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookiesBannerComponent, BackToTopComponent, UpdateBannerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-cookies-banner></app-cookies-banner>
    <app-back-to-top></app-back-to-top>
    <app-update-banner></app-update-banner>
  `,
  styles: []
})
export class AppComponent {
  title = 'U kelnerów';
}
