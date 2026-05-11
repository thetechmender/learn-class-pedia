import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { MoodService } from './mood.service';

export interface WarningEvent {
  type: 'screenshot' | 'tab_switch' | 'tab_close';
  timestamp: number;
}

export interface WarningAPIResponse {
  data: {
    warningCount: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  public securityTriggered = new Subject<boolean>();
  public warningEvent = new Subject<WarningEvent>();
  public autoSubmitTriggered = new Subject<void>();
  public showWarningPopup = new Subject<{ message: string; warningCount: number; type?: string }>();
  private toastr = inject(ToastrService);
  private http = inject(HttpClient);
  private moodService = inject(MoodService);
  private apiUrl = environment.API_URL;

  private warningCount = 0;
  private readonly MAX_WARNINGS_PER_ATTEMPT = 1;
  private isAssessmentActive = false;
  private isPopupVisible = false;
  private tabCloseInProgress = false;
  private currentQuestionId: number = 0;
  private orderPayload: any = null;
  private courseTypeId: number = 0;
  private questions: any[] = [];
  private authService = inject(AuthService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // SecurityService ke andar

  startAssessmentTracking() {
    this.isAssessmentActive = true;
    this.warningCount = 0;
  }

  stopAssessmentTracking() {
    this.isAssessmentActive = false;
    this.isPopupVisible = false;
    this.tabCloseInProgress = false;
    this.warningCount = 0;
    this.cleanupBodyState();
  }

  resetWarningCount() {
    this.warningCount = 0;
  }

  getWarningCount(): number {
    return this.warningCount;
  }

  setCurrentQuestionId(questionId: number) {
    this.currentQuestionId = questionId;
  }

  setOrderPayload(payload: any) {
    this.orderPayload = payload;
  }

  setCourseTypeId(courseTypeId: number) {
    this.courseTypeId = courseTypeId;
  }

  setQuestions(questions: any[]) {
    this.questions = questions;
  }

  dismissPopup() {
    this.isPopupVisible = false;
    this.isAssessmentActive = false;
    this.tabCloseInProgress = false;
    this.cleanupBodyState();
  }

  cleanupBodyState() {
    document.body.classList.remove('exam-mode');
    document.body.classList.remove('screen-protected');
    document.body.classList.remove('cursor-blocked');
    document.body.style.cursor = '';
    document.body.style.pointerEvents = '';
  }

  private async handleWarning(type: 'screenshot' | 'tab_switch' | 'tab_close') {
    if (!this.isAssessmentActive) {
      // Skip warning in classroom - no alert needed
      return;
    }

    // Skip if popup is already visible (prevents re-trigger on blur from popup interaction)
    if (this.isPopupVisible) {
      return;
    }

    // Emit warning event for component to handle
    this.warningEvent.next({
      type,
      timestamp: Date.now()
    });

    // Call warning API first to get the updated count
    await this.callWarningAPI(type, this.currentQuestionId, this.orderPayload, this.courseTypeId);

    // Build warning message
    const violationType = type === 'screenshot' ? 'Screenshot attempt' : type === 'tab_close' ? 'Tab close attempt' : 'Tab switch';
    const message = type === 'tab_close'
      ? 'You attempted to close the assessment tab. This is a violation of the assessment rules. Your assessment will be auto-submitted.'
      : `${violationType} detected during your assessment. This is a violation of the assessment rules. Please stay focused on the assessment window.`;

    // Emit popup event (auto-submit runs in parallel if limit reached)
    this.isPopupVisible = true;
    this.showWarningPopup.next({ message, warningCount: this.warningCount, type });

    // Check if limit reached based on API response count
    // Tab close always triggers auto-submit on acknowledge (handled in course.ts)
    if (type !== 'tab_close' && this.warningCount >= this.MAX_WARNINGS_PER_ATTEMPT) {
      this.isAssessmentActive = false;
      this.autoSubmitTriggered.next();
    }
  }

  private async callWarningAPI(type: 'screenshot' | 'tab_switch' | 'tab_close', questionId?: number, payload?: any, courseTypeId?: number) {
    const warningPayload = {
      questionId: questionId || 0,
      warningReason: type === 'screenshot' ? 'Screen Shot' : type === 'tab_close' ? 'Tab Close' : 'Tab Switch',
      warningDetails: '', // Empty string as requested
      courseId: courseTypeId === 3 ? payload?.shortCourseId
        : payload?.courseCertificateId || payload?.professionalCertificateId ||
        payload?.careerPathLevelMapId,
      courseCertificateId: courseTypeId === 2 ? payload?.courseCertificateId : null,
      professionalCertificateId: courseTypeId === 1 ? payload?.professionalCertificateId : null,
      careerPathLevelMapId: payload?.careerPathLevelMapId || null,
      assessmentTypeId: 2
    };

    try {
      const response = await this.http.post<WarningAPIResponse>(`${this.apiUrl}/assessment/warning`, warningPayload).toPromise();

      // Update local warningCount with API response warningCount
      if (response && response.data && response.data.warningCount !== undefined) {
        this.warningCount = response.data.warningCount;
      }

      return response;
    } catch (error) {
      console.error('[Warning API] Error:', error);
      return null;
    }
  }

  init() {
    // Skip on server (SSR) — no window/document available
    if (!isPlatformBrowser(this.platformId)) return;

    // --- Pehle wale saare code (Ctrl+P, Right Click) yahan rahen ge ---

    // 1. Detect jab window focus se bahar jaye (Snipping tool khulne par blur trigger hota hai)
    let blurTimeout: any = null;
    window.addEventListener('blur', () => {
      if (!this.isAssessmentActive || this.tabCloseInProgress) return;
      blurTimeout = setTimeout(() => {
        if (!this.isAssessmentActive) return;
        this.handleWarning('screenshot');
      }, 500);
    });

    // 2. Detect jab user wapas aaye
    window.addEventListener('focus', () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }

      // If returning from tab close dialog (user clicked Stay), show tab close warning
      if (this.tabCloseInProgress && this.isAssessmentActive) {
        this.tabCloseInProgress = false;
        this.handleWarning('tab_close');
        return;
      }
      this.tabCloseInProgress = false;
    });

    // 3. Visibility Change detection (Tab switch ya minimize hone par)
    document.addEventListener('visibilitychange', () => {
      if (!this.isAssessmentActive || this.tabCloseInProgress) return;
      if (document.hidden) {
        this.handleWarning('tab_switch');
      }
    });

    // 4. Tab/Window close detection (beforeunload)
    window.addEventListener('beforeunload', (e) => {
      if (!this.isAssessmentActive) return;

      this.tabCloseInProgress = true;

      e.preventDefault();
      e.returnValue = 'Your assessment is in progress. Are you sure you want to leave?';

      this.sendBeaconAutoSubmit();

      return e.returnValue;
    });

    // 5. Keyboard Shortcuts
    window.addEventListener('keydown', (event) => {
      if (!this.isAssessmentActive) return;

      if (event.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        this.handleWarning('screenshot');
      }

      const blockedKeys = ['p', 's', 'u'];
      if (event.ctrlKey && blockedKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
        this.toastr.warning('This action is disabled.');
      }
    });
  }

  private sendBeaconAutoSubmit() {
    if (!this.questions.length) return;

    const payload: any = {
      shortCourseId: this.orderPayload?.shortCourseId || null,
      courseCertificateId: this.orderPayload?.courseCertificateId || null,
      answers: this.questions.map((data: any) => ({
        questionId: data?.id,
        selectedAnswer: data?.selectedOption || ''
      }))
    };

    if (this.orderPayload?.careerPathLevelMapId) {
      payload.careerPathLevelMapId = this.orderPayload.careerPathLevelMapId;
      payload.professionalCertificateId = null;
    } else {
      payload.professionalCertificateId = this.orderPayload?.professionalCertificateId || null;
      payload.careerPathLevelMapId = null;
    }

    // Determine endpoint
    let endpoint = '';
    if (this.orderPayload?.careerPathLevelMapId) {
      endpoint = `${this.apiUrl}/assessment/career-path/final-assessment/submit`;
    } else {
      const typeMap: Record<number, string> = { 1: 'professional', 2: 'certificate', 3: 'short-course' };
      endpoint = `${this.apiUrl}/assessment/${typeMap[this.courseTypeId] || 'short-course'}/final-assessment/submit`;
    }

    // Use fetch with keepalive — survives page unload AND supports Authorization headers
    const token = this.authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        keepalive: true  // Ensures request completes even after page unloads
      });
    } catch (e) {
      // Fallback to sendBeacon if fetch fails
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    }
  }

  async isDualDisplayActive(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return true;

    // Check if device is mobile - skip dual display check on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      console.log('Mobile device detected - skipping dual display check');
      return true;
    }

    try {
      // Check if API is available
      if (!(window as any).getScreenDetails) {
        console.warn('Screen Details API not supported');
        return true;
      }

      const screenDetails = await (window as any).getScreenDetails();
      if (screenDetails && screenDetails.screens.length > 1) {
        this.toastr.error(
          'Disconnect extra displays.',
          'Access Restricted'
        );
        // Lumi reacts immediately to a dual-display violation
        this.moodService.setMood('angry', 4000);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Screen Details API error:', error);

      // If user denied permission or closed popup, block access
      if (error.name === 'NotAllowedError' || error.message?.includes('denied') || error.message?.includes('permission')) {
        this.toastr.error(
          'Disconnect extra displays.',
          'Access Restricted'
        );
        this.moodService.setMood('worried', 3000);
        return false;
      }

      // For other errors, allow but log
      console.warn('Allowing assessment due to API error');
      return true;
    }
  }

}



