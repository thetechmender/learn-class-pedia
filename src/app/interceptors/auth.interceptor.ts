import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const clonedReq = req.clone({
    withCredentials: true,
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.redirectToLogin();
      }
      return throwError(() => error);
    })
  );
};
