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
          // Add security headers to prevent token theft
          const headers: { [key: string]: string } = {
            'Authorization': `Bearer ${session.sessionToken}`,
            'X-Requested-With': 'XMLHttpRequest',
            'X-Client-Origin': window.location.origin
          };
          
          // Add referrer if available
          if (document.referrer) {
            headers['X-Referrer'] = document.referrer;
          }
          
          const clonedReq = req.clone({
            setHeaders: headers
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
