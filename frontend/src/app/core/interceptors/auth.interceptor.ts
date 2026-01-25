import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Jeśli błąd 401 (Unauthorized), przekieruj do logowania
      if (error.status === 401) {
        // Usuń stary token i dane admina
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('admin');
        
        // Przekieruj do logowania tylko jeśli nie jesteśmy już na stronie logowania
        if (!router.url.includes('/admin/login')) {
          router.navigate(['/admin/login'], { 
            queryParams: { returnUrl: router.url } 
          });
        }
      }
      
      return throwError(() => error);
    })
  );
};
