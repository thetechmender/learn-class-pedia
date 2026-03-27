import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-start-assessment',
  imports: [],
  templateUrl: './start-assessment.html',
  styleUrl: './start-assessment.sass',
})
export class StartAssessment {
  @Output() next = new EventEmitter<void>();

  onStartAssessment() {
    this.next.emit();
  }
}
