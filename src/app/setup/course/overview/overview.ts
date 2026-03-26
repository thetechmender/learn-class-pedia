import { Component, inject, Input, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.sass',
})
export class Overview implements OnInit, OnChanges {
  @Input() courseTypeId: any = null;
  @Input() title: string = '';
  @Input() slug: string = '';
  @Input() courseLevel: string = '';
  @Input() courseTree: any = null;
  @Input() courseId: any = null;

  courseService = inject(CourseService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  expandedCertificates = signal<Set<number>>(new Set());
  relatedCourses = signal<any>(null);
  overView = signal<any>(null);
  isLearningOutcomesExpanded = signal<boolean>(true);


  ngOnChanges(changes: SimpleChanges) {
    if (changes['slug'] && changes['slug'].currentValue) {
    }
  }

  ngOnInit() {
    this._fetchRelatedCourses();
    switch (this.courseTypeId) {
      case 1:
        this._fetchProfessionalCertificate()
        break;
      case 2:
        this._fetcCourseCertificate();
        break;
      case 3:
        this._fetchShortCourse();
        break;
    }

  }

  toggleCertificate(certId: number) {
    const current = new Set(this.expandedCertificates());
    if (current.has(certId)) {
      current.delete(certId);
    } else {
      current.add(certId);
    }
    this.expandedCertificates.set(current);
  }

  isCertificateExpanded(certId: number): boolean {
    return this.expandedCertificates().has(certId);
  }

  getTotalLectures(): number {
    if (!this.courseTree?.professionalCourse?.courseCertificates) return 0;
    let total = 0;
    this.courseTree.professionalCourse.courseCertificates.forEach((cert: any) => {
      if (cert.shortCourses) {
        total += cert.shortCourses.length;
      }
    });
    return total;
  }

  _fetchRelatedCourses() {
    const courseIds = this.authService.getCourseId();
    const token = this.authService.getToken();
    this.courseService.getRelatedCourse(courseIds?.toString() || null, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses: any) => {
          this.relatedCourses.set(courses['data']['courses'] || []);
        },
        error: (err: any) => {
          console.error('Refresh Course Tree Error:', err);
        }
      });
  }

  getTotalVideos(): number {
    return this.getTotalLectures();
  }

  getTotalPDFs(): number {
    return this.getTotalLectures();
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  _fetchShortCourse() {
    const token = this.authService.getToken();
    this.courseService.getShortCourseDetails(this.slug, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.overView.set(details['data'] || null);
          this.overView().releaseDate = new Date();
        },
        error: (err: any) => {
          console.error('Refresh Course Tree Error:', err);
        }
      });
  };

  _fetcCourseCertificate() {
    const token = this.authService.getToken();
    this.courseService.getCourseCertificateDetails(this.slug, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.overView.set(details['data'] || null);
          this.overView().releaseDate = new Date();
        },
        error: (err: any) => {
          console.error('Refresh Course Tree Error:', err);
        }
      });
  }

  _fetchProfessionalCertificate() {
    const token = this.authService.getToken();
    this.courseService.getProfessionalCertificateDetails(this.slug, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.overView.set(details['data'] || null);
          this.overView().releaseDate = new Date();
        },
        error: (err: any) => {
          console.error('Refresh Course Tree Error:', err);
        }
      });
  };

  formatDuration(minutes: number, onlyMinutes = false): string {
    if (!minutes || minutes <= 0) return '0m';

    // Sirf minutes dikhane hain
    if (onlyMinutes) {
      return `${minutes}m`;
    }

    // 60 se kam
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  getRoundedRating(): number {
    return Math.round(this.overView()?.averageRating || 0);
  }

  getAverageReviewRating(): number {
    const reviews = this.overView()?.reviews || [];
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
    return Math.round(total / reviews.length);
  }

}
