import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpResponse } from '../model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);
  isChatOpen = signal(false);
  activeSection = signal<any>(null);
  private getHeaders(token: string | null): HttpHeaders {
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getCourseWithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Learning/course/${courseId}`, {
      headers: this.getHeaders(token)
    });
  }

  getLectureSectionsWithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Learning/course/${courseId}/lecture-sections`, {
      headers: this.getHeaders(token)
    });
  }

  getCourseProgressWithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Learning/course/${courseId}/progress`, {
      headers: this.getHeaders(token)
    });
  };

  toggleChat() {
    this.isChatOpen.set(!this.isChatOpen());
  }

}
