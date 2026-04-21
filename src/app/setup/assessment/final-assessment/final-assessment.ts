import { Component, Output, EventEmitter, inject, Input, OnInit, signal, computed, HostListener } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { AssessmentService } from '../../../services/assessment.service';
import { GenerateCertificateModal } from '../generate-certificate-modal/generate-certificate-modal';
import { SecurityService } from '../../../services/security.service';

@Component({
  selector: 'app-final-assessment',
  imports: [GenerateCertificateModal],
  templateUrl: './final-assessment.html',
  styleUrl: './final-assessment.sass',
})
export class FinalAssessment implements OnInit {
  @Output() next = new EventEmitter<any>();
  @Output() goBack = new EventEmitter<void>();
  @Input() orderPayload: any = null;
  @Input() courseTypeId!: number;

  isCompleting = signal(false);
  isGeneratingCertificate = signal(false); // New loading state for certificate generation
  showGenerateCertificateModal = signal(false);
  assessmentResultData = signal<any>(null);
  questions = signal<any[]>([]);
  currentQuestionIndex = signal(0);
  isQuestionLoading = signal(false);
  isMouseNearTopBar = signal(false); // Track if mouse is near URL bar area
  showKeyboardBlockWarning = signal(false); // Show warning when keyboard shortcuts are blocked
  private keyboardWarningTimeout: any = null;

  private timerInterval: any = null;
  remainingSeconds = signal(0);

  totalMinutes = computed(() => (this.questions().length || 15) * 3);

  formattedTime = computed(() => {
    const total = this.remainingSeconds();
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (total >= 3600) {
      // >= 60 minutes: show hh:mm:ss
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      // < 60 minutes: show mm:ss
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  });

  currentQuestion = computed(() => {
    const list = this.questions();
    return list && list.length > 0 ? list[this.currentQuestionIndex()] : null;
  });

  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private assessmentService = inject(AssessmentService);
  public securityService = inject(SecurityService);

  ngOnInit(): void {
    if (this.orderPayload?.careerPathLevelMapId) {
      this._fetchCareerPathAssessment();
    } else if (this.courseTypeId == 1) {
      this._fetchProfessionalCertificate();
    } else if (this.courseTypeId == 2) {
      this._fetchCertificateCourse();
    } else if (this.courseTypeId == 3) {
      this._fetchShoortCourseAssessment();
    };
    this._initializeMouseTracking();
  }

  private _initializeMouseTracking(): void {
    document.body.classList.add('exam-mode');
    this._setupVisibilityChangeDetection();
  }

  private _setupVisibilityChangeDetection(): void {
    // Detect when user switches tabs
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.warn('⚠️ User switched away from assessment tab!');
        // You could log this to your backend for monitoring
        this.showKeyboardBlockWarning.set(true);
        setTimeout(() => this.showKeyboardBlockWarning.set(false), 3000);
      }
    });
  }


  _fetchShoortCourseAssessment() {
    if (!this.orderPayload?.shortCourseId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getShortCourseAssessment(this.orderPayload.shortCourseId, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.questions.set(details['data']['questions'].map((q: any) => ({
            isSelect: false,
            selectedOption: '',
            ...q,
          })) || []);
          this.isQuestionLoading.set(false);
          this.startTimer();
        },
        error: (err: any) => {
          console.error('Fetch Assessment Questions Error:', err);
        }
      });
  };

  _fetchCertificateCourse() {
    if (!this.orderPayload?.courseCertificateId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getCourseCertificateAssessment(this.orderPayload?.courseCertificateId, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.questions.set(details['data']['questions'].map((q: any) => ({
            isSelect: false,
            selectedOption: '',
            ...q,
          })) || []);
          this.isQuestionLoading.set(false);
          this.startTimer();
        },
        error: (err: any) => {
          console.error('Fetch Assessment Questions Error:', err);
        }
      });
  };

  _fetchCareerPathAssessment() {
    if (!this.orderPayload?.careerPathLevelMapId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getCareerPathAssessment(this.orderPayload.careerPathLevelMapId, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.questions.set(details['data']['questions'].map((q: any) => ({
            isSelect: false,
            selectedOption: '',
            ...q,
          })) || []);
          this.isQuestionLoading.set(false);
          this.startTimer();
        },
        error: (err: any) => {
          console.error('Fetch Assessment Questions Error:', err);
        }
      });
  };

  _fetchProfessionalCertificate() {
    if (!this.orderPayload?.professionalCertificateId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getProfessionalCourseAssessment(this.orderPayload.professionalCertificateId, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.questions.set(details['data']['questions'].map((q: any) => ({
            isSelect: false,
            selectedOption: '',
            ...q,
          })) || []);
          this.isQuestionLoading.set(false);
          this.startTimer();
        },
        error: (err: any) => {
          console.error('Fetch Assessment Questions Error:', err);
        }
      });
  };

  async onNext() {
    const isDualDisplayActive = await this.securityService.isDualDisplayActive();
    if (isDualDisplayActive) {
      if (this.currentQuestion()?.isSelect) {
        this.currentQuestionIndex.update(index => index + 1);
      };
      return
    }
    return;
  }

  onOptionChange(option: any) {
    const current = this.currentQuestion();
    if (current) {
      current.isSelect = true;
      current.selectedOption = option.optionLetter;
    };
  }

  back() {
    this.goBack.emit();
  }

  ngOnDestroy() {
    this.stopTimer();
    this.destroy$.next();
    this.destroy$.complete();
    document.body.classList.remove('exam-mode');
  }

  startTimer() {
    this.remainingSeconds.set(this.totalMinutes() * 60);
    this.timerInterval = setInterval(() => {
      const current = this.remainingSeconds();
      if (current <= 1) {
        this.stopTimer();
        this._autoSubmit();
      } else {
        this.remainingSeconds.set(current - 1);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  _autoSubmit() {
    this.isCompleting.set(true);

    // Build payload based on career path or regular course
    const payload: any = {
      shortCourseId: this.orderPayload?.shortCourseId || null,
      courseCertificateId: this.orderPayload?.courseCertificateId || null,
      answers: this.questions().map(data => ({
        questionId: data?.id,
        selectedAnswer: data?.selectedOption || ''
      }))
    };

    // Career path excludes professionalCertificateId
    if (this.orderPayload?.careerPathLevelMapId) {
      payload.careerPathLevelMapId = this.orderPayload.careerPathLevelMapId;
      payload.professionalCertificateId = null;
    } else {
      payload.professionalCertificateId = this.orderPayload?.professionalCertificateId || null;
      payload.careerPathLevelMapId = null;
    }
    const token = this.authService.getToken();
    const submitApi = this.orderPayload?.careerPathLevelMapId
      ? this.assessmentService.submitCareerPathAssessment(payload, token)
      : this.assessmentService.submitFinalAssessment(this.courseTypeId, payload, token);

    submitApi.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('[DEBUG] Auto-submit API response:', response);
          this.isCompleting.set(false);
          if (response?.statusCode == 200 && response?.data) {
            // Use submit response data directly - it already has isPassed and all other fields
            this._handleAssessmentResult(response.data);
          }
        },
        error: () => {
          this.isCompleting.set(false);
          this.next.emit('failed');
        }
      });
  }

  onCheckResult() {
    if (!this.currentQuestion()?.isSelect) {
      return;
    }
    this.stopTimer();
    this.isCompleting.set(true);

    // Build payload based on career path or regular course
    const payload: any = {
      shortCourseId: this.orderPayload?.shortCourseId || null,
      courseCertificateId: this.orderPayload?.courseCertificateId || null,
      answers: this.questions().map(data => {
        return {
          questionId: data?.id,
          selectedAnswer: data?.selectedOption
        }
      })
    };

    // Career path excludes professionalCertificateId
    if (this.orderPayload?.careerPathLevelMapId) {
      payload.careerPathLevelMapId = this.orderPayload.careerPathLevelMapId;
      payload.professionalCertificateId = null;
    } else {
      payload.professionalCertificateId = this.orderPayload?.professionalCertificateId || null;
      payload.careerPathLevelMapId = null;
    }
    const token = this.authService.getToken();
    const submitApi = this.orderPayload?.careerPathLevelMapId
      ? this.assessmentService.submitCareerPathAssessment(payload, token)
      : this.assessmentService.submitFinalAssessment(this.courseTypeId, payload, token);

    submitApi.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('[DEBUG] Submit API response:', response);
          this.isCompleting.set(false);
          if (response?.statusCode == 200 && response?.data) {
            // Use submit response data directly - it already has isPassed and all other fields
            this._handleAssessmentResult(response.data);
          }
        },
        error: (err: any) => {
          console.error('Submit Assessment Error:', err);
        }
      });
  };

  getCourseId(): string | number {
    if (this.courseTypeId == 2) {
      return this.orderPayload?.courseCertificateId || null;
    }
    if (this.courseTypeId == 3) {
      return this.orderPayload?.shortCourseId || null;
    }
    return this.orderPayload?.professionalCertificateId || null;
  }

  _handleAssessmentResult(data: any) {
    const isPassed = data.isPassed;

    if (isPassed === false) {
      console.log('[DEBUG] Assessment FAILED - emitting data immediately');
      // If failed, emit data immediately to route to failed-assessment
      this.next.emit(data);
    } else if (isPassed === true) {
      console.log('[DEBUG] Assessment PASSED');
      // If passed, show modal and DON'T emit yet (wait for user to click Generate Certificate)
      if (this.courseTypeId !== 3) {
        console.log('[DEBUG] NOT short course - showing modal immediately');
        // For other courses, show modal immediately and WAIT for user to click Generate Certificate
        this.assessmentResultData.set(data);
        this.showGenerateCertificateModal.set(true);
      } else {
        console.log('[DEBUG] Short course (courseTypeId === 3) - waiting 30 seconds then emitting');
        // For short courses, show loading and wait 30 seconds then emit
        this.isGeneratingCertificate.set(true);
        setTimeout(() => {
          this.isGeneratingCertificate.set(false);
          this.next.emit(data);
        }, 30000);
      }
    } else {
      // Fallback for unexpected cases
      this.next.emit('failed');
    }
  }

  onGenerateCertificate() {

    const token = this.authService.getToken();
    const courseId = Number(this.getCourseId());
    const careerPathLevelMapId = this.orderPayload?.careerPathLevelMapId;

    // Close modal and show loading state
    this.showGenerateCertificateModal.set(false);
    this.isGeneratingCertificate.set(true);

    // Wait 30 seconds for certificate generation, then call getAttemptStatus API again
    setTimeout(() => {
      this.assessmentService.getAttemptStatus(courseId, token, careerPathLevelMapId).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (finalDetails: any) => {
            this.isGeneratingCertificate.set(false);
            if (finalDetails?.isSuccess) {
              this.next.emit(finalDetails['data']);
            }
          },
          error: (err: any) => {
            this.isGeneratingCertificate.set(false);
          }
        });
    }, 30000);
  }

  onCloseModal() {
    this.showGenerateCertificateModal.set(false);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  };

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    // Block F5 (Refresh)
    if (event.key === 'F5') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + F5 (Hard Refresh)
    if (event.ctrlKey && event.key === 'F5') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + R (Reload)
    if (event.ctrlKey && event.key.toLowerCase() === 'r') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + W (Close Tab)
    if (event.ctrlKey && event.key.toLowerCase() === 'w') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + Tab (Next Tab)
    if (event.ctrlKey && event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + Shift + Tab (Previous Tab)
    if (event.ctrlKey && event.shiftKey && event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + 1-9 (Switch to specific tab)
    if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + T (New Tab)
    if (event.ctrlKey && event.key.toLowerCase() === 't') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + N (New Window)
    if (event.ctrlKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Alt + Left/Right (Browser Back/Forward)
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + H (History)
    if (event.ctrlKey && event.key.toLowerCase() === 'h') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Ctrl + Shift + T (Reopen closed tab)
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 't') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block F11 (Fullscreen toggle)
    if (event.key === 'F11') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Block Escape (might exit fullscreen)
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
    }

    // Show warning for any blocked shortcut
    if (event.ctrlKey || event.altKey || event.key === 'F5' || event.key === 'F11') {
      this._showKeyboardBlockedWarning();
    }
  };

  private _showKeyboardBlockedWarning(): void {
    this.showKeyboardBlockWarning.set(true);

    // Clear existing timeout
    if (this.keyboardWarningTimeout) {
      clearTimeout(this.keyboardWarningTimeout);
    }

    // Hide warning after 2 seconds
    this.keyboardWarningTimeout = setTimeout(() => {
      this.showKeyboardBlockWarning.set(false);
    }, 2000);
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = '';
  };

  @HostListener('window:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent): void {
    const DANGER_ZONE_HEIGHT = 200; // pixels from top - covers browser tabs area
    const mouseY = event.clientY;

    if (mouseY <= DANGER_ZONE_HEIGHT) {
      this.isMouseNearTopBar.set(true);
      // Hide cursor completely
      document.body.style.cursor = 'none';
      // Disable all pointer events on the entire page
      document.body.style.pointerEvents = 'none';
      // Add a class for additional styling
      document.body.classList.add('cursor-blocked');

      // Prevent any mouse clicks in this area
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.isMouseNearTopBar.set(false);
      document.body.style.cursor = 'default';
      document.body.style.pointerEvents = 'auto';
      document.body.classList.remove('cursor-blocked');
    }
  }

  @HostListener('window:mousedown', ['$event'])
  handleMouseDown(event: MouseEvent): void {
    const DANGER_ZONE_HEIGHT = 200;
    const mouseY = event.clientY;

    // Block all mouse clicks in the top area (tabs, URL bar, etc.)
    if (mouseY <= DANGER_ZONE_HEIGHT) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this._showKeyboardBlockedWarning();
      return;
    }
  }


  @HostListener('window:contextmenu', ['$event'])
  handleContextMenu(event: MouseEvent): void {
    // Block right-click completely
    event.preventDefault();
    event.stopPropagation();
  }
}
