import { Component, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-start-assessment',
  imports: [],
  templateUrl: './start-assessment.html',
  styleUrl: './start-assessment.sass',
})
export class StartAssessment {
  @Output() next = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  onStartAssessment() {
    this.next.emit();
  }

  back() {
    this.goBack.emit();
  }
}
