import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';

import { AssessmentService } from '../../../services/assessment.service';

import { Subject, takeUntil } from 'rxjs';

import { SecurityService } from '../../../services/security.service';



@Component({

  selector: 'app-start-assessment',

  imports: [FormsModule],

  templateUrl: './start-assessment.html',

  styleUrl: './start-assessment.sass',

})

export class StartAssessment implements OnInit, OnDestroy {

  @Output() next = new EventEmitter<any>();

  @Output() goBack = new EventEmitter<void>();

  @Output() deselectLectures = new EventEmitter<void>();

  @Input() orderPayload: any = null;

  @Input() courseTypeId!: number;

  @Input() isAssessmentInProgress: boolean = false;



  private destroy$ = new Subject<void>();

  private authService = inject(AuthService);

  public assessmentService = inject(AssessmentService);

  public securityService = inject(SecurityService);



  questions = signal<any[]>([]);

  isQuestionLoading = signal(false);

  remainingMinutesCount = signal(0);

  isAcceptedGuidelines = false;

  totalMinutes = computed(() => this.remainingMinutesCount() || (this.questions().length || 15) * 3);

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

    // Reset sidebar selections when user lands on start assessment page

    this.deselectLectures.emit();



    this._fetchQuestions();

  }



  _fetchQuestions() {
    if (this.orderPayload?.careerPathLevelMapId) {

      this._fetchCareerPathAssessment();

    } else if (this.courseTypeId == 1) {

      this._fetchProfessionalCertificate();

    } else if (this.courseTypeId == 2) {

      this._fetchCertificateCourse();

    } else if (this.courseTypeId == 3) {

      this._fetchShortCourseAssessment();

    }

  }


  _fetchCareerPathAssessment() {

    if (!this.orderPayload?.careerPathLevelMapId) return;

    this.isQuestionLoading.set(true);

    const token = this.authService.getToken();

    this.assessmentService.getCareerPathAssessment(this.orderPayload.careerPathLevelMapId, token).pipe(takeUntil(this.destroy$))

      .subscribe({

        next: (details: any) => {

          this.questions.set(details['data']['questions'] || []);

          this.remainingMinutesCount.set(details['data']['remainingMinutesCount'] || 0);

          this.isQuestionLoading.set(false);

        },

        error: (err: any) => {

          this.isQuestionLoading.set(false);

        }

      });

  };


  _fetchShortCourseAssessment() {

    if (!this.orderPayload?.shortCourseId) return;

    this.isQuestionLoading.set(true);

    const token = this.authService.getToken();

    this.assessmentService.getShortCourseAssessment(this.orderPayload.shortCourseId, token).pipe(takeUntil(this.destroy$))

      .subscribe({

        next: (details: any) => {

          this.questions.set(details['data']['questions'] || []);

          this.remainingMinutesCount.set(details['data']['remainingMinutesCount'] || 0);

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

          this.remainingMinutesCount.set(details['data']['remainingMinutesCount'] || 0);

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

          this.remainingMinutesCount.set(details['data']['remainingMinutesCount'] || 0);

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
    if (this.isAssessmentInProgress && isDualDisplayActive) {
      this.next.emit('final');
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

