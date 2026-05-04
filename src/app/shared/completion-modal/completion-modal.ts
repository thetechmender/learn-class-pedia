import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-completion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './completion-modal.html'
})
export class CompletionModal {
  @Input() isOpen = false;
  @Input() data: any = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
