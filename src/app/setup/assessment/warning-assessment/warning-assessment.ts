import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-warning-assessment',
  imports: [],
  templateUrl: './warning-assessment.html',
  styleUrl: './warning-assessment.sass',
})
export class WarningAssessment {
  @Input() warningMessage: string = '';
  @Input() warningCount: number = 0;
  @Input() maxWarnings: number = 3;
  @Output() acknowledge = new EventEmitter<void>();

  get remainingWarnings(): number {
    return this.maxWarnings - this.warningCount;
  }

  onAcknowledge() {
    this.acknowledge.emit();
  }
}
