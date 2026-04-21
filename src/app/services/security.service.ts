import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

export interface WarningEvent {
  type: 'screenshot' | 'tab_switch';
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  public securityTriggered = new Subject<boolean>();
  public warningEvent = new Subject<WarningEvent>();
  public autoSubmitTriggered = new Subject<void>();
  private toastr = inject(ToastrService);
  private http = inject(HttpClient);
  
  private warningCount = 0;
  private readonly MAX_WARNINGS_PER_ATTEMPT = 3;
  private isAssessmentActive = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // SecurityService ke andar

  startAssessmentTracking() {
    this.isAssessmentActive = true;
    this.warningCount = 0;
  }

  stopAssessmentTracking() {
    this.isAssessmentActive = false;
    this.warningCount = 0;
  }

  resetWarningCount() {
    this.warningCount = 0;
  }

  getWarningCount(): number {
    return this.warningCount;
  }

  private async handleWarning(type: 'screenshot' | 'tab_switch') {
    if (!this.isAssessmentActive) {
      // For entire classroom - just show toastr warning
      this.toastr.warning(
        type === 'screenshot' ? 'Screenshots are prohibited.' : 'Tab switching is not allowed during assessment.',
        'Security Alert'
      );
      return;
    }

    // During assessment - track warnings and call API
    this.warningCount++;
    const remainingWarnings = this.MAX_WARNINGS_PER_ATTEMPT - this.warningCount;

    // Emit warning event for component to handle
    this.warningEvent.next({
      type,
      timestamp: Date.now()
    });

    // Show warning with remaining attempts
    this.toastr.warning(
      `${type === 'screenshot' ? 'Screenshot' : 'Tab switch'} detected. Warnings remaining: ${remainingWarnings}`,
      'Security Warning'
    );

    // Call warning API
    await this.callWarningAPI(type);

    // Check if limit reached
    if (this.warningCount >= this.MAX_WARNINGS_PER_ATTEMPT) {
      console.log('Warning limit reached. Auto-submitting assessment.');
      this.autoSubmitTriggered.next();
    }
  }

  private async callWarningAPI(type: 'screenshot' | 'tab_switch') {
    // TODO: Replace with actual API call
    console.log(`[Warning API] Type: ${type}, Count: ${this.warningCount}`);
    // Example API call structure:
    // return this.http.post('/api/warnings', { type, count: this.warningCount }).toPromise();
  }

  init() {
    // Skip on server (SSR) — no window/document available
    if (!isPlatformBrowser(this.platformId)) return;

    // --- Pehle wale saare code (Ctrl+P, Right Click) yahan rahen ge ---

    // 1. Detect jab window focus se bahar jaye (Snipping tool khulne par blur trigger hota hai)
    window.addEventListener('blur', () => {
      this.enableProtection();
      // Don't count as warning - only apply protection CSS
      // Warning count only for PrintScreen key and visibilitychange
    });

    // 2. Detect jab user wapas aaye
    window.addEventListener('focus', () => {
      this.disableProtection();
    });

    // 3. Visibility Change detection (Tab switch ya minimize hone par)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.enableProtection();
        this.handleWarning('tab_switch');
      }
    });

    // 4. Keyboard Shortcuts (Jo browser allow karta hai)
    window.addEventListener('keydown', (event) => {
      // Block Print Screen key
      if (event.key === 'Meta' || event.key === 'Shift') {
        this.enableProtection();
      }
      if (event.key === 'PrintScreen') {
        this.enableProtection();
        navigator.clipboard.writeText('');
        this.handleWarning('screenshot');
      }

      // Block Ctrl+P, Ctrl+S, Ctrl+U
      const blockedKeys = ['p', 's', 'u'];
      if (event.ctrlKey && blockedKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
        this.toastr.warning('This action is disabled.');
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.key === 'Meta' || event.key === 'Shift') {
        // Optional: Add a delay before removing protection to ensure SS is finished
        setTimeout(() => {
          this.disableProtection();
        }, 1000);
      }
    });
  }

  private enableProtection() {
    document.body.classList.add('screen-protected');
  }

  private disableProtection() {
    document.body.classList.remove('screen-protected');
  }

  async isDualDisplayActive(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return true;

    try {
      const screenDetails = await (window as any).getScreenDetails?.();
      if (screenDetails && screenDetails.screens.length > 1) {
        this.toastr.error(
          'Multiple displays detected. Please use a single display.',
          'Security Alert'
        );
        return false;
      }
    } catch (error) {
      console.warn('Screen Details API not supported');
    }

    return true;
  }

}



