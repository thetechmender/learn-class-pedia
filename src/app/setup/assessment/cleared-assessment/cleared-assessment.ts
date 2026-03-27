import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cleared-assessment',
  imports: [],
  templateUrl: './cleared-assessment.html',
  styleUrl: './cleared-assessment.sass',
})
export class ClearedAssessment {
  @Output() finish = new EventEmitter<void>();

  onFinish() {
    this.finish.emit();
  }
}
