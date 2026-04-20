import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
// Is subject se hum AppComponent ko batayenge ke screen block karni hai
  public securityTriggered = new Subject<boolean>();

// SecurityService ke andar

init() {
  // --- Pehle wale saare code (Ctrl+P, Right Click) yahan rahen ge ---

  // Jab user Snipping Tool kholne ke liye bahar jaye
  window.addEventListener('blur', () => {
    document.body.classList.add('screen-protected');
  });

  // Jab user wapas browser par aaye
  window.addEventListener('focus', () => {
    // 1. Check karein ke kya screen protected thi?
    if (document.body.classList.contains('screen-protected')) {
      
      // 2. 3 seconds (3000ms) ka wait karein
      setTimeout(() => {
        // 3. Blur hata dein
        document.body.classList.remove('screen-protected');
        
        // 4. Blur hatne ke baad alert dikhayein
        alert('Warning: Screenshots and screen recording are strictly prohibited. Your activity is being monitored.');
        
      }, 3000); 
    }
  });
}
}
