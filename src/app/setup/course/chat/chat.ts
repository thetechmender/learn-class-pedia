import { Component, Input, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { CourseService } from '../../../services/course.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

// Declare global window interface for chattrik API
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
  selector: 'app-chat',
  imports: [CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.sass',
})
export class Chat {
  courseService = inject(CourseService);
  private sanitizer = inject(DomSanitizer);
  private toastr = inject(ToastrService);
  private destroy$ = new Subject<void>();
  private platformId = inject(PLATFORM_ID);

  @Input() assessmentStep: 'none' | 'start' | 'final' | 'failed' | 'cleared' | 'maxattempts' = 'none';
  @Input() courseTree: any = null;

  isLiveChatActive = signal<boolean>(false);

  chatInput = signal<string>('');
  chatThreadId = signal<string>('');
  isChatSending = signal<boolean>(false);
  chatMessages = signal<Array<{ role: 'bot' | 'user'; text: string | SafeHtml }>>([
    {
      role: 'bot',
      text: this.sanitizer.bypassSecurityTrustHtml("Hi, I'm your Course Companion. I can help you understand lessons, explain concepts, or guide you through tricky topics.")
    }
  ]);

  sendChatMessage() {
    const question = (this.chatInput() || '').trim();
    if (!question || this.isChatSending()) return;

    const tree = this.courseTree;
    const cpCourseDetailId = tree?.courseId;
    if (!cpCourseDetailId) {
      this.toastr.error('Course is not loaded yet. Please try again in a moment.', 'Error');
      return;
    }

    const payload = {
      customerId: 1,
      question: question,
      cpCourseDetailId: cpCourseDetailId,
      threadId: this.chatThreadId()
    };

    this.chatMessages.set([...this.chatMessages(), { role: 'user', text: this.sanitizer.bypassSecurityTrustHtml(question) }]);
    this.chatInput.set('');
    this.isChatSending.set(true);

    this.courseService.askCourseQuestion(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const threadId = res?.data?.threadId ?? res?.threadId;
        if (typeof threadId === 'string' && threadId.length > 0) {
          this.chatThreadId.set(threadId);
        }

        const answer = res?.data?.answer ?? res?.answer ?? res?.data?.response ?? res?.response ?? res?.message;
        const text = typeof answer === 'string' && answer.trim().length > 0 ? answer : 'I could not find an answer for that.';
        this.chatMessages.set([...this.chatMessages(), { role: 'bot', text }]);
        this.isChatSending.set(false);
      },
      error: (err: any) => {
        this.isChatSending.set(false);
        this.toastr.error('Failed to send your question. Please try again.', 'Error');
        console.error('Ask Course Question Error:', err);
      }
    });
  }

  handleChatMessageClick(event: Event) {
    const target = event.target as HTMLElement;

    // Check if the clicked element or its parent is the live chat link
    if (target.classList.contains('live-chat-link') ||
      target.closest('.live-chat-link') ||
      target.getAttribute('data-live-chat') === 'true' ||
      target.closest('[data-live-chat]')) {
      console.log('[Live Chat Debug] Live chat link clicked, calling activateLiveChat');
      event.preventDefault();
      event.stopPropagation();
      this.activateLiveChat();
    } else {
    }
  }

  activateLiveChat() {

    if (isPlatformBrowser(this.platformId)) {

      // Check if script already exists to avoid duplicate loading
      const existingScript = document.getElementById('cd360-snippet');
      console.log('[Live Chat Debug] Existing script check:', existingScript);
      if (existingScript) {
        if (window.Chattrak?.openChat) {
          window.Chattrak.openChat();
        }
        return;
      }

      // Dynamically load the chattrik script
      console.log('[Live Chat Debug] Loading chattrik script dynamically');
      const script = document.createElement('script');
      script.id = 'cd360-snippet';
      script.src = 'https://app.chattrik.com/assets/scripts/snippet.js?key=69dd2f99b2f813411fe1e011&position=left';
      script.async = true;
      script.setAttribute('data-position', 'left');

      console.log('[Live Chat Debug] Script element created:', script);

      script.onload = () => {
        console.log('[Live Chat Debug] Chattrik script loaded');

        // Add CSS to hide launcher button
        this.addLauncherButtonHidingCSS();

        // Wait for widget to render, then attach event listener to minimize button
        setTimeout(() => {
          // Directly modify the launcher iframe position
          const launcherIframe = document.querySelector('iframe#launcher') as HTMLElement;
          if (launcherIframe) {
            console.log('[Live Chat Debug] Found launcher iframe, positioning on left');
            launcherIframe.style.left = '0px';
            launcherIframe.style.right = 'auto';
          }

          // Directly modify the webWidget iframe position
          const webWidgetIframe = document.querySelector('iframe#webWidget') as HTMLElement;
          if (webWidgetIframe) {
            console.log('[Live Chat Debug] Found webWidget iframe, positioning on left');
            webWidgetIframe.style.left = '0px';
            webWidgetIframe.style.right = 'auto';
            webWidgetIframe.style.display = 'block';
          }

          this.attachMinimizeButtonListener();

          // Open live chat
          if (window.Chattrak?.openChat) {
            console.log('[Live Chat Debug] Calling Chattrak.openChat()');
            window.Chattrak.openChat();
          } else {
            console.log('[Live Chat Debug] Chattrak.openChat not available, widget might auto-open');
          }
        }, 2000); // Wait 2 seconds for widget to render
      };

      script.onerror = () => {
        console.error('[Live Chat Debug] Failed to load chattrik script');
        // Reset if script fails to load
        this.isLiveChatActive.set(false);
      };

      console.log('[Live Chat Debug] Appending script to body');
      document.body.appendChild(script);
      console.log('[Live Chat Debug] Script appended to body');
    } else {
      console.log('[Live Chat Debug] NOT in browser platform - skipping');
    }
  }

  private addLauncherButtonHidingCSS() {
    if (isPlatformBrowser(this.platformId)) {
      // Add CSS rule to hide launcher button and position widget on left
      const style = document.createElement('style');
      style.id = 'launcher-button-hider';
      style.textContent = `
        #launcher_btn {
          display: none !important;
        }
        /* Position Chattrik launcher button on left side */
        iframe#launcher {
          left: 0px !important;
          right: auto !important;
        }
        /* Position Chattrik webWidget on left side */
        iframe#webWidget {
          left: 0px !important;
          right: auto !important;
        }
        /* Position Chattrik widget on left side */
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
      console.log('[Live Chat Debug] Added CSS to hide launcher button and position widget on left');
    }
  }

  private removeLauncherButtonHidingCSS() {
    if (isPlatformBrowser(this.platformId)) {
      const style = document.getElementById('launcher-button-hider');
      if (style) {
        style.remove();
        console.log('[Live Chat Debug] Removed CSS styling');
      }
    }
  }

  private attachMinimizeButtonListener() {
    console.log('[Live Chat Debug] Using polling to detect widget minimization');

    // Remove any existing listener to avoid duplicates
    if ((window as any).liveChatMinimizeHandler) {
      document.removeEventListener('click', (window as any).liveChatMinimizeHandler);
    }

    // Use polling to check if widget is visible
    let widgetWasVisible = false;
    let pollCount = 0;
    const maxPolls = 30; // Poll for 30 seconds

    const pollInterval = setInterval(() => {
      pollCount++;
      const chatWidget = document.querySelector('app-root div.content_body');
      const isVisible = chatWidget && (chatWidget as HTMLElement).offsetParent !== null;

      console.log('[Live Chat Debug] Poll ' + pollCount + ': Widget visibility check:', isVisible);

      if (isVisible) {
        widgetWasVisible = true;
      }

      // If widget was visible and now is not, it was minimized
      if (widgetWasVisible && !isVisible) {
        console.log('[Live Chat Debug] Widget was minimized!');
        clearInterval(pollInterval);
        this.deactivateLiveChat();
      }

      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        console.log('[Live Chat Debug] Polling stopped after max polls');
      }
    }, 1000); // Check every second
  }

  deactivateLiveChat() {
    if (isPlatformBrowser(this.platformId)) {
      console.log('[Live Chat Debug] deactivateLiveChat called');

      // Remove CSS hiding rule so launcher button can show again
      this.removeLauncherButtonHidingCSS();

      // Remove the chattrik script
      const script = document.getElementById('cd360-snippet');
      console.log('[Live Chat Debug] Found script element:', script);
      if (script) {
        console.log('[Live Chat Debug] Removing chattrik script');
        script.remove();
        console.log('[Live Chat Debug] Script removed');
      } else {
        console.log('[Live Chat Debug] Script element not found');
      }

      // Remove the chattrik widget HTML (app-root with content_body)
      const chatWidget = document.querySelector('app-root div.content_body');
      console.log('[Live Chat Debug] Found chat widget:', chatWidget);
      if (chatWidget) {
        const appRoot = chatWidget.closest('app-root');
        console.log('[Live Chat Debug] Found app-root:', appRoot);
        if (appRoot) {
          console.log('[Live Chat Debug] Removing app-root element');
          appRoot.remove();
          console.log('[Live Chat Debug] App-root removed successfully');
        }
      } else {
        console.log('[Live Chat Debug] Chat widget not found, trying alternative selectors');
        // Try alternative selectors
        const allAppRoots = document.querySelectorAll('app-root');
        console.log('[Live Chat Debug] Found app-root elements:', allAppRoots.length);
        allAppRoots.forEach((root, index) => {
          console.log('[Live Chat Debug] App-root', index, ':', root);
          if (root.querySelector('.content_body')) {
            console.log('[Live Chat Debug] Found app-root with content_body, removing');
            root.remove();
          }
        });
      }

      // Remove the launcher button if it exists
      const launcherBtn = document.getElementById('launcher_btn');
      console.log('[Live Chat Debug] Found launcher button:', launcherBtn);
      if (launcherBtn) {
        console.log('[Live Chat Debug] Removing launcher button');
        launcherBtn.remove();
        console.log('[Live Chat Debug] Launcher button removed successfully');
      }

      console.log('[Live Chat Debug] deactivateLiveChat completed');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
