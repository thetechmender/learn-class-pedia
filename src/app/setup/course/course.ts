import { Component, OnInit, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course.html',
  styleUrl: './course.sass'
})
export class CourseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  course = signal<any>(null);
  lectureSection = signal<any>(null);
  courseTitle = signal<string>('');
  progress = signal<any>(null);
  lectureContent = signal<SafeHtml>('');
  groupedByTitle = signal<Record<string, Record<string, any[]>>>({});
  lectureTitles = computed(() => Object.keys(this.groupedByTitle()));
  activeSection = signal<any>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.route.queryParams.subscribe(params => {
      const token = params['t'] || params['token'];
      const courseId = params['courseId'];
      const lectureId = params['lectureId'];

      if (token && courseId) {
        this.authService.storeSession({
          courseId: parseInt(courseId),
          lectureId: lectureId || null,
          sessionToken: token
        });
        this.loadCourseDataWithToken(parseInt(courseId), token);
      } else {
        const existingSession = this.authService.getStoredSession();
        if (existingSession?.courseId && existingSession?.sessionToken) {
          this.loadCourseData(existingSession.courseId);
        } else {
          this.error.set('No access token provided. Please access through the main portal.');
          this.isLoading.set(false);
        }
      }
    });
  }

  private loadCourseData(courseId: number) {
    const token = this.authService.getToken();
    this.loadCourseDataWithToken(courseId, token);
  }

  private loadCourseDataWithToken(courseId: number, token: string | null) {
    this.isLoading.set(true);

    this.courseService.getLectureSectionsWithToken(courseId, token).subscribe({
      next: (res: any) => {

        const data = res?.isSuccess !== undefined ? res.data : res;

        // 1️⃣ Raw lecture sections
        this.lectureSection.set(data);

        // 2️⃣ Group by sectionTitle first, then by sectionType
        if (Array.isArray(data)) {
          const grouped: Record<string, Record<string, any[]>> = {};

          data.forEach((item: any) => {
            const title = item.sectionTitle;
            const type = item.sectionType;

            if (!grouped[title]) {
              grouped[title] = {};
            }
            if (!grouped[title][type]) {
              grouped[title][type] = [];
            }
            grouped[title][type].push(item);
          });

          this.groupedByTitle.set(grouped);
        }

        // 3️⃣ Load first section content by default
        if (Array.isArray(data) && data.length > 0 && data[0]?.content) {
          this.activeSection.set(data[0]);
          this.courseTitle.set(data[0].sectionTitle);
          this.lectureContent.set(
            this.sanitizer.bypassSecurityTrustHtml(data[0].content)
          );
        }

        this.isLoading.set(false);
      },

      error: (err: any) => {
        console.error('Lecture Sections Error:', err);
        this.isLoading.set(false);
      }
    });

    this.courseService.getCourseProgressWithToken(courseId, token).subscribe({
      next: (res: any) => {
        console.log('Progress Response:', res);
        const data = res.isSuccess !== undefined ? res.data : res;
        this.progress.set(data);
      },
      error: (err: any) => console.error('Progress Error:', err)
    });
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  getSectionHeading(type: string): string {
    const map: Record<string, string> = {
      introduction: 'Introduction',
      main_topic_early: 'Main Topic',
      main_topic_mid: 'Main Topic (Intermediate)',
      main_topic_advanced: 'Main Topic Advanced',
      facts: 'Facts / Case Studies',
      summary: 'Summary',
      conclusion: 'Conclusion'
    };

    return map[type] ?? type;
  }

  getSectionTypesForTitle(title: string): string[] {

    const titleData = this.groupedByTitle()[title];
    return titleData ? Object.keys(titleData) : [];
  }

  onSectionSelect(section: any) {
    this.courseTitle.set(section.sectionTitle);
    this.activeSection.set(section);

    this.lectureContent.set(
      this.sanitizer.bypassSecurityTrustHtml(section.content)
    );
  }

  logout() {
    this.authService.clearSession();
  }
}
