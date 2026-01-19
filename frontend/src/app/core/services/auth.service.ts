import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'staff';
  locations: string[];
}

export interface LoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adminSignal = signal<Admin | null>(null);
  private tokenSignal = signal<string | null>(null);

  admin = computed(() => this.adminSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());
  isAdmin = computed(() => this.adminSignal()?.role === 'admin');

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    
    if (token && adminData) {
      this.tokenSignal.set(token);
      this.adminSignal.set(JSON.parse(adminData));
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('admin', JSON.stringify(response.admin));
          this.tokenSignal.set(response.token);
          this.adminSignal.set(response.admin);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    this.tokenSignal.set(null);
    this.adminSignal.set(null);
    this.router.navigate(['/admin/login']);
  }

  checkAuth(): Observable<any> {
    return this.api.get<any>('/auth/me').pipe(
      tap(response => {
        if (response.success) {
          this.adminSignal.set(response.admin);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
