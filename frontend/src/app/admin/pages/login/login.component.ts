import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-stone-900 flex items-center justify-center p-6">
      <!-- Background -->
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-br from-brown-950/50 via-stone-900 to-brown-900/30"></div>
        <div class="absolute inset-0 opacity-5"
             [style.background-image]="patternStyle">
        </div>
      </div>

      <div class="relative w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-brown-600 to-brown-800 
                      flex items-center justify-center shadow-xl mb-4">
            <span class="font-display text-white text-2xl font-bold">Z</span>
          </div>
          <h1 class="font-display text-2xl text-warm-100 font-semibold">Panel Administracyjny</h1>
          <p class="text-warm-500 text-sm mt-1">Restauracja Złota</p>
        </div>

        <!-- Login Form -->
        <div class="bg-stone-800/50 backdrop-blur-md rounded-sm shadow-2xl p-8 border border-stone-700/50">
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-warm-300 text-sm font-medium mb-2">Email</label>
              <input 
                type="email"
                [(ngModel)]="credentials.email"
                name="email"
                class="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-sm
                       text-warm-100 placeholder-stone-500
                       focus:outline-none focus:border-brown-500 focus:ring-2 focus:ring-brown-500/20
                       transition-all duration-300"
                placeholder="admin@restauracja.pl"
                required
              >
            </div>

            <div>
              <label class="block text-warm-300 text-sm font-medium mb-2">Hasło</label>
              <div class="relative">
                <input 
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="credentials.password"
                  name="password"
                  class="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-sm
                         text-warm-100 placeholder-stone-500
                         focus:outline-none focus:border-brown-500 focus:ring-2 focus:ring-brown-500/20
                         transition-all duration-300"
                  placeholder="••••••••"
                  required
                >
                <button 
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-warm-300 transition-colors"
                >
                  <svg *ngIf="!showPassword()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showPassword()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
            </div>

            <div *ngIf="errorMessage()" class="p-3 bg-red-900/30 border border-red-800 rounded-sm">
              <p class="text-red-400 text-sm">{{ errorMessage() }}</p>
            </div>

            <button 
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-3 bg-brown-700 text-white font-semibold rounded-sm
                     hover:bg-brown-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300"
            >
              <span *ngIf="!isLoading()">Zaloguj się</span>
              <span *ngIf="isLoading()" class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Logowanie...
              </span>
            </button>
          </form>
        </div>

        <!-- Back link -->
        <div class="text-center mt-6">
          <a href="/" class="text-warm-500 text-sm hover:text-brown-400 transition-colors">
            ← Powrót do strony głównej
          </a>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  patternStyle = 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage.set('Wypełnij wszystkie pola');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigate([returnUrl]);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Wystąpił błąd podczas logowania');
      }
    });
  }
}
