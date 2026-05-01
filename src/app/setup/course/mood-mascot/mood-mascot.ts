import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Mood, MoodService } from '../../../services/mood.service';

interface MoodAsset {
  src: string;
}

@Component({
  selector: 'app-mood-mascot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mood-mascot.html',
  styleUrl: './mood-mascot.sass',
})
export class MoodMascot implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private moodService = inject(MoodService);
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  /** Hide the mascot entirely (e.g. during assessment screens). */
  @Input() hidden = false;
  /** Click event so the parent can wire it up (e.g. open chat). */
  @Output() mascotClick = new EventEmitter<void>();

  private readonly assets: Record<Mood, MoodAsset> = {
    happy: { src: '/images/emotions/happy-emotion.png' },
    thumbs: { src: '/images/emotions/thumbs-up-emotion.png' },
    idea: { src: '/images/emotions/idea-emotion.png' },
    love: { src: '/images/emotions/love-emotion.png' },
    think: { src: '/images/emotions/think-emotion.png' },
    congrats: { src: '/images/emotions/congrats-emotion.png' },
  };

  // Calm idle rotation when no event-driven mood is active.
  private readonly idleOrder: Mood[] = ['happy', 'idea', 'think'];
  private idleIdx = 0;

  mood = signal<Mood>('happy');
  src = signal<string>(this.assets.happy.src);

  private idleTimer: any = null;
  private confettiFn: ((opts?: any) => void) | null = null;
  private lastTick = 0;

  /** Periodic "I'm here to help" prompt bubble. */
  promptVisible = signal(false);
  private promptIntervalMs = 10000; // show every 10s
  private promptVisibleMs = 5000;   // stays visible for 5s
  private promptInterval: any = null;
  private promptHideTimer: any = null;

  constructor() {
    // React to MoodService changes — but only schedule timers in the browser.
    // Recursive setTimeouts on the server keep the SSR zone unstable forever,
    // which causes the page to load indefinitely.
    effect(() => {
      const override = this.moodService.mood();
      const tick = this.moodService.tick();
      if (override) {
        this.applyMood(override);
        if (override === 'congrats' && tick !== this.lastTick && isPlatformBrowser(this.platformId)) {
          this.fireConfetti();
        }
        this.lastTick = tick;
        this.stopIdle();
      } else if (isPlatformBrowser(this.platformId)) {
        this.startIdle();
      }
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // @ts-ignore - no bundled types for canvas-confetti
    import('canvas-confetti')
      .then((m: any) => {
        this.confettiFn = (m && m.default) || m;
      })
      .catch(() => {});
    this.startIdle();
    this.startPromptCycle();
  }

  ngOnDestroy(): void {
    this.stopIdle();
    this.stopPromptCycle();
  }

  /** Click bubbles to parent (e.g. to open chat). */
  onClick(): void {
    this.promptVisible.set(false);
    this.mascotClick.emit();
  }

  // ---------- Prompt cycle (every 10s) ----------
  private startPromptCycle(): void {
    this.stopPromptCycle();
    // Show first prompt shortly after mount, then on a 10s interval.
    this.promptHideTimer = setTimeout(() => this.showPrompt(), 1500);
    this.promptInterval = setInterval(() => this.showPrompt(), this.promptIntervalMs);
  }

  private showPrompt(): void {
    if (this.hidden) return;
    this.promptVisible.set(true);
    if (this.promptHideTimer) clearTimeout(this.promptHideTimer);
    this.promptHideTimer = setTimeout(
      () => this.promptVisible.set(false),
      this.promptVisibleMs
    );
  }

  private stopPromptCycle(): void {
    if (this.promptInterval) {
      clearInterval(this.promptInterval);
      this.promptInterval = null;
    }
    if (this.promptHideTimer) {
      clearTimeout(this.promptHideTimer);
      this.promptHideTimer = null;
    }
    this.promptVisible.set(false);
  }

  // ---------- Mood application ----------
  private applyMood(m: Mood): void {
    this.mood.set(m);
    this.src.set(this.assets[m].src);
  }

  // ---------- Idle cycle ----------
  private startIdle(): void {
    this.stopIdle();
    const current = this.mood();
    if (!this.idleOrder.includes(current)) {
      this.idleIdx = 0;
      this.applyMood(this.idleOrder[0]);
    }
    this.scheduleIdle();
  }

  private scheduleIdle(): void {
    this.idleTimer = setTimeout(() => this.advanceIdle(), 4000);
  }

  private advanceIdle(): void {
    this.idleIdx = (this.idleIdx + 1) % this.idleOrder.length;
    this.applyMood(this.idleOrder[this.idleIdx]);
    this.scheduleIdle();
  }

  private stopIdle(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  // ---------- Confetti ----------
  private fireConfetti(): void {
    if (!this.confettiFn || !this.host?.nativeElement) return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    const base = {
      particleCount: 40,
      spread: 70,
      startVelocity: 28,
      scalar: 0.7,
      ticks: 120,
      origin: { x, y },
      colors: ['#0062CC', '#A3F3C4', '#FFD166', '#EF476F', '#8FE4B0'],
      disableForReducedMotion: true,
    };
    try {
      this.confettiFn(base);
      setTimeout(
        () => this.confettiFn && this.confettiFn({ ...base, particleCount: 25, spread: 90 }),
        180
      );
    } catch {}
  }
}
