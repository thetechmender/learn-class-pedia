import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-failed-assessment',
  imports: [DecimalPipe],
  templateUrl: './failed-assessment.html',
  styleUrl: './failed-assessment.sass',
})
export class FailedAssessment {
  @Input() resultData: any = null;
  @Output() next = new EventEmitter<void>();

  get isMaxAttempts(): boolean {
    return this.resultData?.resultStatus === 'MaxAttemptsExceeded';
  }

  get attemptsRemaining(): number {
    return this.resultData?.attemptsRemaining ?? 0;
  }

  get attemptsUsed(): number {
    return this.resultData?.attemptsUsed ?? 0;
  }

  get maxAttempts(): number {
    return this.resultData?.maxAttempts ?? 3;
  }

  get scorePercentage(): number {
    return this.resultData?.scorePercentage ?? 0;
  }

  get requiresRepurchase(): boolean {
    return this.resultData?.requiresRepurchase ?? false;
  }

  onReattempt() {
    this.next.emit();
  }
}
