import { Component, Output, EventEmitter, Input, signal, inject, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
// import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-failed-assessment',
  // imports: [DecimalPipe],
  templateUrl: './failed-assessment.html',
  styleUrl: './failed-assessment.sass',
})
export class FailedAssessment implements OnChanges {
  @Input('slug') courseSlug: string = '';
  @Input() resultData: any = null;
  @Output() next = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  private assessmentService = inject(AssessmentService);
  private router = inject(Router);

  ngOnInit() {
    // Update assessment service with latest result data
    if (this.resultData) {
      this.assessmentService.updateAttemptStatus(this.resultData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resultData'] && changes['resultData'].currentValue) {
      this.assessmentService.updateAttemptStatus(changes['resultData'].currentValue);
    }
  }

  navigateToCourse() {
    this.router.navigate(['/course']);
  }

  get isMaxAttempts(): boolean {
    const attemptsRemaining = this.resultData?.attemptsRemaining;
    const requiresRepurchase = this.resultData?.requiresRepurchase;
    
    // Show "No Attempts Remaining" if no attempts left or repurchase is required
    return attemptsRemaining <= 0 || requiresRepurchase === true;
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
    return this.resultData?.scorePercentage || this.resultData?.score || 0;
  }

  get requiresRepurchase(): boolean {
    return this.resultData?.requiresRepurchase ?? false;
  }

  getClassroomUrl(slug: string): string {
    return `https://www.classpedia.ai/${slug}`;
  }

  onReattempt() {
    this.next.emit();
  }

  back() {
    this.goBack.emit();
  };
}
