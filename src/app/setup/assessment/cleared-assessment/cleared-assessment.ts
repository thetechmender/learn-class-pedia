import { Component, Output, EventEmitter, Input, OnChanges, signal, inject } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { AssessmentService } from '../../../services/assessment.service';
import { AuthService } from '../../../services/auth.service';
import { MoodService } from '../../../services/mood.service';
import { Subject, takeUntil } from 'rxjs';
import { UpdatePhoneNumber } from '../update-phone-number/update-phone-number';
// import { ShareYourAccomplishment } from '../share-your-accomplishment/share-your-accomplishment';

@Component({
  selector: 'app-cleared-assessment',
  imports: [DecimalPipe, CommonModule, UpdatePhoneNumber,
    //  ShareYourAccomplishment
  ],
  templateUrl: './cleared-assessment.html',
  styleUrl: './cleared-assessment.sass',
})
export class ClearedAssessment implements OnChanges {
  @Input() resultData: any = null;
  @Input() courseTypeId: number = 3;
  @Output() finish = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();
  private authService = inject(AuthService);
  private assessmentService = inject(AssessmentService);
  private moodService = inject(MoodService);
  isLinkedinLoading = signal(false);
  isDownloadingCertificateLoading = signal(false)
  private destroy$ = new Subject<void>();
  isGeneratingCertificate = signal(false); // Add loading state
  loaderAlreadyActivated = false; // Prevent multiple activations
  showShareModal = signal(false);
  showPhoneModal = signal(false);
  pendingAction: 'download' | 'share' | null = null;

  ngOnChanges() {

    // Check if certificate is being generated for courseTypeId 1 & 2
    if ((this.courseTypeId === 1 || this.courseTypeId === 2) && this.resultData) {
      // Show loading ONLY if assessment is PASSED, certificate URL is null, and loader not already activated
      if (this.resultData.isPassed === true && !this.resultData.pngPath && !this.loaderAlreadyActivated) {
        this.loaderAlreadyActivated = true; // Set flag to prevent multiple activations
        this.isGeneratingCertificate.set(true);
        // Hide loading after 20 seconds (matching the delay in final-assessment)
        setTimeout(() => {
          this.isGeneratingCertificate.set(false);
        }, 20000);
      } else {
      }
    };
  }

  onImageError(event: any) {
    console.error('Certificate image failed to load, falling back to default');
    // Could implement fallback logic here if needed
  }

  onImageLoad(event: any) {
  }

  get isAlreadyPassed(): boolean {
    return this.resultData?.resultStatus === 'AlreadyPassed';
  }

  get courseTitle(): string {
    return this.resultData?.courseTitle ?? '';
  }

  get totalQuestions(): number {
    return this.resultData?.totalQuestions ?? 0;
  }

  get customerEnrollmentId(): number {
    return this.resultData?.customerEnrollmentId ?? 0;
  }

  get correctAnswers(): number {

    return this.resultData?.correctAnswers ?? 0;
  }

  get wrongAnswers(): number {

    return this.resultData?.wrongAnswers ?? 0;
  }

  get scorePercentage(): number {
    return this.resultData?.score ?? 0;
  }

  get attemptsUsed(): number {
    return this.resultData?.attemptsUsed ?? 0;
  }

  get maxAttempts(): number {
    return this.resultData?.maxAttempts ?? 3;
  }

  get pngPath(): string {
    // Use original thumbnail URL since full version doesn't exist on server
    return this.resultData?.pngPath ?? '';
  }

  get pdfPath(): string {
    // Use original thumbnail URL since full version doesn't exist on server
    return this.resultData?.pdfPath ?? '';
  }

  get htmlPath(): string {
    return this.resultData?.htmlPath ?? '';
  }

  get isGeneratingCertificateValue(): boolean {
    return this.isGeneratingCertificate();
  }

  onFinish() {
    this.finish.emit();
  }

  back() {
    this.goBack.emit();
  }

  showFullCertificate = signal(false);

  openFullPreview() {
    this.showFullCertificate.set(true);
  }

  closeFullPreview() {
    this.showFullCertificate.set(false);
  }

  downloadCertificate() {
    if (!this.pdfPath) {
      console.error('[Certificate Debug] No certificate path available');
      return;
    }

    const link = document.createElement('a');
    link.href = this.pdfPath;
    link.download = `certificate-${Date.now()}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openShareModal() {
    this.showShareModal.set(true);
  }

  closeShareModal() {
    this.showShareModal.set(false);
  };

  onShareLinkedin() {
    if (!this.htmlPath) {
      console.error('[Certificate Debug] No HTML certificate path available for sharing');
      return;
    }

    const encodedUrl = encodeURIComponent(this.htmlPath);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedInUrl, '_blank');
  };

  startLoading(activityType: string) {
    if (activityType === 'download') {
      this.isDownloadingCertificateLoading.set(true);
    }
    else {
      this.isLinkedinLoading.set(true);
    }
  }

  stopLoading(activityType: string) {
    if (activityType === 'download') {
      this.isDownloadingCertificateLoading.set(false);
    }
    else {
      this.isLinkedinLoading.set(false);
    }
  }

  updateEnrollmentActivity(activityType: string) {
    // Lumi celebrates the certificate moment (share / download)
    this.moodService.onCertificateAction();

    // Check if user has phone number
    if (!this.assessmentService.hasPhone()) {
      this.pendingAction = activityType as 'download' | 'share';
      this.showPhoneModal.set(true);
      return;
    }

    // User has phone, proceed with normal flow
    this.proceedWithActivity(activityType);
  };

  proceedWithActivity(activityType: string) {
    const token = this.authService.getToken();
    const payload = { customerEnrollmentId: this.customerEnrollmentId, activityType };
    this.startLoading(activityType);
    setTimeout(() => {
      this.assessmentService.updateAssessmentActivity(payload, token).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.stopLoading(activityType);
            if (response?.isSuccess) {
              if (activityType === 'download') {
                this.downloadCertificate();
              }
              else {
                this.onShareLinkedin();
              }

            }
          },
          error: () => {
            this.stopLoading(activityType);
          }
        });
    }, 1000)
  };

  onPhoneUpdated() {
    this.showPhoneModal.set(false);
    // Continue with pending action
    if (this.pendingAction) {
      this.proceedWithActivity(this.pendingAction);
      this.pendingAction = null;
    }
  }

  onPhoneModalClose() {
    this.showPhoneModal.set(false);
    this.pendingAction = null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
