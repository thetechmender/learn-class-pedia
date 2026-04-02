import { Component, inject, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, signal } from '@angular/core';
import { AssessmentService } from '../../../services/assessment.service';
import { AuthService } from '../../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [],
  templateUrl: './quiz.html',
  styleUrl: './quiz.sass',
})
export class Quiz implements OnInit, OnDestroy, OnChanges {
  questions = signal<any[]>([]);
  @Input() orderPayload: any = null;
  @Input() isCourseCompleted: boolean = false;
  @Input() isLectureCompleted: boolean = false;
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private assessmentService = inject(AssessmentService);
  isQuestionLoading = signal(false)
  isCompleting = signal(false);
  isSubmitted = signal(false);
  showCompletionScreen = signal(false);
  showAnswers = signal(false);
  quizResult = signal<any>(null);
  @Output() moveToNextTopic = new EventEmitter<void>();
  @Output() refreshTree = new EventEmitter<void>();
  @Output() startAssessment = new EventEmitter<void>();
  @Output() goToDashboard = new EventEmitter<void>();
  @Output() selectIncomplete = new EventEmitter<void>();
  ngOnInit(): void {
    this._fetchQuizes()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderPayload'] && !changes['orderPayload'].firstChange) {
      this.resetQuizState();
      this._fetchQuizes();
    }
  }

  resetQuizState() {
    this.isSubmitted.set(false);
    this.showCompletionScreen.set(false);
    this.showAnswers.set(false);
    this.quizResult.set(null);
  }
  _fetchQuizes() {
    if (!this.orderPayload?.shortCourseId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getQuizQuestions(this.orderPayload.shortCourseId, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.questions.set(details['data']['questions'].map((q: any) => ({
            isSelect: false,
            selectedOption: '',
            ...q,
          })) || []);
          this.isQuestionLoading.set(false);
        },
        error: (err: any) => {
          console.error('Fetch Assessment Questions Error:', err);
        }
      });
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOptionChange(question: any, optionLetter: string) {
    const updated = this.questions().map(q => {
      if (q.id === question.id) {
        return { ...q, selectedOption: optionLetter, isSelect: true };
      }
      return q;
    });
    this.questions.set(updated);
  }

  onCheckResult() {
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
    this.assessmentService.submitQuizAssessment(payload, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isCompleting.set(false);
          this._fetchQuizesResult();
        },
        error: (err: any) => {
          this.isCompleting.set(false);
          console.error('Submit Assessment Error:', err);
        }
      });
  }

  _fetchQuizesResult() {
    const token = this.authService.getToken();
    const payload = {
      courseId: this.orderPayload?.shortCourseId || null,
      courseCertificateId: this.orderPayload?.courseCertificateId || null,
      professionalCertificateId: this.orderPayload?.professionalCertificateId || null,
      assessmentTypeId: 1
    };
    this.assessmentService.getQuizesResult(payload, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          if (details?.isSuccess) {
            this.quizResult.set(details.data);
            this.isSubmitted.set(true);
            // Refresh tree to update isCompleted status after quiz submit
            this.refreshTree.emit();
            this.showCompletionScreen.set(true);
          }
        },
        error: (err: any) => {
          console.error('Fetch Quiz Result Error:', err);
        }
      });
  }

  getQuestionResult(questionId: number): any {
    const result = this.quizResult();
    if (!result?.questionResults) return null;
    return result.questionResults.find((qr: any) => qr.questionId === questionId);
  }

  onCheckAnswers() {
    this.showCompletionScreen.set(false);
    this.showAnswers.set(true);
    // Refresh tree to update isCompleted status in sidebar
    this.refreshTree.emit();
  }

  onMoveToNextTopic() {
    // This will refresh tree and select next incomplete shortCourse
    this.selectIncomplete.emit();
  }

  onStartAssessment() {
    this.startAssessment.emit();
  }


}
