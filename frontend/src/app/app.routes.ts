import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Landing page (animowana wejściówka)
  {
    path: 'welcome',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  
  // Strona główna
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  
  // Menu
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.component').then(m => m.MenuComponent)
  },
  
  // O nas
  {
    path: 'o-nas',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  
  // Kontakt
  {
    path: 'kontakt',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  
  // Rezerwacja
  {
    path: 'rezerwacja',
    loadComponent: () => import('./pages/reservation/reservation.component').then(m => m.ReservationComponent)
  },

  
  // ========== Panel Admin ==========
  {
    path: 'admin',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./admin/pages/login/login.component').then(m => m.AdminLoginComponent),
        canActivate: [guestGuard]
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/pages/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'reservations',
        loadComponent: () => import('./admin/pages/reservations/reservations.component').then(m => m.AdminReservationsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'menu',
        loadComponent: () => import('./admin/pages/menu/menu-management.component').then(m => m.MenuManagementComponent),
        canActivate: [authGuard]
      },
      {
        path: 'menu/categories/:id',
        loadComponent: () => import('./admin/pages/menu/category-editor.component').then(m => m.CategoryEditorComponent),
        canActivate: [authGuard]
      },
      {
        path: 'menu/items/new',
        loadComponent: () => import('./admin/pages/menu/item-editor.component').then(m => m.ItemEditorComponent),
        canActivate: [authGuard]
      },
      {
        path: 'menu/items/:id',
        loadComponent: () => import('./admin/pages/menu/item-editor.component').then(m => m.ItemEditorComponent),
        canActivate: [authGuard]
      },
      {
        path: 'tables',
        loadComponent: () => import('./admin/pages/tables/tables-management.component').then(m => m.TablesManagementComponent),
        canActivate: [authGuard]
      },
      {
        path: 'tables/manage',
        loadComponent: () => import('./admin/pages/tables/table-management.component').then(m => m.TableManagementComponent),
        canActivate: [authGuard]
      },
      {
        path: 'locations',
        loadComponent: () => import('./admin/pages/locations/locations-management.component').then(m => m.LocationsManagementComponent),
        canActivate: [authGuard]
      }
    ]
  },
  
  // 404 - redirect to home
  {
    path: '**',
    redirectTo: ''
  }
];
