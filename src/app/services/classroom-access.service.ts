import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassroomAccessService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  validateClassroomAccess(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/classroom/validate-access`, {
      params: { courseId: courseId.toString() },
      withCredentials: true
    });
  }

  checkAuthStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`, {
      withCredentials: true
    });
  }
}
