import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="fixed left-0 top-0 bottom-0 w-64 bg-stone-900 text-warm-200 flex flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-stone-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brown-600 to-brown-800 
                      flex items-center justify-center">
            <span class="font-display text-white text-lg font-bold">Z</span>
          </div>
          <div>
            <span class="font-display text-lg text-warm-100 font-semibold">Admin</span>
            <p class="text-xs text-stone-500">Restauracja Złota</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <a 
          routerLink="/admin/dashboard"
          routerLinkActive="bg-brown-900/50 text-brown-400"
          class="flex items-center gap-3 px-4 py-3 rounded-sm text-warm-300 
                 hover:bg-stone-800 hover:text-warm-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Dashboard</span>
        </a>

        <a 
          routerLink="/admin/reservations"
          routerLinkActive="bg-brown-900/50 text-brown-400"
          class="flex items-center gap-3 px-4 py-3 rounded-sm text-warm-300 
                 hover:bg-stone-800 hover:text-warm-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>Rezerwacje</span>
        </a>

        <div class="pt-4 mt-4 border-t border-stone-800">
          <p class="px-4 text-xs text-stone-600 uppercase tracking-wider mb-2">Zarządzanie</p>
          
          <a 
            routerLink="/admin/menu"
            routerLinkActive="bg-brown-900/50 text-brown-400"
            class="flex items-center gap-3 px-4 py-3 rounded-sm text-warm-300 
                   hover:bg-stone-800 hover:text-warm-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <span>Menu</span>
          </a>

          <a 
            routerLink="/admin/locations"
            routerLinkActive="bg-brown-900/50 text-brown-400"
            class="flex items-center gap-3 px-4 py-3 rounded-sm text-warm-300 
                   hover:bg-stone-800 hover:text-warm-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span>Lokale</span>
          </a>

          <a 
            routerLink="/admin/tables"
            routerLinkActive="bg-brown-900/50 text-brown-400"
            class="flex items-center gap-3 px-4 py-3 rounded-sm text-warm-300 
                   hover:bg-stone-800 hover:text-warm-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span>Sprawdź dostępność</span>
          </a>
          <a 
            routerLink="/admin/tables/manage"
            routerLinkActive="bg-brown-900/50 text-brown-400"
            class="flex items-center gap-3 px-4 py-3 rounded-sm text-warm-300 
                   hover:bg-stone-800 hover:text-warm-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            <span>Ułóż stoliki</span>
          </a>
        </div>
      </nav>

      <!-- User & Logout -->
      <div class="p-4 border-t border-stone-800">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center">
            <span class="text-warm-200 font-medium">{{ getUserInitials() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-warm-100 text-sm font-medium truncate">
              {{ authService.admin()?.firstName }} {{ authService.admin()?.lastName }}
            </p>
            <p class="text-stone-500 text-xs truncate">{{ authService.admin()?.email }}</p>
          </div>
        </div>
        <button 
          (click)="logout()"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 
                 bg-stone-800 text-warm-300 rounded-sm
                 hover:bg-stone-700 hover:text-warm-100 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>Wyloguj</span>
        </button>
      </div>
    </aside>
  `
})
export class AdminSidebarComponent {
  constructor(public authService: AuthService) {}

  getUserInitials(): string {
    const admin = this.authService.admin();
    if (!admin) return '?';
    return `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
