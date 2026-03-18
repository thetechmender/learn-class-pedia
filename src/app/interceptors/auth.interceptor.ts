import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformBrowser(platformId)) {
    const stored = sessionStorage.getItem('classroom_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session?.sessionToken) {
          const clonedReq = req.clone({
            setHeaders: {
              'Authorization': `Bearer ${session.sessionToken}`
            }
          });
          return next(clonedReq);
        }
      } catch {
        // ignore parse error
      }
    }
  }

  return next(req);
};
