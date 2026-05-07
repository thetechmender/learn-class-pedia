import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface ClassroomSession {
  courseId: number | null;
  lectureId: string | null;
  careerPathLevelDetailId?: number | null;
  storedAt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  storeSession(session: ClassroomSession): void {
    if (this.isBrowser) {
      sessionStorage.setItem('classroom_session', JSON.stringify({
        ...session,
        storedAt: Date.now()
      }));
    }
  }

  getStoredSession(): ClassroomSession | null {
    if (!this.isBrowser) return null;
    
    const stored = sessionStorage.getItem('classroom_session');
    if (!stored) return null;

    try {
      const session: ClassroomSession = JSON.parse(stored);
      return session;
    } catch {
      return null;
    }
  }

  getCourseId(): number | null {
    const session = this.getStoredSession();
    return session?.courseId || null;
  }

  clearSession(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('classroom_session');
    }
  }

  handleUnauthorized(): void {
    this.clearSession();
    this.router.navigate(['/unauthorized']);
  }

  redirectToLogin(): void {
    this.clearSession();
    window.location.href = '/login';
  }
}
