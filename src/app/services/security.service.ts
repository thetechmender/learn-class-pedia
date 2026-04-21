import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  public securityTriggered = new Subject<boolean>();
  private toastr = inject(ToastrService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  init() {
    // Skip on server (SSR) — no window/document available
    if (!isPlatformBrowser(this.platformId)) return;

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



