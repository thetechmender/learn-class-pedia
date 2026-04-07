import { Component, Output, EventEmitter, inject, Input, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { AssessmentService } from '../../../services/assessment.service';

@Component({
  selector: 'app-final-assessment',
  imports: [],
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
  questions = signal<any[]>([]);
  currentQuestionIndex = signal(0);
  isQuestionLoading = signal(false);
  
  private timerInterval: any = null;
  remainingSeconds = signal(0);
  
  totalMinutes = computed(() => this.questions().length || 15);

  formattedTime = computed(() => {
    const total = this.remainingSeconds();
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  currentQuestion = computed(() => {
    const list = this.questions();
    return list && list.length > 0 ? list[this.currentQuestionIndex()] : null;
  });

  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private assessmentService = inject(AssessmentService);

  ngOnInit(): void {
    if (this.courseTypeId == 1) {
      this._fetchProfessionalCertificate();
    }
    if (this.courseTypeId == 2) {
      this._fetchCertificateCourse();
    }
    if (this.courseTypeId == 3) {
      this._fetchShoortCourseAssessment();
    }
    console.log(this.courseTypeId)
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
    const payload = {
      shortCourseId: this.orderPayload?.shortCourseId || null,
      courseCertificateId: this.orderPayload?.courseCertificateId || null,
      professionalCertificateId: this.orderPayload?.professionalCertificateId || null,
      answers: this.questions().map(data => ({
        questionId: data?.id,
        selectedAnswer: data?.selectedOption || ''
      }))
    };
    const token = this.authService.getToken();
    this.assessmentService.submitFinalAssessment(this.courseTypeId, payload, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isCompleting.set(false);
          if (response?.statusCode == 200) {
            this._fetchQuizesResult();
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
    const payload = {
      shortCourseId: this.orderPayload?.shortCourseId || null,
      courseCertificateId: this.orderPayload?.courseCertificateId || null,
      professionalCertificateId: this.orderPayload?.professionalCertificateId || null,
      answers: this.questions().map(data => {
        return {
          questionId: data?.id,
          selectedAnswer: data?.selectedOption
        }
      })
    };
    const token = this.authService.getToken();
    this.assessmentService.submitFinalAssessment(this.courseTypeId, payload, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isCompleting.set(false);
          if (response?.statusCode == 200) {
            this._fetchQuizesResult();
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

  _fetchQuizesResult() {
    const token = this.authService.getToken();
    const payload = {
      courseId: this.getCourseId() || null,
      courseCertificateId: this.getCourseId() || null,
      professionalCertificateId: this.getCourseId() || null,
      assessmentTypeId: 2
    };

    // Call API immediately to check if assessment is passed
    this.assessmentService.getQuizesResult(payload, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          if (details?.isSuccess && details?.data?.isPassed === true) {
            // Show loading state ONLY for PASSED assessments
            this.isGeneratingCertificate.set(true);
            
            // Wait 20 seconds for certificate generation, then call API again
            setTimeout(() => {
              this.assessmentService.getQuizesResult(payload, token).pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (finalDetails: any) => {
                    debugger
                    this.isGeneratingCertificate.set(false);
                    if (finalDetails?.isSuccess) {
                      this.next.emit(finalDetails['data']);
                    }
                  },
                  error: (err: any) => {
                    this.isGeneratingCertificate.set(false);
                    console.error('Fetch Quiz Result Error:', err);
                  }
                });
            }, 20000);
          } else {
            // For failed assessments, emit result immediately without loader
            if (details?.isSuccess) {
              this.next.emit(details['data']);
            }
          }
        },
        error: (err: any) => {
          console.error('Fetch Quiz Result Error:', err);
        }
      });
  }


}
