import { Component, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID, effect, AfterViewChecked, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SpeechService } from '../../services/speech.service';
import { Overview } from './overview/overview';
import { Notebook } from './notebook/notebook';
import { Transcript } from './transcript/transcript';
import { Download } from './download/download';
import { CompletionModal } from '../../shared/completion-modal/completion-modal';
import { StartAssessment } from '../assessment/start-assessment/start-assessment';
import { FinalAssessment } from '../assessment/final-assessment/final-assessment';
import { FailedAssessment } from '../assessment/failed-assessment/failed-assessment';
import { ClearedAssessment } from '../assessment/cleared-assessment/cleared-assessment';
import { ToastrService } from 'ngx-toastr';
import { map, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, Overview, Notebook, Transcript, Download, CompletionModal, StartAssessment, FinalAssessment, FailedAssessment, ClearedAssessment],
  templateUrl: './course.html',
  styleUrl: './course.sass',
  encapsulation: ViewEncapsulation.None
})
export class CourseComponent implements OnInit, OnDestroy, AfterViewChecked {
  private route = inject(ActivatedRoute);
  public courseService = inject(CourseService);
  private speechService = inject(SpeechService)
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private toastr = inject(ToastrService);

  chatInput = signal<string>('');
  chatThreadId = signal<string>('');
  isChatSending = signal<boolean>(false);
  chatMessages = signal<Array<{ role: 'bot' | 'user'; text: string }>>([
    {
      role: 'bot',
      text: "Hi, I'm your Course Companion. I can help you understand lessons, explain concepts, or guide you through tricky topics."
    }
  ]);

  course = signal<any>(null);
  courseTree = signal<any>(null);
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
  expandedCertificates = signal<Set<number>>(new Set());
  activeCertificateId = signal<number | null>(null);
  expandedShortCourses = signal<Set<number>>(new Set());
  activeTab = signal<'overview' | 'notebook' | 'transcript' | 'download'>('overview');
  activeLectureTitle = signal<string | null>(null);
  activeLectureIndex = signal<number>(0);
  lectureStartTimes: number[] = [];
  activeShortCourseId = signal<number | null>(null);
  isContentReady = signal(false);
  currentShortCourse = signal<any>(null);
  courseSlug = signal<string>('');
  showPauseOverlay = signal(false);
  private pauseOverlayTimeout: any = null;
  showCompletionModal = signal(false);
  completionData = signal<any>(null);
  isCompleting = signal(false);
  courseLevel = signal<string>('');
  assessmentStep = signal<'none' | 'start' | 'final' | 'failed' | 'cleared' | 'maxattempts'>('none');
  assessmentResult = signal<any>(null);
  completeOrderPayload = signal<any>({
    shortCourseId: null,
    courseCertificateId: null,
    professionalCertificateId: null
  });
  private destroy$ = new Subject<void>();
  private progressInterval: any = null;
  private progressStartTime: number = 0;
  private lastProgressUpdate: number = 0;
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

  isSidebarOpen = signal<boolean>(true);

  totalLearningItems = computed(() => {
    const sc = this.currentShortCourse();
    if (sc?.lectures) {
      return sc.lectures.length;
    }
    return 0;
  });

  completedItems = computed(() => {
    const progress = this.progress();
    if (!progress) return 0;
    const percentage = progress.completionPercentage || 0;
    const total = this.totalLearningItems();
    return Math.round((percentage / 100) * total);
  });

  completionPercentage = computed(() => {
    const progress = this.progress();
    return progress?.completionPercentage || 0;
  });

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

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

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = section.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.split(/\s+/).filter(w => w.length > 0);

    if (wordIndex < 0 || wordIndex >= words.length) {
      return this.sanitizer.bypassSecurityTrustHtml(section.content);
    }

    let highlightedText = '';
    words.forEach((word, idx) => {
      if (idx === wordIndex) {
        highlightedText += `<span id="current-word" style="background-color: #facc15; color: black; padding: 0 2px; border-radius: 2px;">${word}</span> `;
      } else {
        highlightedText += word + ' ';
      }
    });

    return this.sanitizer.bypassSecurityTrustHtml(`<div style="line-height: 2;">${highlightedText.trim()}</div>`);
  });

  constructor() {
    effect(() => {
      if (this.isCompleted()) {
        this.isPlaying.set(false);
        this.speechService.isCompleted.set(false);
        this.speechService.isPaused.set(false);
        // Auto-trigger: complete course then Start Assessment
        if (this.courseTree()?.courseTypeId !== 3) {
          this.completeAndTriggerAssessment();
        }
      }
    });
  }

  sendChatMessage() {
    const question = (this.chatInput() || '').trim();
    if (!question || this.isChatSending()) return;

    const tree = this.courseTree();
    const cpCourseDetailId = tree?.courseId;
    if (!cpCourseDetailId) {
      this.toastr.error('Course is not loaded yet. Please try again in a moment.', 'Error');
      return;
    }

    const payload = {
      customerId: 1,
      cpCourseDetailId: Number(cpCourseDetailId),
      question,
      threadId: this.chatThreadId() || ''
    };

    this.chatMessages.set([...this.chatMessages(), { role: 'user', text: question }]);
    this.chatInput.set('');
    this.isChatSending.set(true);

    this.courseService.askCourseQuestion(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const threadId = res?.data?.threadId ?? res?.threadId;
        if (typeof threadId === 'string' && threadId.length > 0) {
          this.chatThreadId.set(threadId);
        }

        const answer = res?.data?.answer ?? res?.answer ?? res?.data?.response ?? res?.response ?? res?.message;
        const text = typeof answer === 'string' && answer.trim().length > 0 ? answer : 'I could not find an answer for that.';
        this.chatMessages.set([...this.chatMessages(), { role: 'bot', text }]);
        this.isChatSending.set(false);
      },
      error: (err: any) => {
        this.isChatSending.set(false);
        this.toastr.error('Failed to send your question. Please try again.', 'Error');
        console.error('Ask Course Question Error:', err);
      }
    });
  }

  toggleChapter(title: string) {
    const current = this.expandedChapters();
    const newSet = new Set<string>();
    if (!current.has(title)) {
      newSet.add(title);
    }
    this.expandedChapters.set(newSet);
  }

  toggleCertificate(certificateId: number) {
    const current = new Set(this.expandedCertificates());
    if (current.has(certificateId)) {
      current.delete(certificateId);
    } else {
      current.add(certificateId);
    }
    this.expandedCertificates.set(current);
  }

  isCertificateExpanded(certificateId: number): boolean {
    return this.expandedCertificates().has(certificateId);
  }

  toggleShortCourse(shortCourseId: number) {
    const current = new Set(this.expandedShortCourses());
    if (current.has(shortCourseId)) {
      current.delete(shortCourseId);
    } else {
      current.add(shortCourseId);
    }
    this.expandedShortCourses.set(current);
  }

  isShortCourseExpanded(shortCourseId: number): boolean {
    return this.expandedShortCourses().has(shortCourseId);
  }

  onTreeLectureSelect(lecture: any) {
    if (!lecture) return;
    this.activeLectureTitle.set(lecture.title ?? lecture.sectionTitle ?? null);
    this.onSectionSelect(lecture);
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

    this.courseService.getCourseDetailsV2WithToken(courseId, token).pipe(
      map((res: any) => res?.isSuccess !== undefined ? res.data : res),
      switchMap((courseDetails: any) => {
        this.courseSlug.set(courseDetails?.slug || '');
        this.courseLevel.set(courseDetails?.courseLevelName || '');
        this.course.set(courseDetails);
        return this.courseService.getCourseTreeV2WithToken(courseId, token).pipe(
          map((treeRes: any) => treeRes?.isSuccess !== undefined ? treeRes.data : treeRes),
          map((tree: any) => {
            this.courseTree.set(tree);
            return this.courseService.extractLectureSectionsFromTree(tree);
          })
        );
      })
    ).subscribe({
      next: (data: any) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          this.isLoading.set(false);
          return;
        }
        this.lectureSection.set(data);
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
        const tree = this.courseTree();
        if (tree?.courseTypeId === 1 && tree?.professionalCourse?.courseCertificates?.length > 0) {
          const firstCert = tree.professionalCourse.courseCertificates[0];
          this.activeCertificateId.set(firstCert.courseCertificateId);
          this.expandedCertificates.set(new Set([firstCert.courseCertificateId]));
          this.completeOrderPayload.set({
            courseCertificateId: firstCert.courseCertificateId,
            shortCourseId: firstCert.shortCourses[0].shortCourseId,
            professionalCertificateId: this.courseTree()?.professionalCourse?.professionalCourseId
          })
          if (firstCert.shortCourses?.length > 0) {
            const firstSc = firstCert.shortCourses[0];
            this.selectFirstShortCourse(firstSc);
          }
          tree.professionalCourse.courseCertificates =
            tree.professionalCourse.courseCertificates.map((cert: any) => ({
              ...cert,
              shortCourses: (cert.shortCourses || []).map((sc: any) => ({
                ...sc,
                certificateId: cert.courseCertificateId
              }))
            }));
        } else if (tree?.courseTypeId === 2 && tree?.certificateCourse?.shortCourses?.length > 0) {
          this.completeOrderPayload.set({
            courseCertificateId: tree.courseId,
            shortCourseId: tree.certificateCourse.shortCourses[0].shortCourseId,
            professionalCertificateId: null
          })
          const firstSc = tree.certificateCourse.shortCourses[0];
          this.selectFirstShortCourse(firstSc);
        } else if (tree?.courseTypeId === 3 && tree?.shortCourseLectures?.length > 0) {
          this.completeOrderPayload.set({
            courseCertificateId: null,
            shortCourseId: tree.courseId,
            professionalCertificateId: null
          })
          const firstLec = tree.shortCourseLectures[0];
          this.selectFirstLecture(firstLec);
        }

        this.isLoading.set(false);
      },

      error: (err: any) => {
        console.error('Course Load Error:', err);
        this.isLoading.set(false);
      }
    });

    this.courseService.getCourseProgressWithToken(courseId, token).subscribe({
      next: (res: any) => {
        const data = res.isSuccess !== undefined ? res.data : res;
        this.progress.set(data);
        this.startProgressTracking(token);
      },
      error: (err: any) => console.error('Progress Error:', err)
    });
  }

  private startProgressTracking(token: string | null) {
    this.progressStartTime = Date.now();
    this.lastProgressUpdate = this.progress()?.secondsWatched || 0;

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    this.progressInterval = setInterval(() => {
      this.updateProgress(token);
    }, 20000);
  }

  private updateProgress(token: string | null) {
    const tree = this.courseTree();
    if (!tree) return;

    const elapsedSeconds = Math.floor((Date.now() - this.progressStartTime) / 1000);
    const totalSecondsWatched = this.lastProgressUpdate + elapsedSeconds;

    // Auto-detect current lecture based on audio position
    const currentAudioTime = this.speechService.currentTime();
    if (this.lectureStartTimes.length > 0) {
      for (let i = this.lectureStartTimes.length - 1; i >= 0; i--) {
        if (currentAudioTime >= this.lectureStartTimes[i]) {
          this.activeLectureIndex.set(i);
          break;
        }
      }
    }

    const currentLecIndex = this.activeLectureIndex();
    const totalLectures = this.totalLearningItems();
    const completionPercentage = totalLectures > 0
      ? Math.min(100, Math.round(((currentLecIndex + 1) / totalLectures) * 100 * 10) / 10)
      : 0;

    let payload: any = {
      shortCourseId: null,
      courseCertificateId: null,
      professionalCourseId: null,
      completionPercentage: completionPercentage,
      secondsWatched: totalSecondsWatched,
      lastPositionSeconds: this.speechService.currentTime() || 0
    };

    if (tree.courseTypeId === 1) {
      payload.shortCourseId = this.completeOrderPayload().shortCourseId;
      payload.courseCertificateId = this.completeOrderPayload().courseCertificateId;
      payload.professionalCourseId = this.completeOrderPayload().professionalCertificateId;
    } else if (tree.courseTypeId === 2) {
      payload.shortCourseId = this.completeOrderPayload().shortCourseId;
      payload.courseCertificateId = this.completeOrderPayload().courseCertificateId;
      payload.professionalCourseId = null;
    } else if (tree.courseTypeId === 3) {
      payload.shortCourseId = tree.courseId;
      payload.courseCertificateId = null;
      payload.professionalCourseId = null;
    }

    this.courseService.updateCourseProgressWithToken(payload, token).subscribe({
      next: (res: any) => {
        const data = res.isSuccess !== undefined ? res.data : res;
        this.progress.set(data);
        if (completionPercentage >= 100 && this.courseTree()?.courseTypeId !== 3) {
          this.completeAndTriggerAssessment();
        }
      },
      error: (err: any) => console.error('Progress Update Error:', err)
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

  // getSectionHeading(type: string): string {
  //   const map: Record<string, string> = {
  //     introduction: 'Introduction',
  //     main_topic_early: 'Main Topic',
  //     main_topic_mid: 'Inter: Main Topic',
  //     main_topic_advanced: 'Adv: Main Topic',
  //     facts: 'Facts / Case Studies',
  //     summary: 'Summary',
  //     conclusion: 'Conclusion'
  //   };

  //   return map[type] ?? type;
  // }

  getSectionTypesForTitle(title: string): string[] {
    const titleData = this.groupedByTitle()[title];
    return titleData ? Object.keys(titleData) : [];
  }

  getSectionDuration(section: any): number {
    if (!section?.content) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = section.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;
    const wordsPerMinute = 150;
    return Math.ceil((wordCount / wordsPerMinute) * 60);
  }

  formatSectionTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  }

  getLectureTotalDuration(lectureTitle: string): number {
    const grouped = this.groupedByTitle();
    const titleData = grouped[lectureTitle];
    if (!titleData) return 0;

    let totalSeconds = 0;
    Object.keys(titleData).forEach(sectionType => {
      const sections = titleData[sectionType];
      sections.forEach((section: any) => {
        totalSeconds += this.getSectionDuration(section);
      });
    });
    return totalSeconds;
  }

  getTotalCourseDuration(): number {
    const titles = this.lectureTitles();
    let totalSeconds = 0;
    titles.forEach(title => {
      totalSeconds += this.getLectureTotalDuration(title);
    });
    return totalSeconds;
  }

  getShortCourseDuration(sc: any): string {
    if (!isPlatformBrowser(this.platformId)) return '0min';

    let totalSeconds = 0;
    if (sc.lectures && sc.lectures.length > 0) {
      sc.lectures.forEach((lec: any) => {
        // Check lectureSections array
        if (lec.lectureSections && lec.lectureSections.length > 0) {
          lec.lectureSections.forEach((section: any) => {
            totalSeconds += this.getSectionDuration(section);
          });
        }
        // Also check if lecture itself has content
        if (lec.content) {
          totalSeconds += this.getSectionDuration(lec);
        }
      });
    }
    const mins = Math.max(1, Math.ceil(totalSeconds / 60));
    return `${mins} min`;
  }

  onSectionSelect(section: any) {
    this.stopSpeech();

    this.courseTitle.set(section.sectionTitle);
    this.activeSection.set(section);
    this.courseService.activeSection.set(section);

    this.lectureContent.set(
      this.sanitizer.bypassSecurityTrustHtml(section.content)
    );
  }

  onLectureSelect(lectureTitle: string) {
    this.toggleChapter(lectureTitle);
    this.activeLectureTitle.set(lectureTitle);

    // Get all sections for this lecture and combine their content
    const grouped = this.groupedByTitle();
    const sectionTypes = Object.keys(grouped[lectureTitle] || {});

    if (sectionTypes.length > 0) {
      // Get the first section to set as active
      const firstSection = grouped[lectureTitle][sectionTypes[0]][0];

      // Combine all section contents for this lecture
      let combinedContent = '';
      sectionTypes.forEach(type => {
        grouped[lectureTitle][type].forEach((section: any) => {
          combinedContent += section.content + '<br/><br/>';
        });
      });

      this.stopSpeech();
      this.courseTitle.set(lectureTitle);
      this.activeSection.set({ ...firstSection, content: combinedContent, sectionTitle: lectureTitle });
      this.courseService.activeSection.set({ ...firstSection, content: combinedContent, sectionTitle: lectureTitle });
      this.lectureContent.set(this.sanitizer.bypassSecurityTrustHtml(combinedContent));
    }
  }

  selectFirstShortCourse(sc: any) {
    // Select first short course on load - expand it and set as active
    this.activeShortCourseId.set(sc.shortCourseId);
    this.expandedShortCourses.set(new Set([sc.shortCourseId]));
    this.currentShortCourse.set(sc);
    this.courseTitle.set(sc.title);
    this.isContentReady.set(false);

    // Prepare lecture sections - collect all sections from all lectures
    const allSections: any[] = [];
    if (sc.lectures && sc.lectures.length > 0) {
      sc.lectures.forEach((lec: any) => {
        if (lec.lectureSections && lec.lectureSections.length > 0) {
          allSections.push(...lec.lectureSections);
        }
      });
    }
    if (allSections.length > 0) {
      this.lectureSection.set(allSections);
    }
  }

  selectFirstLecture(lec: any) {
    // For courseTypeId=3 - select first lecture directly (no accordion)
    this.courseTitle.set(lec.title || lec.courseTitle || 'Lecture');
    this.isContentReady.set(false);

    // Set lecture section with this single lecture
    this.lectureSection.set([lec]);

    // Create a pseudo short course object for playback compatibility
    this.currentShortCourse.set({
      shortCourseId: lec.id,
      title: lec.title || lec.courseTitle,
      lectures: [{ ...lec, lectureSections: [lec] }]
    });
  }

  onLectureSelectType3(lec: any) {
    this.completeOrderPayload.set({
      shortCourseId: lec?.id,
      courseCertificateId: null,
      professionalCertificateId: null
    });
    this.stopSpeech();
    this.courseTitle.set(lec.title || lec.courseTitle || 'Lecture');
    this.isContentReady.set(false);
    this.lectureContent.set('');

    // Set lecture section with this single lecture
    this.lectureSection.set([lec]);

    // Create a pseudo short course object for playback compatibility
    this.currentShortCourse.set({
      shortCourseId: lec.id,
      title: lec.title || lec.courseTitle,
      lectures: [{ ...lec, lectureSections: [lec] }]
    });
  }

  onShortCourseSelectType1(sc: any) {
    this.completeOrderPayload.set({
      shortCourseId: sc.shortCourseId,
      courseCertificateId: sc.certificateId,
      professionalCertificateId: this.courseTree()?.professionalCourse?.professionalCourseId
    });
    this.stopSpeech();
    this.activeShortCourseId.set(sc.shortCourseId);
    this.currentShortCourse.set(sc);
    this.courseTitle.set(sc.title);
    this.isContentReady.set(false);
    this.lectureContent.set('');

    // Toggle expand state
    const current = new Set(this.expandedShortCourses());
    if (current.has(sc.shortCourseId)) {
      current.delete(sc.shortCourseId);
    } else {
      current.clear();
      current.add(sc.shortCourseId);
    }
    this.expandedShortCourses.set(current);

    // Prepare lecture sections - collect all sections from all lectures
    const allSections: any[] = [];
    if (sc.lectures && sc.lectures.length > 0) {
      sc.lectures.forEach((lec: any) => {
        if (lec.lectureSections && lec.lectureSections.length > 0) {
          allSections.push(...lec.lectureSections);
        }
      });
    }
    if (allSections.length > 0) {
      this.lectureSection.set(allSections);
    }
  }

  onShortCourseSelect(sc: any) {
    this.completeOrderPayload.set({
      shortCourseId: sc.shortCourseId,
      courseCertificateId: this.courseTree()?.courseId,
      professionalCertificateId: null
    });
    this.stopSpeech();
    this.activeShortCourseId.set(sc.shortCourseId);
    this.currentShortCourse.set(sc);
    this.courseTitle.set(sc.title);
    this.isContentReady.set(false);
    this.lectureContent.set('');

    // Toggle expand state
    const current = new Set(this.expandedShortCourses());
    if (current.has(sc.shortCourseId)) {
      current.delete(sc.shortCourseId);
    } else {
      // Close all others, open this one
      current.clear();
      current.add(sc.shortCourseId);
    }
    this.expandedShortCourses.set(current);

    // Prepare lecture sections - collect all sections from all lectures
    const allSections: any[] = [];
    if (sc.lectures && sc.lectures.length > 0) {
      sc.lectures.forEach((lec: any) => {
        if (lec.lectureSections && lec.lectureSections.length > 0) {
          allSections.push(...lec.lectureSections);
        }
      });
    }
    if (allSections.length > 0) {
      this.lectureSection.set(allSections);
    }
  }

  playShortCourse() {
    const sc = this.currentShortCourse();
    if (!sc) return;

    // Combine all lecture content and calculate lecture start times
    let combinedContent = '';
    const lectureContents: string[] = [];

    if (sc.lectures && sc.lectures.length > 0) {
      sc.lectures.forEach((lec: any) => {
        let lecContent = '';
        if (lec.lectureSections && lec.lectureSections.length > 0) {
          lec.lectureSections.forEach((section: any) => {
            if (section.content) {
              lecContent += section.content + '<br/><br/>';
            }
          });
        }
        if (!lecContent && lec.content) {
          lecContent = lec.content + '<br/><br/>';
        }
        lectureContents.push(lecContent);
        combinedContent += lecContent;
      });
    }

    // Fallback: use lectureSection signal if no content found
    if (!combinedContent) {
      const sections = this.lectureSection();
      if (sections && sections.length > 0) {
        sections.forEach((section: any) => {
          if (section.content) {
            combinedContent += section.content + '<br/><br/>';
          }
        });
      }
    }

    if (combinedContent) {
      // Calculate lecture start times based on word counts
      const tempDiv = document.createElement('div');
      const wordsPerMinute = 150 * this.speechService.rate();
      let cumulativeWords = 0;
      this.lectureStartTimes = [];

      lectureContents.forEach((lecHtml) => {
        const startSeconds = (cumulativeWords / wordsPerMinute) * 60;
        this.lectureStartTimes.push(startSeconds);
        tempDiv.innerHTML = lecHtml;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;
        cumulativeWords += wordCount;
      });

      this.lectureContent.set(this.sanitizer.bypassSecurityTrustHtml(combinedContent));
      this.isContentReady.set(true);
      this.activeLectureIndex.set(0);

      // Set active section for speech
      const firstSection = sc.lectures?.[0]?.lectureSections?.[0] || this.lectureSection()?.[0];
      if (firstSection) {
        this.activeSection.set({ ...firstSection, content: combinedContent, sectionTitle: sc.title });
        this.courseService.activeSection.set({ ...firstSection, content: combinedContent, sectionTitle: sc.title });
      }

      // Start speech
      tempDiv.innerHTML = combinedContent;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      this.speechService.speak(text);
      this.isPlaying.set(true);
    }
  }

  onLecturePlay(lectureTitle: string) {
    this.activeLectureTitle.set(lectureTitle);

    // Get all sections for this lecture and combine their content
    const grouped = this.groupedByTitle();
    const sectionTypes = Object.keys(grouped[lectureTitle] || {});

    if (sectionTypes.length > 0) {
      // Get the first section to set as active
      const firstSection = grouped[lectureTitle][sectionTypes[0]][0];

      // Combine all section contents for this lecture
      let combinedContent = '';
      sectionTypes.forEach(type => {
        grouped[lectureTitle][type].forEach((section: any) => {
          combinedContent += section.content + '<br/><br/>';
        });
      });

      this.stopSpeech();
      this.courseTitle.set(lectureTitle);
      this.activeSection.set({ ...firstSection, content: combinedContent, sectionTitle: lectureTitle });
      this.courseService.activeSection.set({ ...firstSection, content: combinedContent, sectionTitle: lectureTitle });
      this.lectureContent.set(this.sanitizer.bypassSecurityTrustHtml(combinedContent));
    }
  }

  logout() {
    this.authService.clearSession();
  };

  toggleSpeech() {
    if (this.isPlaying()) {
      this.speechService.pause();
      this.isPlaying.set(false);
      this.showPauseOverlayWithTimer();
    } else {
      this.hidePauseOverlay();
      if (this.speechService.isPaused()) {
        this.speechService.resume();
        this.isPlaying.set(true);
      } else {
        // If content not ready, play the short course first
        if (!this.isContentReady()) {
          this.playShortCourse();
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
  }

  showPauseOverlayWithTimer() {
    if (this.pauseOverlayTimeout) {
      clearTimeout(this.pauseOverlayTimeout);
    }
    this.showPauseOverlay.set(true);
    this.pauseOverlayTimeout = setTimeout(() => {
      this.showPauseOverlay.set(false);
    }, 5000);
  }

  hidePauseOverlay() {
    if (this.pauseOverlayTimeout) {
      clearTimeout(this.pauseOverlayTimeout);
    }
    this.showPauseOverlay.set(false);
  }

  stopSpeech() {
    this.speechService.stop();
    this.isPlaying.set(false);
  }

  goToPreviousSection() {
    const sc = this.currentShortCourse();
    if (!sc?.lectures || this.lectureStartTimes.length === 0) return;
    const index = this.activeLectureIndex();
    if (index > 0) {
      const newIndex = index - 1;
      this.activeLectureIndex.set(newIndex);
      this.activeLectureTitle.set(sc.lectures[newIndex]?.title || null);
      this.speechService.seekToTime(this.lectureStartTimes[newIndex]);
    }
  }

  goToNextSection() {
    const sc = this.currentShortCourse();
    if (!sc?.lectures || this.lectureStartTimes.length === 0) return;
    const index = this.activeLectureIndex();
    if (index < sc.lectures.length - 1) {
      const newIndex = index + 1;
      this.activeLectureIndex.set(newIndex);
      this.activeLectureTitle.set(sc.lectures[newIndex]?.title || null);
      this.speechService.seekToTime(this.lectureStartTimes[newIndex]);
    } else {
      // Last lecture - complete course then trigger Start Assessment
      this.stopSpeech();
      if (this.courseTree()?.courseTypeId !== 3) {
        this.completeAndTriggerAssessment();
      }
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

  downloadLecturePdf(lecture: any, event: Event) {
    event.stopPropagation();
    if (!lecture) return;

    const title = lecture.title || 'Lecture';
    const content = lecture.content || lecture.description || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          h1 { color: #2655FF; margin-bottom: 20px; }
          .content { font-size: 14px; color: #333; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">${content}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  downloadShortCoursePdf(sc: any, event: Event) {
    event.stopPropagation();
    if (!sc) return;

    const title = sc.title || 'Short Course';
    let content = '';

    if (sc.lectures && sc.lectures.length > 0) {
      sc.lectures.forEach((lec: any, idx: number) => {
        content += `<h2>Section ${idx + 1}: ${lec.title || ''}</h2>`;
        content += `<div>${lec.content || lec.description || ''}</div><br/>`;
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          h1 { color: #2655FF; margin-bottom: 20px; }
          h2 { color: #333; margin-top: 30px; }
          .content { font-size: 14px; color: #333; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">${content}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

          const wordBottom = wordRect.bottom;
          const containerBottom = containerRect.bottom;

          if (wordBottom > containerBottom - 50) {
            const scrollTop = container.scrollTop + (wordRect.top - containerRect.top) - (containerRect.height / 2);
            container.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
          }
        }
      }
    }
  };

  complete() {
    if (this.isLoading()) {
      return;
    }
    this.isCompleting.set(true);
    const payload = {
      shortCourseId: this.completeOrderPayload().shortCourseId ?? null,
      courseCertificateId: this.completeOrderPayload().courseCertificateId ?? null,
      professionalCertificateId: this.completeOrderPayload().professionalCertificateId ?? null
    };
    this.courseService
      .completeCourse(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isCompleting.set(false);
          if (res?.isSuccess && res?.data) {
            this.completionData.set(res.data);
            this.showCompletionModal.set(true);
            this.refreshCourseTree();
          } else {
            this.toastr.error(res?.errorMessage || 'Failed to mark course complete', 'Error');
          }
        },
        error: (err: any) => {
          this.isCompleting.set(false);
          this.toastr.error('An error occurred while marking course complete', 'Error');
          console.error('Complete Course Error:', err);
        }
      });
  };

  onCompletionModalClose() {
    this.showCompletionModal.set(false);
    this.completionData.set(null);
    this.goToNextLecture();
  }

  refreshCourseTree() {
    const courseId = this.route.snapshot.params['courseId'];
    const token = this.authService.getToken();
    const courseTypeId = this.courseTree()?.courseTypeId;
    if (!courseId || !courseTypeId) return;

    this.courseService.getUnifiedLectureSectionsByTypeV2WithToken(courseId, token, courseTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tree: any) => {
          this.courseTree.set(tree);
        },
        error: (err: any) => {
          console.error('Refresh Course Tree Error:', err);
        }
      });
  }

  goToNextLecture() {
    const tree = this.courseTree();
    if (!tree) return;

    if (tree.courseTypeId === 1 && tree.professionalCourse?.courseCertificates) {
      const certs = tree.professionalCourse.courseCertificates;
      const currentScId = this.activeShortCourseId();
      const currentCertId = this.activeCertificateId();

      // Find current certificate and short course indices
      const certIndex = certs.findIndex((c: any) => c.courseCertificateId === currentCertId);
      if (certIndex === -1) return;

      const currentCert = certs[certIndex];
      const scIndex = currentCert.shortCourses?.findIndex((sc: any) => sc.shortCourseId === currentScId) ?? -1;

      // Try next short course in same certificate
      if (scIndex !== -1 && scIndex < (currentCert.shortCourses?.length || 0) - 1) {
        const nextSc = currentCert.shortCourses[scIndex + 1];
        this.onShortCourseSelectType1(nextSc);
        return;
      }

      // Try first short course in next certificate
      if (certIndex < certs.length - 1) {
        const nextCert = certs[certIndex + 1];
        this.expandedCertificates.set(new Set([nextCert.courseCertificateId]));
        this.activeCertificateId.set(nextCert.courseCertificateId);
        if (nextCert.shortCourses?.length > 0) {
          this.onShortCourseSelectType1(nextCert.shortCourses[0]);
        }
      }
    } else if (tree.courseTypeId === 2 && tree.certificateCourse?.shortCourses) {
      const shortCourses = tree.certificateCourse.shortCourses;
      const currentScId = this.activeShortCourseId();
      const scIndex = shortCourses.findIndex((sc: any) => sc.shortCourseId === currentScId);

      if (scIndex !== -1 && scIndex < shortCourses.length - 1) {
        const nextSc = shortCourses[scIndex + 1];
        this.onShortCourseSelect(nextSc);
      }
    }
  }

  getAssessmentCourseId(): number | null {
    if (this.completeOrderPayload().shortCourseId) {
      return this.completeOrderPayload().shortCourseId;
    }
    const tree = this.courseTree();
    if (tree?.courseTypeId === 3) {
      return tree.courseId;
    } else if (tree?.courseTypeId === 2 && tree?.certificateCourse?.shortCourses?.length > 0) {
      return tree.certificateCourse.shortCourses[0].shortCourseId;
    } else if (tree?.courseTypeId === 1 && tree?.professionalCourse?.courseCertificates?.length > 0) {
      const firstCert = tree.professionalCourse.courseCertificates[0];
      if (firstCert.shortCourses?.length > 0) {
        return firstCert.shortCourses[0].shortCourseId;
      }
    }
    return null;
  }

  startAssessment() {
    const tree = this.courseTree();
    if (tree?.courseTypeId == 2) {
      const shortCourse = tree?.certificateCourse?.shortCourses?.find((item: any) => item.shortCourseId === this.activeShortCourseId());
      if (shortCourse?.isCompleted) {
        this.assessmentStep.set('start');
      }
    } else if (tree?.courseTypeId == 1) {
      const certificate = tree?.professionalCourse?.courseCertificates?.find((item: any) => item.courseCertificateId === this.activeCertificateId());
      const shortCourse = certificate?.shortCourses?.find((item: any) => item.shortCourseId === this.activeShortCourseId());
      if (shortCourse?.isCompleted) {
        this.assessmentStep.set('start');
      }
    }
  }

  completeAndTriggerAssessment() {
    const payload = {
      shortCourseId: this.completeOrderPayload().shortCourseId ?? null,
      courseCertificateId: this.completeOrderPayload().courseCertificateId ?? null,
      professionalCertificateId: this.completeOrderPayload().professionalCertificateId ?? null
    };
    this.courseService.completeCourse(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.toastr.success('Your course is completed!', 'Success');
          this.refreshCourseTree();
        }
        this.stopSpeech();
        this.assessmentStep.set('start');
      },
      error: () => {
        this.stopSpeech();
        this.assessmentStep.set('start');
      }
    });
  }

  onAssessmentNext(currentStep: string) {
    if (currentStep === 'start') {
      this.assessmentStep.set('final');
    } else if (currentStep === 'failed') {
      this.assessmentStep.set('final');
    }
  }

  onAssessmentResult(data: any) {
    this.assessmentResult.set(data);
    const status = data?.resultStatus;
    if (status === 'Passed' || status === 'AlreadyPassed') {
      this.assessmentStep.set('cleared');
    } else if (status === 'MaxAttemptsExceeded') {
      this.assessmentStep.set('maxattempts');
    } else {
      this.assessmentStep.set('failed');
    }
  }

  onAssessmentFinish() {
    this.assessmentStep.set('none');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.speechService.stop();
    this.isPlaying.set(false);
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }
}
