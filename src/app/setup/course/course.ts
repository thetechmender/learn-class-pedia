import { Component, OnInit, inject, signal, computed, PLATFORM_ID, effect, AfterViewChecked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SpeechService } from '../../services/speech.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course.html',
  styleUrl: './course.sass'
})
export class CourseComponent implements OnInit, AfterViewChecked {
  private route = inject(ActivatedRoute);
  public courseService = inject(CourseService);
  private speechService = inject(SpeechService)
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
  isPlaying = signal(false);
  expandedChapters = signal<Set<string>>(new Set());

  allSections = computed(() => {
    const sections: any[] = [];
    const grouped = this.groupedByTitle();
    const titles = Object.keys(grouped);
    titles.forEach(title => {
      const types = Object.keys(grouped[title]);
      types.forEach(type => {
        sections.push(...grouped[title][type]);
      });
    });
    return sections;
  });

  currentSectionIndex = computed(() => {
    const active = this.activeSection();
    if (!active) return -1;
    return this.allSections().findIndex(s => 
      s.id === active.id && s.sectionTitle === active.sectionTitle && s.sectionType === active.sectionType
    );
  });

  currentTime = computed(() => this.speechService.currentTime());
  totalDuration = computed(() => this.speechService.totalDuration());
  currentWordIndex = computed(() => this.speechService.currentWordIndex());
  isCompleted = computed(() => this.speechService.isCompleted());

  highlightedContent = computed(() => {
    const section = this.activeSection();
    if (!section?.content) return '';
    
    const wordIndex = this.currentWordIndex();
    if (wordIndex < 0 || !this.isPlaying()) {
      return this.sanitizer.bypassSecurityTrustHtml(section.content);
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = section.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    const visibleWords = words.slice(0, wordIndex + 1);
    
    let highlightedText = '';
    visibleWords.forEach((word, idx) => {
      if (idx === wordIndex) {
        highlightedText += `<span id="current-word" class="bg-yellow-400 text-black px-0.5 rounded">${word}</span> `;
      } else {
        highlightedText += word + ' ';
      }
    });
    
    return this.sanitizer.bypassSecurityTrustHtml(`<p>${highlightedText.trim()}</p>`);
  });

  constructor() {
    effect(() => {
      if (this.isCompleted()) {
        this.isPlaying.set(false);
        this.speechService.isCompleted.set(false);
        this.speechService.isPaused.set(false);
      }
    });
  }

  toggleChapter(title: string) {
    const current = this.expandedChapters();
    const newSet = new Set(current);
    if (newSet.has(title)) {
      newSet.delete(title);
    } else {
      newSet.add(title);
    }
    this.expandedChapters.set(newSet);
  }

  isChapterExpanded(title: string): boolean {
    return this.expandedChapters().has(title);
  }
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
      main_topic_mid: 'Inter: Main Topic',
      main_topic_advanced: 'Adv: Main Topic',
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
    this.stopSpeech();
    
    this.courseTitle.set(section.sectionTitle);
    this.activeSection.set(section);

    this.lectureContent.set(
      this.sanitizer.bypassSecurityTrustHtml(section.content)
    );
  }

  logout() {
    this.authService.clearSession();
  };

  toggleSpeech() {
    if (this.isPlaying()) {
      this.speechService.pause();
      this.isPlaying.set(false);
    } else {
      if (this.speechService.isPaused()) {
        this.speechService.resume();
        this.isPlaying.set(true);
      } else {
        const section = this.activeSection();
        if (section?.content) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = section.content;
          const text = tempDiv.textContent || tempDiv.innerText || '';
          this.speechService.speak(text);
          this.isPlaying.set(true);
        }
      }
    }
  }

  stopSpeech() {
    this.speechService.stop();
    this.isPlaying.set(false);
  }

  goToPreviousSection() {
    const index = this.currentSectionIndex();
    const sections = this.allSections();
    if (index > 0) {
      this.onSectionSelect(sections[index - 1]);
    }
  }

  goToNextSection() {
    const index = this.currentSectionIndex();
    const sections = this.allSections();
    if (index < sections.length - 1) {
      this.onSectionSelect(sections[index + 1]);
    }
  }


  private isDraggingSlider = false;

  onSliderStart() {
    this.isDraggingSlider = true;
    if (this.isPlaying()) {
      this.speechService.pause();
    }
  }

  onSliderEnd() {
    this.isDraggingSlider = false;
  }

  onSliderChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const time = parseFloat(input.value);
    this.speechService.seekToTime(time);
    if (this.isPlaying()) {
      this.isPlaying.set(true);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private lastScrolledWordIndex = -1;

  ngAfterViewChecked() {
    if (this.isPlaying() && !this.isDraggingSlider && isPlatformBrowser(this.platformId)) {
      const wordIndex = this.currentWordIndex();
      if (wordIndex !== this.lastScrolledWordIndex && wordIndex >= 0) {
        this.lastScrolledWordIndex = wordIndex;
        const currentWord = document.getElementById('current-word');
        const container = document.getElementById('content-container');
        if (currentWord && container) {
          const wordRect = currentWord.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const scrollTop = container.scrollTop + (wordRect.top - containerRect.top) - (containerRect.height / 2);
          container.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
      }
    }
  }
}
