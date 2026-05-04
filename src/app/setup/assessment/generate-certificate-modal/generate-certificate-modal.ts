import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generate-certificate-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generate-certificate-modal.html',
  styleUrl: './generate-certificate-modal.sass'
})
export class GenerateCertificateModal {
  @Input() resultData: any = null;
  @Input() courseTypeId: number = 3;
  @Output() generateCertificate = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isGenerating = signal(false);
  skippingCertificate = signal(false);

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
    return this.resultData?.score ?? 0;
  }

  get attemptsUsed(): number {
    return this.resultData?.attemptsUsed ?? 0;
  }

  get attemptsRemaining(): number {
    return this.resultData?.attemptsRemaining ?? 0;
  }

  get maxAttempts(): number {
    return this.resultData?.maxAttempts ?? 3;
  }

  onGenerateCertificate() {
    this.isGenerating.set(true);
    this.generateCertificate.emit();
  }

  onClose() {
    this.skippingCertificate.set(true);
    setTimeout(() => {
      this.close.emit();
      window.location.reload();
    }, 20000);
  }
}
