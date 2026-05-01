import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Mood = 'happy' | 'thumbs' | 'congrats' | 'idea' | 'love' | 'think';

/**
 * MoodService
 *
 * Central, intelligent mood bus for the on-screen companion mascot.
 *
 * - Components push semantic events via `react()` (e.g. quiz submitted, assessment cleared).
 * - The service maps each event to a Mood + a `hold` duration.
 * - The MoodMascot component subscribes to `mood()` and animates accordingly.
 * - When no event is active, the mascot idles (handled by the component).
 */
@Injectable({ providedIn: 'root' })
export class MoodService {
  private platformId = inject(PLATFORM_ID);

  // null => mascot is in idle-cycle mode (driven by the component)
  private _mood = signal<Mood | null>(null);
  readonly mood = computed(() => this._mood());

  // Bumped every time a new mood is set, so subscribers can detect repeated triggers
  private _tick = signal(0);
  readonly tick = computed(() => this._tick());

  private clearTimer: any = null;

  /** Force a mood for `holdMs` milliseconds, then return to idle. */
  setMood(mood: Mood, holdMs: number = 3500): void {
    // Avoid scheduling timers on the server — they keep the SSR zone unstable
    // and cause the page to hang while loading.
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this._mood.set(mood);
    this._tick.update((t) => t + 1);
    this.clearTimer = setTimeout(() => {
      this._mood.set(null);
      this.clearTimer = null;
    }, holdMs);
  }

  /** Return immediately to idle. */
  clear(): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.clearTimer = null;
    this._mood.set(null);
  }

  /** Map semantic student events to moods. */
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
    switch (event) {
      case 'quiz-option-selected':
        this.setMood('idea', 1500);
        break;
      case 'quiz-passed-perfect':
      case 'course-completed':
      case 'assessment-cleared':
        this.setMood('congrats', 5000);
        break;
      case 'quiz-passed-high':
      case 'lecture-completed':
        this.setMood('thumbs', 3500);
        break;
      case 'quiz-passed-low':
      case 'quiz-failed':
      case 'assessment-failed':
        // Encouragement, not punishment.
        this.setMood('love', 3500);
        break;
      case 'assessment-start':
      case 'assessment-in-progress':
      case 'assessment-max-attempts':
      case 'warning-shown':
        this.setMood('think', 3500);
        break;
      case 'video-playing':
        this.setMood('happy', 2500);
        break;
    }
  }

  /** Score-based helper for quiz / assessment submissions. */
  reactToScore(correct: number, total: number, isFinalAssessment = false): void {
    if (!total || total <= 0) return;
    const pct = (correct / total) * 100;
    if (pct >= 100) this.react(isFinalAssessment ? 'assessment-cleared' : 'quiz-passed-perfect');
    else if (pct >= 70) this.react('quiz-passed-high');
    else if (pct >= 50) this.react('quiz-passed-low');
    else this.react(isFinalAssessment ? 'assessment-failed' : 'quiz-failed');
  }
}
