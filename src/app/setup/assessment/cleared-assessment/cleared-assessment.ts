import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cleared-assessment',
  imports: [DecimalPipe],
  templateUrl: './cleared-assessment.html',
  styleUrl: './cleared-assessment.sass',
})
export class ClearedAssessment {
  @Input() resultData: any = null;
  @Output() finish = new EventEmitter<void>();

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
    return this.resultData?.scorePercentage ?? 0;
  }

  get attemptsUsed(): number {
    return this.resultData?.attemptsUsed ?? 0;
  }

  get maxAttempts(): number {
    return this.resultData?.maxAttempts ?? 3;
  }

  onFinish() {
    this.finish.emit();
  }
}
