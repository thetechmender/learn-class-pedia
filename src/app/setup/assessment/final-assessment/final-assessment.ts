import { Component, Output, EventEmitter, inject, Input, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { AssessmentService } from '../../../services/assessment.service';
import { GenerateCertificateModal } from '../generate-certificate-modal/generate-certificate-modal';

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

  ngOnInit(): void {
    if (this.orderPayload?.careerPathLevelMapId) {
      this._fetchCareerPathAssessment();
    } else if (this.courseTypeId == 1) {
      this._fetchProfessionalCertificate();
    } else if (this.courseTypeId == 2) {
      this._fetchCertificateCourse();
    } else if (this.courseTypeId == 3) {
      this._fetchShoortCourseAssessment();
    }
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

  onNext() {
    if (this.currentQuestion()?.isSelect) {
      this.currentQuestionIndex.update(index => index + 1);
    };
    return
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
    console.log('[DEBUG] _handleAssessmentResult called');
    console.log('[DEBUG] Result data:', data);
    console.log('[DEBUG] isPassed:', data.isPassed);
    console.log('[DEBUG] courseTypeId:', this.courseTypeId);
    
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
        console.log('[DEBUG] Modal state:', this.showGenerateCertificateModal());
        console.log('[DEBUG] Result data set:', this.assessmentResultData());
      } else {
        console.log('[DEBUG] Short course (courseTypeId === 3) - waiting 30 seconds then emitting');
        // For short courses, show loading and wait 30 seconds then emit
        this.isGeneratingCertificate.set(true);
        setTimeout(() => {
          console.log('[DEBUG] 30 seconds completed - emitting data');
          this.isGeneratingCertificate.set(false);
          this.next.emit(data);
        }, 30000);
      }
    } else {
      console.log('[DEBUG] Unexpected isPassed value:', isPassed);
      // Fallback for unexpected cases
      this.next.emit('failed');
    }
  }

  onGenerateCertificate() {
    console.log('[DEBUG] onGenerateCertificate called - user clicked Generate Certificate button');
    
    const token = this.authService.getToken();
    const courseId = Number(this.getCourseId());
    const careerPathLevelMapId = this.orderPayload?.careerPathLevelMapId;

    // Close modal and show loading state
    this.showGenerateCertificateModal.set(false);
    this.isGeneratingCertificate.set(true);
    console.log('[DEBUG] Modal closed, loading started');
    console.log('[DEBUG] Waiting 30 seconds for certificate generation...');

    // Wait 30 seconds for certificate generation, then call getAttemptStatus API again
    setTimeout(() => {
      console.log('[DEBUG] 30 seconds completed - calling getAttemptStatus again');
      this.assessmentService.getAttemptStatus(courseId, token, careerPathLevelMapId).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (finalDetails: any) => {
            console.log('[DEBUG] Final getAttemptStatus response:', finalDetails);
            this.isGeneratingCertificate.set(false);
            if (finalDetails?.isSuccess) {
              console.log('[DEBUG] Emitting final data to course component');
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
  }

}
