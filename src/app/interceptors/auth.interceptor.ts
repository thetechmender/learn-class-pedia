import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformBrowser(platformId)) {
    let token: string | null = null;
    
    const classroomSession = sessionStorage.getItem('classroom_session');
    if (classroomSession) {
      try {
        const session = JSON.parse(classroomSession);
        token = session?.sessionToken;
      } catch {
        // ignore parse error
      }
    }
    
    if (!token) {
      const userSession = sessionStorage.getItem('user_session');
      if (userSession) {
        try {
          const session = JSON.parse(userSession);
          token = session?.token;
        } catch {
          // ignore parse error
        }
      }
    }
    
    if (token) {
      const headers: { [key: string]: string } = {
        'Authorization': `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Origin': window.location.origin
      };
      
      if (document.referrer) {
        headers['X-Referrer'] = document.referrer;
      }
      
      const clonedReq = req.clone({
        setHeaders: headers
      });
      return next(clonedReq);
    }
  }

  return next(req);
};
