import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Mood =
  // Generic legacy moods that are still actively used
  | 'happy' | 'idea' | 'congrats' | 'eyeClose'
  // Classroom emotions
  | 'reading' | 'lumiStill' | 'lumiThinking' | 'sleepy' | 'writing'
  | 'thumbsUp' | 'clapping' | 'sad' | 'cheering' | 'heart' | 'waiting'
  | 'hearing' | 'hooray' | 'helpful' | 'certificate' | 'worried' | 'angry';

type LoopState =
  | { kind: 'none' }
  | { kind: 'intro'; startedAt: number; eyeCloseTimer: any; readingTimer: any; endTimer: any }
  | { kind: 'cheering'; toggleTimer: any; flip: boolean };

/**
 * MoodService
 *
 * Central, intelligent mood bus for Lumi (the on-screen companion).
 *
 * Mood resolution priority (highest → lowest):
 *   1. Transient   — short event reactions (clapping, hooray, certificate, sad, …)
 *   2. Loop        — multi-frame loops (Reading/LumiStill intro, Cheering/Heart)
 *   3. Assessment  — persistent assessment-screen mood (hearing, sad, worried, angry)
 *   4. Idle        — lumiThinking after 1m / sleepy after 2m of no activity
 *   5. Tab         — tab-based context (helpful for content tabs, writing for notebook)
 *   Fallback       — null → mascot component shows a calm default (happy)
 */
@Injectable({ providedIn: 'root' })
export class MoodService {
  private platformId = inject(PLATFORM_ID);

  private _transient = signal<Mood | null>(null);   // short-lived event reactions
  private _loop = signal<Mood | null>(null);        // multi-frame loops
  private _assessment = signal<Mood | null>(null);  // assessment-screen context
  private _idle = signal<Mood | null>(null);        // idle / sleepy state
  private _tab = signal<Mood | null>(null);         // tab-based context (helpful / writing)

  /**
   * Final composed mood. Priority (high → low):
   * transient → loop → assessment → idle → tab.
   */
  readonly mood = computed<Mood | null>(
    () => {
      const transient = this._transient();
      const loop = this._loop();
      const assessment = this._assessment();
      const idle = this._idle();
      const tab = this._tab();

      // When in assessment mode, assessment mood has highest priority
      if (this.blockTransient && assessment) {
        return assessment;
      }

      return transient ?? loop ?? assessment ?? idle ?? tab;
    }
  );

  private _tick = signal(0);
  readonly tick = computed(() => this._tick());

  private transientTimer: any = null;
  private loopState: LoopState = { kind: 'none' };
  private blockTransient = false;  // Block transient moods during assessment
  private violationActive = false;  // Track if violation popup is showing

  // Idle / sleepy detection
  private idleThinkingTimer: any = null;   // 60s after last activity
  private sleepyTimer: any = null;         // 120s after last activity
  private idleStarted = false;

  // ---------- Low-level setters ----------

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** One-shot reaction that auto-clears after `holdMs`. */
  setMood(mood: Mood, holdMs: number = 3500): void {
    if (!this.isBrowser()) return;
    // Block transient moods during assessment to let assessment mood show
    if (this.blockTransient) {
      return;
    }
    if (this.transientTimer) clearTimeout(this.transientTimer);
    this._transient.set(mood);
    this._tick.update((t) => t + 1);
    this.transientTimer = setTimeout(() => {
      this._transient.set(null);
      this.transientTimer = null;
    }, holdMs);
  }

  /** Force-clear any active transient mood (e.g. so a context mood can take over). */
  private clearTransient(): void {
    if (this.transientTimer) {
      clearTimeout(this.transientTimer);
      this.transientTimer = null;
    }
    this._transient.set(null);
  }

  /** Clear all transient & loop state — context mood remains. */
  clear(): void {
    if (this.transientTimer) clearTimeout(this.transientTimer);
    this.transientTimer = null;
    this._transient.set(null);
    this.stopLoop();
  }

  // ---------- Loop control ----------

  private stopLoop(): void {
    if (this.loopState.kind === 'intro') {
      clearTimeout(this.loopState.eyeCloseTimer);
      clearTimeout(this.loopState.readingTimer);
      clearTimeout(this.loopState.endTimer);
    } else if (this.loopState.kind === 'cheering') {
      clearInterval(this.loopState.toggleTimer);
    }
    this.loopState = { kind: 'none' };
    this._loop.set(null);
  }

  // ---------- Public API ----------

  /**
   * Classroom intro animation: lumiStill 20s → eyeClose 20s → reading 20s.
   * After 60s of no activity: lumiThinking.
   * After 120s of no activity: sleepy.
   */
  startClassroom(): void {
    if (!this.isBrowser()) return;

    this.stopLoop();

    // 1️⃣ lumiStill (0–20s)
    this._loop.set('lumiStill');

    this.loopState = {
      kind: 'intro',
      startedAt: Date.now(),
      eyeCloseTimer: null,
      readingTimer: null,
      endTimer: null
    };

    this.recordActivity();
  }
  /** Reset idle/sleepy timers. Call on user input. */
  recordActivity(): void {
    if (!this.isBrowser()) return;
    this.idleStarted = true;
    if (this.idleThinkingTimer) clearTimeout(this.idleThinkingTimer);
    if (this.sleepyTimer) clearTimeout(this.sleepyTimer);

    // User is active again → clear idle layer so the underlying tab mood shows.
    this._idle.set(null);

    this.idleThinkingTimer = setTimeout(() => {
      this._idle.set('lumiThinking');
    }, 60_000);
    this.sleepyTimer = setTimeout(() => {
      this._idle.set('sleepy');
    }, 120_000);
  }

  /** Persistent tab-based context mood. */
  setActiveTab(tab: string | null | undefined): void {
    // Clear all higher priority moods before setting tab mood
    this.stopLoop();
    this.clearTransient();
    this._assessment.set(null);
    this._idle.set(null);

    if (tab === 'notebook') {
      this._tab.set('writing');
    }
    else if (tab === 'transcript') {
      this._tab.set('reading');
    } else if (tab === 'quiz') {
      // Quiz tab default mood
      this._tab.set('lumiThinking');
    } else {
      // anything else
      this._tab.set('lumiStill');
    }
    this.recordActivity();
  }

  /** Quiz score: 5 → clapping, 3-4 → thumbsUp, <3 → sad. */
  onQuizScore(correct: number, total: number): void {
    // Block quiz score reactions during assessment
    if (this.blockTransient) {
      return;
    }
    if (!total || total <= 0) return;
    if (correct >= 5) this.setMood('clapping', 4000);
    else if (correct >= 3) this.setMood('thumbsUp', 4000);
    else this.setMood('sad', 4000);
  }

  /** Drive mood from assessment lifecycle step. */
  onAssessmentStep(
    step: 'none' | 'start' | 'final' | 'cleared' | 'failed' | 'maxattempts',
    ctx?: { attemptsUsed?: number }
  ): void {
    if (!this.isBrowser()) return;
    // Don't change mood while violation popup is showing
    if (this.violationActive) return;
    switch (step) {
      case 'start':
        this.stopLoop();
        this._assessment.set(null);
        this.blockTransient = false;
        this._loop.set('cheering');
        break;
      case 'final':
        this.stopLoop();
        this.clearTransient();
        this._assessment.set('waiting');
        this.blockTransient = true;  // Block transient during assessment
        break;
      case 'cleared':
        this.clearTransient();
        this._assessment.set(null);
        this.blockTransient = false;  // Allow transient for cheering
        this.startCheeringLoop();
        break;
      case 'failed':
      case 'maxattempts': {
        this.stopLoop();
        this.clearTransient();
        const used = Math.max(1, ctx?.attemptsUsed ?? 1);
        const m: Mood = used >= 3 ? 'angry' : used === 2 ? 'worried' : 'sad';
        this._assessment.set(m);
        this.blockTransient = true;  // Block transient during assessment
        break;
      }
      case 'none':
        this.stopLoop();
        this.clearTransient();
        this._assessment.set('lumiStill');
        this.blockTransient = false;
        break;
    }
  }

  /** Cheering 5s ↔ Heart 5s loop, runs until the user leaves the screen. */
  private startCheeringLoop(): void {
    this.stopLoop();
    this._loop.set('heart');
    this.loopState = { kind: 'cheering', toggleTimer: null, flip: false };
  }

  /** User clicked Share-on-LinkedIn or Download Certificate. */
  onCertificateAction(): void {
    this.setMood('certificate', 5000);
  }

  /** After violation acknowledge, restore failed mood based on attempts. */
  onViolationAcknowledge(attemptsUsed: number): void {
    if (!this.isBrowser()) return;
    this.violationActive = false;
    const used = Math.max(1, attemptsUsed);
    const m: Mood = used >= 3 ? 'angry' : used === 2 ? 'worried' : 'sad';
    this._assessment.set(m);
  }

  // ---------- Legacy API (kept for backward compatibility) ----------

  react(
    event:
      | 'quiz-option-selected'
      | 'quiz-passed-perfect'
      | 'quiz-passed-high'
      | 'quiz-passed-low'
      | 'quiz-failed'
      | 'lecture-completed'
      | 'assessment-start'
      | 'assessment-in-progress'
      | 'assessment-cleared'
      | 'assessment-failed'
      | 'assessment-max-attempts'
      | 'warning-shown'
      | 'course-completed'
      | 'video-playing'
  ): void {
    // Warning-shown should always work, even during assessment
    if (event === 'warning-shown') {
      this.violationActive = true;
      this.clearTransient();
      this._assessment.set('angry');
      return;
    }

    // Block all mood reactions during assessment to let assessment mood show
    if (this.blockTransient) {
      return;
    }
    switch (event) {
      case 'quiz-option-selected':
        // lumiThinking is now default for quiz tab, no reaction needed
        break;
      case 'quiz-passed-perfect':
      case 'course-completed':
        this.setMood('congrats', 5000);
        break;
      case 'assessment-cleared':
        this.startCheeringLoop();
        break;
      case 'quiz-passed-high':
      case 'lecture-completed':
        this.setMood('thumbsUp', 3500);
        break;
      case 'quiz-passed-low':
      case 'quiz-failed':
        this.setMood('sad', 3500);
        break;
      case 'assessment-failed':
        this._assessment.set('sad');
        break;
      case 'assessment-start':
        this.setMood('hooray', 4000);
        break;
      case 'assessment-in-progress':
        this._assessment.set('hearing');
        break;
      case 'assessment-max-attempts':
        this._assessment.set('angry');
        break;
      case 'video-playing':
        this.setMood('happy', 2500);
        break;
    }
  }

  /** Legacy score helper — now count-based per spec. */
  reactToScore(correct: number, total: number, isFinalAssessment = false): void {
    if (isFinalAssessment) {
      // Assessment outcomes are handled by onAssessmentStep — keep as no-op here.
      return;
    }
    this.onQuizScore(correct, total);
  }
}
