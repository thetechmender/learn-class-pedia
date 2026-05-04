import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share-your-accomplishment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-your-accomplishment.html',
  styleUrl: './share-your-accomplishment.sass'
})
export class ShareYourAccomplishment {
  @Input() certificateUrl: string = '';
  @Input() htmlPath: string = '';
  @Input() publicCertificateLink: string = '';
  @Output() close = new EventEmitter<void>();

  embedSealCode = computed(() => '<a href="' + this.publicCertificateLink + '"><img src="seal.png" /></a>');

  showPublicLinkCopied = signal(false);
  showEmbedCodeCopied = signal(false);

  onClose() {
    this.close.emit();
  }

  onShareLinkedin() {
    // LinkedIn share logic
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + this.htmlPath, '_blank');
  }

  onCopyPublicLink() {
    navigator.clipboard.writeText(this.publicCertificateLink);
    this.showPublicLinkCopied.set(true);
    setTimeout(() => {
      this.showPublicLinkCopied.set(false);
    }, 1000);
  }

  onCopyEmbedCode() {
    navigator.clipboard.writeText(this.embedSealCode());
    this.showEmbedCodeCopied.set(true);
    setTimeout(() => {
      this.showEmbedCodeCopied.set(false);
    }, 1000);
  }
}
