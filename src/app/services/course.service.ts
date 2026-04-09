import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface AskCourseQuestionPayload {
  customerId: number;
  cpCourseDetailId: number;
  question: string;
  threadId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = environment.API_URL;
  private chatbotApiUrl = 'https://chatbot.thetechmenders.com/api';
  private http = inject(HttpClient);
  isChatOpen = signal(false);
  activeSection = signal<any>(null);

  askCourseQuestion(payload: AskCourseQuestionPayload): Observable<any> {
    return this.http.post<any>(`${this.chatbotApiUrl}/CourseQuestion/ask`, payload, {
      headers: new HttpHeaders({
        accept: '*/*',
        'Content-Type': 'application/json'
      })
    });
  }
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

  getCourseDetailsV2WithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/learning/v2/course/${courseId}`, {
      headers: this.getHeaders(token)
    });
  }

  getLectureSectionsWithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Learning/course/${courseId}/lecture-sections`, {
      headers: this.getHeaders(token)
    });
  }

  getLectureSectionsV2WithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/learning/v2/course/${courseId}/lecture-sections`, {
      headers: this.getHeaders(token)
    });
  }

  getCourseHierarchyV2WithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/learning/v2/course/${courseId}/hierarchy`, {
      headers: this.getHeaders(token)
    });
  }

  getCertificateHierarchyV2WithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/learning/v2/course/${courseId}/certificate-hierarchy`, {
      headers: this.getHeaders(token)
    });
  }

  getCourseTreeV2WithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/learning/v2/course/${courseId}/tree`, {
      headers: this.getHeaders(token)
    });
  };

  // Career Path APIs
  getCareerPathDetailWithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/learning/v2/careerPathDetail/${courseId}`, {
      headers: this.getHeaders(token)
    });
  }

  getCareerPathTreeWithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/learning/v2/careerPathLevel/${courseId}/tree`, {
      headers: this.getHeaders(token)
    });
  }

  getRelatedCourse(courseIds: string | null = null, token: string | null) {
    return this.http.post<any>(
      `${this.apiUrl}/Courses/SimilarCourses`,
      { courseIds },
      {
        headers: this.getHeaders(token)
      }
    );
  };

   getEnrolledCourse( token: string | null) {
    return this.http.get<any>(
      `${this.apiUrl}/CustomerProfile/GetEnrolledCourses`,
      {
        headers: this.getHeaders(token)
      }
    );
  };

  getShortCourseDetails(courseSlug: string  = '', token: string | null){
       return this.http.post<any>(
      `${this.apiUrl}/Courses/ShortCourseDetail`,
      { courseSlug },
      {
        headers: this.getHeaders(token)
      }
    );
  }

  getCourseCertificateDetails(courseSlug: string  = '', token: string | null){
       return this.http.post<any>(
      `${this.apiUrl}/Courses/CourseCertificates1`,
      { courseSlug },
      {
        headers: this.getHeaders(token)
      }
    );
  }

    getProfessionalCertificateDetails(courseSlug: string  = '', token: string | null){
       return this.http.post<any>(
      `${this.apiUrl}/Courses/ProfessionalCertificate1`,
      { courseSlug },
      {
        headers: this.getHeaders(token)
      }
    );
  };



  completeCourse(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/learning/v2/course/complete`, payload);
  }

  getUnifiedLectureSectionsByTypeV2WithToken(courseId: number, token: string | null, courseTypeId: number): Observable<any[]> {
    if (courseTypeId === 1) {
      return this.getCourseHierarchyV2WithToken(courseId, token).pipe(
        map((res: any) => res?.isSuccess !== undefined ? res.data : res),
        map((hierarchy: any) => this.flattenProfessionalHierarchyToLectureSections(hierarchy))
      );
    }

    if (courseTypeId === 2) {
      return this.getCertificateHierarchyV2WithToken(courseId, token).pipe(
        map((res: any) => res?.isSuccess !== undefined ? res.data : res),
        map((hierarchy: any) => this.flattenCertificateHierarchyToLectureSections(hierarchy))
      );
    }

    if (courseTypeId === 3) {
      return this.getLectureSectionsV2WithToken(courseId, token).pipe(
        map((res: any) => res?.isSuccess !== undefined ? res.data : res)
      );
    }

    return new Observable<any[]>((subscriber) => {
      subscriber.next([]);
      subscriber.complete();
    });
  }

  getUnifiedLectureSectionsV2WithToken(courseId: number, token: string | null): Observable<any[]> {
    return this.getCourseTreeV2WithToken(courseId, token).pipe(
      map((res: any) => res?.isSuccess !== undefined ? res.data : res),
      map((tree: any) => this.flattenTreeToLectureSections(tree))
    );
  }

  extractLectureSectionsFromTree(tree: any): any[] {
    return this.flattenTreeToLectureSections(tree);
  }

  private flattenProfessionalHierarchyToLectureSections(hierarchy: any): any[] {
    if (!hierarchy) return [];
    const out: any[] = [];

    const certificates = hierarchy?.courseCertificates;
    if (!Array.isArray(certificates)) return out;

    certificates.forEach((cert: any) => {
      const shortCourses = cert?.shortCourses;
      if (!Array.isArray(shortCourses)) return;

      shortCourses.forEach((sc: any) => {
        const lectures = sc?.lectures;
        if (Array.isArray(lectures)) out.push(...lectures);
      });
    });

    return out;
  }

  private flattenCertificateHierarchyToLectureSections(hierarchy: any): any[] {
    if (!hierarchy) return [];
    const out: any[] = [];

    const shortCourses = hierarchy?.shortCourses;
    if (!Array.isArray(shortCourses)) return out;

    shortCourses.forEach((sc: any) => {
      const lectures = sc?.lectures;
      if (Array.isArray(lectures)) out.push(...lectures);
    });

    return out;
  }

  private flattenTreeToLectureSections(tree: any): any[] {
    if (!tree) return [];

    if (Array.isArray(tree?.shortCourseLectures)) {
      return tree.shortCourseLectures;
    }

    const out: any[] = [];

    const professionalCertificates = tree?.professionalCourse?.courseCertificates;
    if (Array.isArray(professionalCertificates)) {
      professionalCertificates.forEach((cert: any) => {
        const shortCourses = cert?.shortCourses;
        if (!Array.isArray(shortCourses)) return;

        shortCourses.forEach((sc: any) => {
          const lectures = sc?.lectures;
          if (Array.isArray(lectures)) out.push(...lectures);
        });
      });
    }

    const certificateShortCourses = tree?.certificateCourse?.shortCourses;
    if (Array.isArray(certificateShortCourses)) {
      certificateShortCourses.forEach((sc: any) => {
        const lectures = sc?.lectures;
        if (Array.isArray(lectures)) out.push(...lectures);
      });
    }

    return out;
  }

  getCourseProgressWithToken(courseId: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/learning/v2/course/${courseId}/progress`, {
      headers: this.getHeaders(token)
    });
  };

  updateCourseProgressWithToken(payload: any, token: string | null): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/learning/v2/course/progress`, payload, {
      headers: this.getHeaders(token)
    });
  };

  saveNotebook(payload: any, token: string | null): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/learning/v2/notebook`, payload, {
      headers: this.getHeaders(token)
    });
  }

  getNotebooks(shortCourseId: number, courseCertificateId: number | null, professionalCertificateId: number | null, token: string | null): Observable<any> {
    let url = `${this.apiUrl}/learning/v2/notebook/course/${shortCourseId}`;
    const params: string[] = [];
    if (courseCertificateId) {
      params.push(`courseCertificateId=${courseCertificateId}`);
    }
    if (professionalCertificateId) {
      params.push(`professionalCertificateId=${professionalCertificateId}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<any>(url, {
      headers: this.getHeaders(token)
    });
  }

  deleteNotebook(noteId: number, token: string | null): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/learning/v2/notebook/${noteId}`, {
      headers: this.getHeaders(token)
    });
  }

  updateNotebook(noteId: number, payload: { videoTimeSeconds: number; noteText: string }, token: string | null): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/learning/v2/notebook/${noteId}`, payload, {
      headers: this.getHeaders(token)
    });
  }

  toggleChat() {
    this.isChatOpen.set(!this.isChatOpen());
  }

}
