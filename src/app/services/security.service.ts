import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  public securityTriggered = new Subject<boolean>();
  private toastr = inject(ToastrService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

// SecurityService ke andar

init() {
  // Skip on server (SSR) — no window/document available
  if (!isPlatformBrowser(this.platformId)) return;

  // --- Pehle wale saare code (Ctrl+P, Right Click) yahan rahen ge ---

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
  });

  // Jab user wapas browser par aaye
  // window.addEventListener('focus', () => {
  //   // 1. Check karein ke kya screen protected thi?
  //   if (document.body.classList.contains('screen-protected')) {
      
  //     // 2. 3 seconds (3000ms) ka wait karein
  //     setTimeout(() => {
  //       // 3. Blur hata dein
  //       document.body.classList.remove('screen-protected');
        
  //       // 4. Blur hatne ke baad alert dikhayein
  //       alert('Warning: Screenshots and screen recording are strictly prohibited. Your activity is being monitored.');
        
  //     }, 3000); 
  //   }
  // });
}
}



