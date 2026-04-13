import { Component, Output, EventEmitter, Input, OnChanges, signal } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { ShareYourAccomplishment } from '../share-your-accomplishment/share-your-accomplishment';

@Component({
  selector: 'app-cleared-assessment',
  imports: [DecimalPipe, CommonModule, ShareYourAccomplishment],
  templateUrl: './cleared-assessment.html',
  styleUrl: './cleared-assessment.sass',
})
export class ClearedAssessment implements OnChanges {
  @Input() resultData: any = null;
  @Input() courseTypeId: number = 3;
  @Output() finish = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  isGeneratingCertificate = signal(false); // Add loading state
  loaderAlreadyActivated = false; // Prevent multiple activations
  showShareModal = signal(false);

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
    }
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

  openShareModal() {
    this.showShareModal.set(true);
  }

  closeShareModal() {
    this.showShareModal.set(false);
  }
}
