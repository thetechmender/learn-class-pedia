import { Component, Output, EventEmitter, Input, signal, inject, OnChanges, SimpleChanges, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    Chattrak?: {
      openChat: () => void;
      closeChat: () => void;
      onChatMinimized?: (callback: () => void) => void;
    };
  }
}

@Component({
  selector: 'app-failed-assessment',
  templateUrl: './failed-assessment.html',
  styleUrl: './failed-assessment.sass',
})
export class FailedAssessment implements OnChanges {
  @Input('slug') courseSlug: string = '';
  @Input() resultData: any = null;
  @Output() next = new EventEmitter<string>();
  @Output() goBack = new EventEmitter<void>();

  private assessmentService = inject(AssessmentService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isLoadingChat = signal(false);

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
    const url = `https://www.classpedia.ai/${slug}`;
    return url;
  }

  onReattempt() {
    this.next.emit('start');
  }

  back() {
    this.goBack.emit();
  };

  openLiveChat(event: Event) {
    event.preventDefault();
    
    if (!isPlatformBrowser(this.platformId)) return;

    const existingScript = document.getElementById('cd360-snippet');
    if (existingScript) {
      if (window.Chattrak?.openChat) {
        window.Chattrak.openChat();
      }
      return;
    }

    this.isLoadingChat.set(true);

    const script = document.createElement('script');
    script.id = 'cd360-snippet';
    script.src = 'https://app.chattrik.com/assets/scripts/snippet.js?key=69dd2f99b2f813411fe1e011&position=left';
    script.async = true;
    script.setAttribute('data-position', 'left');

    script.onload = () => {
      this.addLauncherButtonHidingCSS();

      setTimeout(() => {
        const launcherIframe = document.querySelector('iframe#launcher') as HTMLElement;
        if (launcherIframe) {
          launcherIframe.style.left = '0px';
          launcherIframe.style.right = 'auto';
        }

        const webWidgetIframe = document.querySelector('iframe#webWidget') as HTMLElement;
        if (webWidgetIframe) {
          webWidgetIframe.style.left = '0px';
          webWidgetIframe.style.right = 'auto';
          webWidgetIframe.style.display = 'block';
        }

        const badgeIframe = document.querySelector('iframe#badge') as HTMLElement;
        if (badgeIframe) {
          badgeIframe.style.left = '0px';
          badgeIframe.style.right = 'auto';
          badgeIframe.style.display = 'block';
        }

        if (window.Chattrak?.openChat) {
          window.Chattrak.openChat();
        }

        this.isLoadingChat.set(false);
      }, 2000);
    };

    script.onerror = () => {
      console.error('Failed to load live chat script');
      this.isLoadingChat.set(false);
    };

    document.body.appendChild(script);
  }

  private addLauncherButtonHidingCSS() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const existingStyle = document.getElementById('launcher-button-hider');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'launcher-button-hider';
    style.textContent = `
      #launcher_btn {
        display: none !important;
      }
      iframe#launcher {
        left: 0px !important;
        right: auto !important;
      }
      iframe#webWidget {
        left: 0px !important;
        right: auto !important;
      }
      iframe#badge {
        left: 0px !important;
        right: auto !important;
      }
      app-root div.content_body {
        left: 20px !important;
        right: auto !important;
      }
      app-root {
        left: 20px !important;
        right: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
}
