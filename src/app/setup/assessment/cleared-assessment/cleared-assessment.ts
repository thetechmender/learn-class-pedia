import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-cleared-assessment',
  imports: [DecimalPipe, CommonModule],
  templateUrl: './cleared-assessment.html',
  styleUrl: './cleared-assessment.sass',
})
export class ClearedAssessment implements OnChanges {
  @Input() resultData: any = null;
  @Input() courseTypeId: number = 3;
  @Output() finish = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  ngOnChanges() {
    // Certificate URL is now available in resultData
  }

  onImageError(event: any) {
    console.error('Certificate image failed to load, falling back to default');
    // Could implement fallback logic here if needed
  }

  onImageLoad(event: any) {
    console.log('Certificate image loaded successfully');
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
    console.log(this.resultData);

    return this.resultData?.correctAnswers ?? 0;
  }

  get wrongAnswers(): number {
    console.log(this.resultData);

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

  get certificatePngUrl(): string {
    // Use original thumbnail URL since full version doesn't exist on server
    return this.resultData?.certificatePngUrl ?? '';
  }

  onFinish() {
    this.finish.emit();
  }

  back() {
    this.goBack.emit();
  }
}
