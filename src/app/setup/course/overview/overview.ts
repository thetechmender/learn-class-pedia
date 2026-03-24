import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.sass',
})
export class Overview {
  @Input() courseTypeId: string | number = 0;
  @Input() title: string = '';
  @Input() courseTree: any = null;

  courseService = inject(CourseService);
  
  expandedCertificates = signal<Set<number>>(new Set());

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

  getTotalVideos(): number {
    return this.getTotalLectures();
  }

  getTotalPDFs(): number {
    return this.getTotalLectures();
  }
}
