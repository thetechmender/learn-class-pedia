import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ClassroomSession {
  courseId: number | null;
  lectureId: string | null;
  sessionToken: string | null;
  careerPathLevelDetailId?: number | null;
  storedAt?: number;
}

export interface UserSession {
  token: string;
  customerId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  tokenExpirationTime: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  data?: {
    customerId: number;
    token: string;
    tokenExpirationTime: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    profileImageUrl?: string;
    isDetailFilled: boolean;
    isEmailVerified: boolean;
    isExistingCustomer: boolean;
  };
  errorMessage?: string;
  statusCode: number;
}

export interface EnrolledCourse {
  resourceId: number;
  resourceTypeId: number;
  resourceType: string;
  courseName: string;
  courseThumbnail?: string;
  description?: string;
  completionPercentage: number;
  courseSlug: string;
  courseType: string;
  certificateUrl?: string;
  courseId?: number;
  careerPathLevelDetailId?: number;
}

export interface EnrolledCoursesResponse {
  isSuccess: boolean;
  data?: {
    enrolledCourses: EnrolledCourse[];
    totalCount: number;
  };
  errorMessage?: string;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

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

  getToken(): string | null {
    const session = this.getStoredSession();
    return session?.sessionToken || null;
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

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.API_URL}/Signup/Login`, {
      email,
      password,
      sessionId: ''
    });
  }

  storeUserSession(session: UserSession): void {
    if (this.isBrowser) {
      sessionStorage.setItem('user_session', JSON.stringify(session));
      
      this.storeSession({
        courseId: null,
        lectureId: null,
        sessionToken: session.token,
        careerPathLevelDetailId: null
      });
    }
  }

  getUserSession(): UserSession | null {
    if (!this.isBrowser) return null;
    
    const stored = sessionStorage.getItem('user_session');
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  isUserAuthenticated(): boolean {
    const userSession = this.getUserSession();
    if (!userSession) return false;

    const expirationTime = new Date(userSession.tokenExpirationTime);
    return expirationTime > new Date();
  }

  logout(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('user_session');
      sessionStorage.removeItem('classroom_session');
    }
  }

  getEnrolledCourses(): Observable<EnrolledCoursesResponse> {
    return this.http.get<EnrolledCoursesResponse>(`${environment.API_URL}/CustomerProfile/GetEnrolledCourses`);
  }
}
