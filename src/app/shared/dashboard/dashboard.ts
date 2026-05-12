import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, EnrolledCourse } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SkeletonComponent } from '../skeleton/skeleton';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.sass',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  courses = signal<EnrolledCourse[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  userSession = signal(this.authService.getUserSession());

  ngOnInit(): void {
    this.loadEnrolledCourses();
  }

  loadEnrolledCourses(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.getEnrolledCourses().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.enrolledCourses) {
          this.courses.set(response.data.enrolledCourses);
        } else {
          this.error.set(response.errorMessage || 'Failed to load courses');
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.error.set('An error occurred while loading your courses');
        this.isLoading.set(false);
      }
    });
  }

  selectCourse(course: EnrolledCourse): void {
    const token = this.authService.getUserSession()?.token;
    if (!token) {
      this.toastr.error('Authentication token not found', 'Error');
      return;
    }

    this.authService.storeSession({
      courseId: course.courseId || course.resourceId,
      lectureId: null,
      sessionToken: token,
      careerPathLevelDetailId: course.careerPathLevelDetailId ?? null
    });

    const queryParams: any = {
      courseId: course.courseId || course.resourceId
    };

    if (course.careerPathLevelDetailId) {
      queryParams.careerPathLevelDetailId = course.careerPathLevelDetailId;
    }

    this.router.navigate(['/course'], { queryParams });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.toastr.info('You have been logged out', 'Logged Out');
  }

  getCourseProgress(course: EnrolledCourse): number {
    return course.completionPercentage || 0;
  }

  getCourseTypeColor(courseType: string): string {
    const type = courseType.toLowerCase();
    if (type.includes('professional')) return 'bg-purple-100 text-purple-800';
    if (type.includes('certificate')) return 'bg-blue-100 text-blue-800';
    if (type.includes('short')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  }
}
