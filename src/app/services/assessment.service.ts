import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class AssessmentService {
    private apiUrl = environment.API_URL;
    private http = inject(HttpClient);


    getAssessmentQuestions(courseId: number, token: string | null): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/assessment/${courseId}/questions`, {
            headers: this.getHeaders(token)
        });
    }

    private getHeaders(token: string | null): HttpHeaders {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    };

      submitAssessment(payload: any = {}, token: string | null): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/assessment/submit`, payload, {
            headers: this.getHeaders(token)
        });
    }
  getCourseCertificateAssessment(courseId: number, token: string | null) {
       return this.http.get<any>(
      `${this.apiUrl}/assessment/certificate/${courseId}/final-assessment`,
      {
        headers: this.getHeaders(token)
      }
    );
  };

    getProfessionalCourseAssessment(courseId: number, token: string | null) {
       return this.http.get<any>(
      `${this.apiUrl}/assessment/professional/${courseId}/final-assessment`,
      {
        headers: this.getHeaders(token)
      }
    );
  }
}