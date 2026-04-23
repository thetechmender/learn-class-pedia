import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SafeHtmlPipe } from '../../../../services/safe-html.pipe';

export type BookTheme = 'day' | 'sepia' | 'night';
export type BookFontScale = 1 | 1.15 | 1.3;

interface Lecture {
  id?: number;
  title?: string;
  content?: string;
  sectionType?: string;
  contentSectionOrder?: number;
}

type PageKind = 'cover' | 'index' | 'heading' | 'content' | 'end' | 'blank';

export interface IndexEntry {
  chapter: number;
  title: string;
  subtitle?: string;
  targetIndex: number;
  minutes: number;
}

interface BookPage {
  kind: PageKind;
  title?: string;
  subtitle?: string;
  content?: string;
  pageNumber?: number;
  entries?: IndexEntry[];
}

interface Sheet {
  index: number;
  front: BookPage;
  back: BookPage;
}

@Component({
  selector: 'app-3d-book',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './three-d-book.component.html',
  styleUrls: ['./three-d-book.component.scss'],
})
export class ThreeDBookComponent implements OnInit, AfterViewInit {
  @Input() lectures: Lecture[] = [];
  @Input() bookTitle: string = 'Lecture Materials';

  @Output() pageChanged = new EventEmitter<number>();
  @Output() bookCompleted = new EventEmitter<void>();

  sheets: Sheet[] = [];
  currentIndex = 0;
  flippingIndex: number | null = null;

  // Drag state
  dragSheetIdx: number | null = null;
  dragRotation = 0;
  dragging = false;
  private dragDirection: 'forward' | 'backward' = 'forward';
  private dragStartX = 0;
  private dragHalfWidth = 1;
  private dragPointerId: number | null = null;
  private lastMoveX = 0;
  private lastMoveTime = 0;
  progress = signal<any>(null);
  private dragVelocity = 0; // px per ms (positive = rightward)

  // Reading preferences / state
  soundEnabled = false;
  theme: BookTheme = 'sepia';
  fontScale: BookFontScale = 1;
  bookmarks = new Set<number>();
  visited = new Set<number>();
  isFullscreen = false;

  private readonly flipDurationMs = 850;
  private readonly dragCommitThreshold = 90; // degrees
  private readonly dragVelocityCommit = 0.55; // px/ms
  private isAnimating = false;
  private completedOnce = false;
  private audioCtx: AudioContext | null = null;
  private readonly isBrowser: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private hostEl: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.buildSheets();
    this.restoreState();
  }

  ngAfterViewInit(): void {
    this.cdr.markForCheck();
  }

  get currentLabel(): string {
    const total = this.lectures.length;
    if (this.currentIndex === 0) return `Cover`;
    if (this.currentIndex === 1) return `Contents`;
    if (this.currentIndex > this.sheets.length - 1 && this.sheets.length > 0) return `The End`;
    const ch = this.currentIndex - 1; // chapter k at currentIndex=k+1
    if (ch >= 1 && ch <= total) return `Chapter ${ch} of ${total}`;
    return `Page ${this.currentIndex}`;
  }

  get currentChapter(): number {
    // returns 0 if not on a chapter spread
    const ch = this.currentIndex - 1;
    return ch >= 1 && ch <= this.lectures.length ? ch : 0;
  }

  isBookmarked(): boolean {
    return this.bookmarks.has(this.currentIndex);
  }

  get progressPercent(): number {
    if (this.sheets.length === 0) return 0;
    return (this.currentIndex / this.sheets.length) * 100;
  }

  getZIndex(i: number): number {
    const total = this.sheets.length;
    if (i === this.flippingIndex) return total * 2 + 10;
    if (i < this.currentIndex) return total + i;
    return total - i;
  }

  @HostListener('window:keydown', ['$event'])
  onKey(ev: KeyboardEvent): void {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) return;
    switch (ev.key) {
      case 'ArrowRight':
      case ' ':
        ev.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
        ev.preventDefault();
        this.prev();
        break;
      case 'Home':
        ev.preventDefault();
        this.goFirst();
        break;
      case 'End':
        ev.preventDefault();
        this.goLast();
        break;
    }
  }

  next(): void {
    if (this.isAnimating || this.currentIndex >= this.sheets.length) return;
    this.animateTo(this.currentIndex + 1);
  }

  prev(): void {
    if (this.isAnimating || this.currentIndex <= 0) return;
    this.animateTo(this.currentIndex - 1);
  }

  goFirst(): void {
    if (this.isAnimating || this.currentIndex === 0) return;
    this.currentIndex = 0;
    this.emitPageChanged();
    this.persistState();
    this.cdr.markForCheck();
  }

  goLast(): void {
    if (this.isAnimating || this.currentIndex >= this.sheets.length) return;
    this.currentIndex = this.sheets.length;
    this.markVisited();
    this.emitPageChanged();
    this.checkCompletion();
    this.persistState();
    this.cdr.markForCheck();
  }

  goTo(target: number): void {
    const clamped = Math.max(0, Math.min(this.sheets.length, target));
    if (this.isAnimating || clamped === this.currentIndex) return;
    this.currentIndex = clamped;
    this.markVisited();
    this.emitPageChanged();
    this.playFlipSound();
    this.checkCompletion();
    this.persistState();
    this.cdr.markForCheck();
  }

  toggleBookmark(): void {
    if (this.currentIndex === 0) return;
    if (this.bookmarks.has(this.currentIndex)) this.bookmarks.delete(this.currentIndex);
    else this.bookmarks.add(this.currentIndex);
    this.persistState();
    this.cdr.markForCheck();
  }

  setTheme(theme: BookTheme): void {
    this.theme = theme;
    this.persistState();
    this.cdr.markForCheck();
  }

  cycleTheme(): void {
    const order: BookTheme[] = ['day', 'sepia', 'night'];
    const next = order[(order.indexOf(this.theme) + 1) % order.length];
    this.setTheme(next);
  }

  setFontScale(scale: BookFontScale): void {
    this.fontScale = scale;
    this.persistState();
    this.cdr.markForCheck();
  }

  increaseFont(): void {
    const steps: BookFontScale[] = [1, 1.15, 1.3];
    const next = steps[Math.min(steps.length - 1, steps.indexOf(this.fontScale) + 1)];
    this.setFontScale(next);
  }

  decreaseFont(): void {
    const steps: BookFontScale[] = [1, 1.15, 1.3];
    const next = steps[Math.max(0, steps.indexOf(this.fontScale) - 1)];
    this.setFontScale(next);
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    this.persistState();
    this.cdr.markForCheck();
  }

  toggleFullscreen(): void {
    if (!this.isBrowser) return;
    const doc: any = document;
    const el: any = this.hostEl.nativeElement;
    const fsEl = doc.fullscreenElement || doc.webkitFullscreenElement;
    if (!fsEl) {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    } else {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    }
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  onFullscreenChange(): void {
    if (!this.isBrowser) return;
    const doc: any = document;
    this.isFullscreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
    this.cdr.markForCheck();
  }

  isChapterVisited(entry: IndexEntry): boolean {
    return this.visited.has(entry.chapter);
  }

  isChapterCurrent(entry: IndexEntry): boolean {
    return this.currentChapter === entry.chapter;
  }

  private markVisited(): void {
    const ch = this.currentChapter;
    if (ch > 0) this.visited.add(ch);
  }

  private playFlipSound(): void {
    if (!this.soundEnabled || !this.isBrowser) return;
    try {
      const AC: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      if (!this.audioCtx) this.audioCtx = new AC();
      const ctx = this.audioCtx;
      const duration = 0.09;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / data.length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3) * 0.35;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 0.8;
      const gain = ctx.createGain();
      gain.gain.value = 0.6;
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start();
    } catch {
      /* ignore */
    }
  }

  private storageKey(): string {
    return `3d-book:${this.bookTitle}`;
  }

  private persistState(): void {
    if (!this.isBrowser) return;
    try {
      const payload = {
        currentIndex: this.currentIndex,
        bookmarks: [...this.bookmarks],
        visited: [...this.visited],
        theme: this.theme,
        fontScale: this.fontScale,
        soundEnabled: this.soundEnabled,
      };
      localStorage.setItem(this.storageKey(), JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }

  private restoreState(): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.currentIndex === 'number') {
        this.currentIndex = Math.max(0, Math.min(this.sheets.length, data.currentIndex));
      }
      if (Array.isArray(data.bookmarks)) this.bookmarks = new Set(data.bookmarks);
      if (Array.isArray(data.visited)) this.visited = new Set(data.visited);
      if (data.theme === 'day' || data.theme === 'sepia' || data.theme === 'night') this.theme = data.theme;
      if (data.fontScale === 1 || data.fontScale === 1.15 || data.fontScale === 1.3) this.fontScale = data.fontScale;
      if (typeof data.soundEnabled === 'boolean') this.soundEnabled = data.soundEnabled;
    } catch {
      /* ignore */
    }
  }

  onPointerDown(ev: PointerEvent): void {
    if (this.isAnimating || this.dragging) return;
    if (ev.button !== undefined && ev.button !== 0) return;

    const tgt = ev.target as HTMLElement | null;
    if (tgt && tgt.closest('[data-nodrag], button, a, input, textarea')) return;

    const container = ev.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const isRightSide = ev.clientX >= centerX;

    let targetIdx: number;
    if (isRightSide) {
      if (this.currentIndex >= this.sheets.length) return;
      targetIdx = this.currentIndex;
      this.dragDirection = 'forward';
      this.dragRotation = 0;
    } else {
      if (this.currentIndex <= 0) return;
      targetIdx = this.currentIndex - 1;
      this.dragDirection = 'backward';
      this.dragRotation = -180;
    }

    this.dragSheetIdx = targetIdx;
    this.dragging = true;
    this.dragStartX = ev.clientX;
    this.dragHalfWidth = Math.max(1, rect.width / 2);
    this.dragPointerId = ev.pointerId;
    this.lastMoveX = ev.clientX;
    this.lastMoveTime = performance.now();
    this.dragVelocity = 0;

    try { container.setPointerCapture(ev.pointerId); } catch { }
    ev.preventDefault();
    this.cdr.markForCheck();
  }

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragging || this.dragPointerId !== ev.pointerId) return;

    const now = performance.now();
    const dt = Math.max(1, now - this.lastMoveTime);
    this.dragVelocity = (ev.clientX - this.lastMoveX) / dt;
    this.lastMoveX = ev.clientX;
    this.lastMoveTime = now;

    const deltaX = ev.clientX - this.dragStartX;
    const ratio = Math.max(-1, Math.min(1, deltaX / this.dragHalfWidth));
    const sweep = ratio * 180;

    if (this.dragDirection === 'forward') {
      this.dragRotation = Math.max(-180, Math.min(0, sweep));
    } else {
      this.dragRotation = Math.max(-180, Math.min(0, -180 + sweep));
    }
    this.cdr.markForCheck();
  }

  onPointerUp(ev: PointerEvent): void {
    if (!this.dragging || this.dragPointerId !== ev.pointerId) return;

    const container = ev.currentTarget as HTMLElement;
    try { container.releasePointerCapture(ev.pointerId); } catch { }

    const overThreshold =
      this.dragDirection === 'forward'
        ? this.dragRotation <= -this.dragCommitThreshold
        : this.dragRotation >= -180 + this.dragCommitThreshold;

    const flickCommit =
      this.dragDirection === 'forward'
        ? this.dragVelocity <= -this.dragVelocityCommit && this.dragRotation < 0
        : this.dragVelocity >= this.dragVelocityCommit && this.dragRotation > -180;

    const shouldCommit = overThreshold || flickCommit;

    this.dragging = false;
    this.dragPointerId = null;
    this.cdr.markForCheck();

    if (shouldCommit) {
      if (this.dragDirection === 'forward') {
        this.currentIndex = Math.min(this.sheets.length, this.currentIndex + 1);
      } else {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
      }
      this.flippingIndex = this.dragSheetIdx;
      this.markVisited();
      this.emitPageChanged();
      this.playFlipSound();
      this.persistState();
    } else {
      this.flippingIndex = this.dragSheetIdx;
    }

    this.dragSheetIdx = null;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.flippingIndex = null;
      this.checkCompletion();
      this.cdr.markForCheck();
    }, this.flipDurationMs);
  }

  onPointerCancel(ev: PointerEvent): void {
    if (!this.dragging) return;
    this.onPointerUp(ev);
  }

  private animateTo(target: number): void {
    const forward = target > this.currentIndex;
    this.flippingIndex = forward ? this.currentIndex : target;
    this.isAnimating = true;
    this.playFlipSound();
    this.cdr.markForCheck();

    requestAnimationFrame(() => {
      this.currentIndex = target;
      this.markVisited();
      this.cdr.markForCheck();
      setTimeout(() => {
        this.flippingIndex = null;
        this.isAnimating = false;
        this.emitPageChanged();
        this.checkCompletion();
        this.persistState();
        this.cdr.markForCheck();
      }, this.flipDurationMs);
    });
  }

  private emitPageChanged(): void {
    this.pageChanged.emit(this.currentIndex);
  }

  private checkCompletion(): void {
    if (!this.completedOnce && this.sheets.length > 0 && this.currentIndex === this.sheets.length) {
      this.completedOnce = true;
      this.bookCompleted.emit();
    }
  }

  private buildSheets(): void {
    const sorted = [...(this.lectures || [])].sort((a, b) => {
      const ao = a.contentSectionOrder ?? 0;
      const bo = b.contentSectionOrder ?? 0;
      return ao - bo;
    });

    const headings: BookPage[] = sorted.map((lec, i) => {
      const { title, content } = this.extractTitleAndContent(lec);
      return {
        kind: 'heading',
        title,
        subtitle: lec.sectionType || `Lecture ${i + 1}`,
        content,
        pageNumber: i + 1,
      };
    });

    const contents: BookPage[] = sorted.map((lec, i) => {
      const { title, content } = this.extractTitleAndContent(lec);
      return {
        kind: 'content',
        title,
        subtitle: lec.sectionType,
        content,
        pageNumber: i + 1,
      };
    });

    const cover: BookPage = {
      kind: 'cover',
      title: this.bookTitle,
      subtitle: sorted[0]?.sectionType,
    };

    const end: BookPage = { kind: 'end' };
    const blank: BookPage = { kind: 'blank' };

    // Index entries: chapter k (1-indexed) is reached when currentIndex = k + 1
    // given the sheet layout below.
    const entries: IndexEntry[] = sorted.map((lec, i) => {
      const { title, content } = this.extractTitleAndContent(lec);
      return {
        chapter: i + 1,
        title,
        subtitle: lec.sectionType,
        targetIndex: i + 2,
        minutes: this.estimateMinutes(content),
      };
    });

    const indexPage: BookPage = {
      kind: 'index',
      title: 'Table of Contents',
      subtitle: this.bookTitle,
      entries,
    };

    const sheets: Sheet[] = [];

    // Sheet 0: cover (right)  |  index (back, shown as left after first flip)
    sheets.push({ index: 0, front: cover, back: indexPage });

    if (sorted.length === 0) {
      sheets.push({ index: 1, front: blank, back: end });
      this.sheets = sheets;
      return;
    }

    // Sheet 1: blank right page (after index spread) | heading[0] on back
    sheets.push({ index: 1, front: blank, back: headings[0] });

    // Sheets 2..N: content[k-1] (right) | heading[k] (back) or end
    for (let k = 0; k < sorted.length; k++) {
      sheets.push({
        index: k + 2,
        front: contents[k],
        back: headings[k + 1] ?? end,
      });
    }

    if (sheets.length > 0 && sheets[sheets.length - 1].back.kind !== 'end') {
      sheets.push({
        index: sheets.length,
        front: blank,
        back: end,
      });
    }

    this.sheets = sheets;
  }

  private estimateMinutes(html: string): number {
    if (!html) return 1;
    let text = html;
    if (typeof document !== 'undefined') {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      text = tmp.textContent || '';
    } else {
      text = html.replace(/<[^>]+>/g, ' ');
    }
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  private extractTitleAndContent(lecture: Lecture): { title: string; content: string } {
    const raw = lecture.content ?? '';
    if (!raw) {
      return { title: lecture.title || 'Untitled', content: '' };
    }
    if (typeof document === 'undefined') {
      return { title: lecture.title || 'Untitled', content: raw };
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = raw;
    const h2 = tmp.querySelector('h2');
    const title = h2?.textContent?.trim() || lecture.title || 'Untitled';
    if (h2) h2.remove();
    return { title, content: tmp.innerHTML };
  };

  completionPercentage = computed(() => {
    const progress = this.progress();
    return progress?.completionPercentage || 0;
  });
}
