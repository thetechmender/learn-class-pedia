import { HostListener, inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  public securityTriggered = new Subject<boolean>();
  private toastr = inject(ToastrService);

  // SecurityService ke andar

  init() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {

      // 1. Detect jab window focus se bahar jaye (Snipping tool khulne par blur trigger hota hai)
      window.addEventListener('blur', () => {
        this.enableProtection();
      });

      // 2. Detect jab user wapas aaye
      window.addEventListener('focus', () => {
        this.disableProtection();
      });

      // 3. Visibility Change detection (Tab switch ya minimize hone par)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.enableProtection();
        }
      });

      // 4. Keyboard Shortcuts (Jo browser allow karta hai)
      window.addEventListener('keydown', (event) => {
        // Block Print Screen key
        if (event.key === 'PrintScreen') {
          this.enableProtection();
          navigator.clipboard.writeText('');
          this.toastr.error(
            'Screenshots are prohibited.',
            'Security Alert'
          );
        }

        // Block Ctrl+P, Ctrl+S, Ctrl+U
        const blockedKeys = ['p', 's', 'u'];
        if (event.ctrlKey && blockedKeys.includes(event.key.toLowerCase())) {
          event.preventDefault();
          this.toastr.warning('This action is disabled.');
        }
      });
    }
  };

  private enableProtection() {
    document.body.classList.add('screen-protected');
    // Screen protected class mein CSS filter: blur(50px) hona chahiye
  }

  private disableProtection() {
    // 3 second wait taake agar screenshot liya gaya ho to blur area hi aaye
    setTimeout(() => {
      document.body.classList.remove('screen-protected');
    }, 2000);
  }

  async isDualDisplayActive(): Promise<boolean> {
    const dualDisplay = await this.isDual();

    if (dualDisplay) {
      this.toastr.error(
        'Please turn off dual display to continue.',
        'Dual Display Detected'
      );
      return false;
    }

    return true;
  };


  private async isDual(): Promise<boolean> {
    // Check if running in browser environment
    if (typeof window !== 'undefined' && 'getScreenDetails' in window) {
      // @ts-ignore
      const details = await window.getScreenDetails();
      return details.screens.length > 1;
    }
    return false;
  };

  // .screen-protected
  // filter: blur(80px) !important
  // pointer-events: none !important
  // user-select: none !important
}



