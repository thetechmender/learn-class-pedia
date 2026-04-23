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



  // Signals for attempt status

  attemptsUsed = signal<number>(0);

  attemptsRemaining = signal<number>(3);

  maxAttempts = signal<number>(3);

  isAttemptLimitReached = signal<boolean>(false);

  isAssessmentCompleted = signal<boolean>(false);

  canTakeAssessment = signal<boolean>(true);



  getQuizQuestions(courseId: number, token: string | null): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/assessment/quiz/${courseId}/questions`, {

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



  submitQuizAssessment(payload: any = {}, token: string | null): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/assessment/quiz/submit`, payload, {

      headers: this.getHeaders(token)

    });

  };



  submitFinalAssessment(

    courseTypeId: number,

    payload: any = {},

    token: string | null

  ): Observable<any> {



    let endpoint = '';



    switch (courseTypeId) {

      case 1: // professional

        endpoint = 'professional';

        break;



      case 2: // certificate

        endpoint = 'certificate';

        break;



      case 3: // short-course

        endpoint = 'short-course';

        break;



      default:

        throw new Error('Invalid courseTypeId');

    }



    return this.http.post<any>(

      `${this.apiUrl}/assessment/${endpoint}/final-assessment/submit`,

      payload,

      { headers: this.getHeaders(token) }

    );

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



  getShortCourseAssessment(courseId: number, token: string | null) {

    return this.http.get<any>(

      `${this.apiUrl}/assessment/short-course/${courseId}/final-assessment`,

      {

        headers: this.getHeaders(token)

      }

    );

  }



  getCareerPathAssessment(careerPathLevelMapId: number, token: string | null) {

    return this.http.get<any>(

      `${this.apiUrl}/assessment/career-path/${careerPathLevelMapId}/final-assessment`,

      {

        headers: this.getHeaders(token)

      }

    );

  }



  submitCareerPathAssessment(payload: any = {}, token: string | null): Observable<any> {

    // For career path assessments, ensure professionalCertificateId is null when careerPathLevelMapId is present

    const modifiedPayload = { ...payload };

    if (modifiedPayload.careerPathLevelMapId) {

      modifiedPayload.professionalCertificateId = null;

    }



    return this.http.post<any>(

      `${this.apiUrl}/assessment/career-path/final-assessment/submit`,

      modifiedPayload,

      { headers: this.getHeaders(token) }

    );

  }



  getQuizesResult(payload: any, token: string | null) {

    return this.http.post<any>(

      `${this.apiUrl}/assessment/coursewiseresult`,

      payload,

      {

        headers: this.getHeaders(token)

      }

    );

  }



  getAttemptStatus(courseId: number, token: string | null, careerPathLevelMapId?: number): Observable<any> {

    let url: string;



    if (careerPathLevelMapId) {

      // Career path: use query parameter

      url = `${this.apiUrl}/assessment/attempt-status?careerPathLevelMapId=${careerPathLevelMapId}`;

    } else {

      // Regular course: use query parameter

      url = `${this.apiUrl}/assessment/attempt-status?courseId=${courseId}`;

    }



    return this.http.get<any>(url, { headers: this.getHeaders(token) }).pipe(

      map(response => {

        if (response.isSuccess && response.data) {

          this.updateAttemptStatus(response.data);

        }

        return response;

      })

    );

  }



  updateAttemptStatus(data: any) {

    this.attemptsUsed.set(data.attemptsUsed || 0);

    this.attemptsRemaining.set(data.attemptsRemaining || 3);

    this.maxAttempts.set(data.maxAttempts || 3);

    this.isAttemptLimitReached.set(data.isAttemptLimitReached || false);

    this.isAssessmentCompleted.set(data.isAssessmentCompleted || false);

    this.canTakeAssessment.set(data.canTakeAssessment !== false);

  };



  updateAssessmentActivity(payload: any = {}, token: string | null) {

    return this.http.post(`${this.apiUrl}/CustomerProfile/UpdateEnrollmentActivity`, payload, {

      headers: this.getHeaders(token)

    })

  };



  startAssessmentTime(payload: any = {}, token: string | null): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/assessment/start`, payload, {

      headers: this.getHeaders(token)

    });

  };



  onNextSaveAssessment(payload: any = {}, token: string | null): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/assessment/question/save`, payload, {

      headers: this.getHeaders(token)

    });

  }



}