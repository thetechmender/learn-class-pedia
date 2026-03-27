import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-failed-assessment',
  imports: [],
  templateUrl: './failed-assessment.html',
  styleUrl: './failed-assessment.sass',
})
export class FailedAssessment {
  @Output() next = new EventEmitter<void>();

  onReattempt() {
    this.next.emit();
  }
}
