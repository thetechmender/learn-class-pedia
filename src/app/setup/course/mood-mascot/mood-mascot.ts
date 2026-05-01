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
  png: string;
  gif?: string;
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
  /** Use animated GIFs instead of static PNGs (falls back to PNG if GIF missing). */
  @Input() useGif = false;
  /** Click event so the parent can wire it up (e.g. open chat). */
  @Output() mascotClick = new EventEmitter<void>();

  private readonly assets: Record<Mood, MoodAsset> = {
    happy: {
      png: '/images/emotions/happy-emotion.png',
      gif: '/images/emotions/happy-emotion.gif',
    },
    thumbs: {
      png: '/images/emotions/thumbs-up-emotion.png',
      gif: '/images/emotions/thumbs-up-emotion.gif',
    },
    idea: {
      png: '/images/emotions/idea-emotion.png',
      gif: '/images/emotions/idea-emotion.gif',
    },
    love: {
      png: '/images/emotions/love-emotion.png',
      gif: '/images/emotions/love-emotion.gif',
    },
    think: {
      png: '/images/emotions/think-emotion.png',
      gif: '/images/emotions/think-emotion.gif',
    },
    congrats: {
      png: '/images/emotions/congrats-emotion.png',
      gif: '/images/emotions/congrats-emotion.gif',
    },
  };

  // Calm idle rotation when no event-driven mood is active.
  private readonly idleOrder: Mood[] = ['happy', 'idea', 'think'];
  private idleIdx = 0;

  mood = signal<Mood>('happy');
  src = signal<string>(this.assets.happy.png);

  private idleTimer: any = null;
  private confettiFn: ((opts?: any) => void) | null = null;
  private lastTick = 0;

  /** Periodic "I'm here to help" prompt bubble. */
  promptVisible = signal(false);
  attention = signal(false); // brief jump-to-grab-attention class
  hovered = signal(false);
  pressed = signal(false);

  // Rotating callout messages so it never feels repetitive.
  private readonly promptMessages: { title: string; body: string }[] = [
    { title: "I'm here to help!", body: 'Click or tap me to start a chat.' },
    { title: 'Got a question?', body: 'Tap me — I love explaining things.' },
    { title: 'Need a hint?', body: 'Click me anytime, I\'m listening.' },
    { title: 'Stuck on something?', body: 'Let\'s figure it out together — tap me.' },
    { title: 'Feeling curious?', body: 'Ask me anything about this lecture.' },
  ];
  private promptIdx = -1;
  currentPrompt = signal(this.promptMessages[0]);

  private promptIntervalMs = 10000; // show every 10s
  private promptVisibleMs = 5000;   // stays visible for 5s
  private promptInterval: any = null;
  private promptHideTimer: any = null;
  private attentionTimer: any = null;

  // Tracks how many callouts in a row the user has ignored (no hover/click).
  private ignoredCount = 0;
  // True on touch devices — magnetic cursor & hover effects are disabled.
  private isTouchDevice = false;
  // Visibility listener reference so we can remove it cleanly
  private visibilityHandler: (() => void) | null = null;

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

    // Detect touch device once — disables magnetic cursor & hover micro-anims
    this.isTouchDevice =
      'ontouchstart' in window ||
      (navigator as any).maxTouchPoints > 0;

    // @ts-ignore - no bundled types for canvas-confetti
    import('canvas-confetti')
      .then((m: any) => {
        this.confettiFn = (m && m.default) || m;
      })
      .catch(() => {});

    this.startIdle();
    this.startPromptCycle();

    // Pause heavy animations/timers when tab is backgrounded
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.stopIdle();
      } else {
        this.startIdle();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    this.stopIdle();
    this.stopPromptCycle();
    if (isPlatformBrowser(this.platformId) && this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  /** Click bubbles to parent (e.g. to open chat). */
  onClick(): void {
    this.promptVisible.set(false);
    this.ignoredCount = 0; // clicked — user is engaged
    // Brief press animation
    this.pressed.set(true);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.pressed.set(false), 220);
      // Mini celebratory particle burst around the mascot
      this.clickBurst();
    } else {
      this.pressed.set(false);
    }
    this.mascotClick.emit();
  }

  onMouseEnter(): void {
    if (this.isTouchDevice) return;
    this.hovered.set(true);
    this.ignoredCount = 0; // user noticed the mascot
    // Hovering stops the prompt nag.
    this.promptVisible.set(false);
  }

  onMouseLeave(): void {
    if (this.isTouchDevice) return;
    this.hovered.set(false);
    // Reset magnetic transform
    if (this.host?.nativeElement) {
      this.host.nativeElement.style.transform = '';
    }
  }

  /** Magnetic cursor: mascot slightly follows pointer for a premium feel. */
  onMouseMove(event: MouseEvent): void {
    if (this.isTouchDevice || this.pressed() || !this.host?.nativeElement) return;
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    // Clamp to max ~8px displacement
    const tx = Math.max(-1, Math.min(1, dx)) * 8;
    const ty = Math.max(-1, Math.min(1, dy)) * 8;
    el.style.transform = `translate(${tx}px, ${ty}px) scale(1.05)`;
  }

  /** Mini particle burst anchored at the mascot position. */
  private clickBurst(): void {
    if (!this.confettiFn || !this.host?.nativeElement) return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    try {
      this.confettiFn({
        particleCount: 20,
        spread: 40,
        scalar: 0.5,
        startVelocity: 22,
        ticks: 80,
        origin: { x, y },
        disableForReducedMotion: true,
      });
    } catch {}
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
    // Cycle through helpful messages
    this.promptIdx = (this.promptIdx + 1) % this.promptMessages.length;
    this.currentPrompt.set(this.promptMessages[this.promptIdx]);
    this.promptVisible.set(true);
    // Smart attention: if ignored 3+ times in a row, intensify the jump/shake
    this.ignoredCount++;
    this.triggerAttention();
    if (this.promptHideTimer) clearTimeout(this.promptHideTimer);
    this.promptHideTimer = setTimeout(
      () => this.promptVisible.set(false),
      this.promptVisibleMs
    );
  }

  /** True when the user has ignored enough callouts to justify extra motion. */
  isNagging(): boolean {
    return this.ignoredCount >= 3;
  }

  private triggerAttention(): void {
    this.attention.set(true);
    if (this.attentionTimer) clearTimeout(this.attentionTimer);
    this.attentionTimer = setTimeout(() => this.attention.set(false), 900);
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
    if (this.attentionTimer) {
      clearTimeout(this.attentionTimer);
      this.attentionTimer = null;
    }
    this.promptVisible.set(false);
    this.attention.set(false);
  }

  // ---------- Mood application ----------
  private applyMood(m: Mood): void {
    this.mood.set(m);
    const asset = this.assets[m];
    this.src.set(this.useGif && asset.gif ? asset.gif : asset.png);
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
