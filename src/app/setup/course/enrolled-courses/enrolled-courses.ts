import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-enrolled-courses',
  imports: [
    // DecimalPipe
  ],
  templateUrl: './enrolled-courses.html',
  styleUrl: './enrolled-courses.sass',
})
export class EnrolledCourses implements OnInit {
  enrolledCourses = signal<any>(null);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this._fetchEnrolledCourses()
  };

  _fetchEnrolledCourses() {
    const token = this.authService.getToken();
    this.courseService.getEnrolledCourse(token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses: any) => {
          this.enrolledCourses.set(courses['data']['enrolledCourses'] || []);
        },
        error: (err: any) => {
          console.error('Get Enrolled Courses Error:', err);
        }
      });
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
