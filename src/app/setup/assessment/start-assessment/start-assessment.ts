import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AssessmentService } from '../../../services/assessment.service';
import { Subject, takeUntil } from 'rxjs';
import { SecurityService } from '../../../services/security.service';

@Component({
  selector: 'app-start-assessment',
  imports: [],
  templateUrl: './start-assessment.html',
  styleUrl: './start-assessment.sass',
})
export class StartAssessment implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<any>();
  @Output() goBack = new EventEmitter<void>();
  @Input() orderPayload: any = null;
  @Input() courseTypeId!: number;

  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  public assessmentService = inject(AssessmentService);
  public securityService = inject(SecurityService);

  questions = signal<any[]>([]);
  isQuestionLoading = signal(false);
  
  totalMinutes = computed(() => (this.questions().length || 15) * 3);

  formattedTime = computed(() => {
    const total = this.totalMinutes() * 60;
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

  ngOnInit(): void {
    this._fetchQuestions();
  }

  _fetchQuestions() {
    if (this.courseTypeId == 1) {
      this._fetchProfessionalCertificate();
    } else if (this.courseTypeId == 2) {
      this._fetchCertificateCourse();
    } else if (this.courseTypeId == 3) {
      this._fetchShortCourseAssessment();
    }
  }

  _fetchShortCourseAssessment() {
    if (!this.orderPayload?.shortCourseId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getShortCourseAssessment(this.orderPayload.shortCourseId, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.questions.set(details['data']['questions'] || []);
          this.isQuestionLoading.set(false);
        },
        error: (err: any) => {
          console.error('Fetch Assessment Questions Error:', err);
          this.isQuestionLoading.set(false);
        }
      });
  }

  _fetchCertificateCourse() {
    if (!this.orderPayload?.courseCertificateId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getCourseCertificateAssessment(this.orderPayload?.courseCertificateId, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.questions.set(details['data']['questions'] || []);
          this.isQuestionLoading.set(false);
        },
        error: (err: any) => {
          console.error('Fetch Assessment Questions Error:', err);
          this.isQuestionLoading.set(false);
        }
      });
  }

  _fetchProfessionalCertificate() {
    if (!this.orderPayload?.professionalCertificateId) return;
    this.isQuestionLoading.set(true);
    const token = this.authService.getToken();
    this.assessmentService.getProfessionalCourseAssessment(this.orderPayload.professionalCertificateId, token).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.questions.set(details['data']['questions'] || []);
          this.isQuestionLoading.set(false);
        },
        error: (err: any) => {
          console.error('Fetch Assessment Questions Error:', err);
          this.isQuestionLoading.set(false);
        }
      });
  }

  async onStartAssessment() {
    const isDualDisplayActive = await this.securityService.isDualDisplayActive();
    if (isDualDisplayActive) {
      this.next.emit('start');
      return;
    }
  }

  back() {
    this.goBack.emit();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
