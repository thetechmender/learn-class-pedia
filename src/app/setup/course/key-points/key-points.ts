import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-key-points',
  imports: [],
  templateUrl: './key-points.html',
  styleUrl: './key-points.sass',
})
export class KeyPoints implements OnInit {
  @Input() courseTypeId: any = null;
  @Input() slug: string = '';
  courseService = inject(CourseService);
  private authService = inject(AuthService);
  overView = signal<any>(null);
  private destroy$ = new Subject<void>();

  ngOnInit() {
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
}
