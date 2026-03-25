import { Component, inject, Input, signal ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.sass',
})
export class Overview implements OnInit {
  @Input() courseTypeId: any = null;
  @Input() title: string = '';
  @Input() courseTree: any = null;
  @Input() courseId: any = null;

  courseService = inject(CourseService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  expandedCertificates = signal<Set<number>>(new Set());
  relatedCourses = signal<any>(null)


  ngOnInit() {
    this._fetchRelatedCourses();
    // switch (this.authService.getUserRole()) {
    //   case 'admin':
    //     console.log('Admin');
    //     break;
    //   case 'manager':
    //     console.log('Manager');
    //     break;
    //   case 'user':
    //     console.log('User');
    //     break;
    //   default:
    //     console.log('Guest');
    //     break;
    // }
     
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
          console.log(courses)
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
}
