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
  @Output() next = new EventEmitter<string>();
  @Input() orderPayload: any = null;
  isCompleting = signal(false);
  questions = signal<any[]>([]);
  currentQuestionIndex = signal(0);
  isQuestionLoading = signal(false)

  currentQuestion = computed(() => {
    const list = this.questions();
    return list && list.length > 0 ? list[this.currentQuestionIndex()] : null;
  });

  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private assessmentService = inject(AssessmentService);

  ngOnInit(): void {
    if (this.orderPayload?.shortCourseId) {
      this._fetchAssessmentQuestions();
    }
  }


  _fetchAssessmentQuestions() {
    if (!this.orderPayload?.shortCourseId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getAssessmentQuestions(this.orderPayload.shortCourseId, token).pipe(takeUntil(this.destroy$))
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCheckResult() {
    if (!this.currentQuestion()?.isSelect) {
      return;
    }
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
    this.assessmentService.submitAssessment(payload, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isCompleting.set(false);
          if (response?.statusCode == 200) {
            const data = response['data'];
            this.next.emit(data);
          }
        },
        error: (err: any) => {
          console.error('Submit Assessment Error:', err);
        }
      });
  }
}
