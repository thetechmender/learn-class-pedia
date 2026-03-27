import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-final-assessment',
  imports: [],
  templateUrl: './final-assessment.html',
  styleUrl: './final-assessment.sass',
})
export class FinalAssessment {
  @Output() next = new EventEmitter<void>();

  onCheckResult() {
    this.next.emit();
  }
}
