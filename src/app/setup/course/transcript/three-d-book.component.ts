import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from './safe-html.pipe';

interface Lecture {
  id?: number;
  title?: string;
  content?: string;
  sectionType?: string;
  contentSectionOrder?: number;
}

type PageKind = 'cover' | 'heading' | 'content' | 'end' | 'blank';

interface BookPage {
  kind: PageKind;
  title?: string;
  subtitle?: string;
  content?: string;
  pageNumber?: number;
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
  template: `
    <div class="stage">
      <div class="toolbar">
        <div class="toolbar__title">{{ bookTitle }}</div>
        <div class="toolbar__info">{{ currentLabel }}</div>
        <div class="toolbar__actions">
          <button class="icon-btn" (click)="goFirst()" [disabled]="currentIndex === 0" title="First page">⏮</button>
          <button class="icon-btn" (click)="prev()" [disabled]="currentIndex === 0" title="Previous">◀</button>
          <button class="icon-btn" (click)="next()" [disabled]="currentIndex >= sheets.length" title="Next">▶</button>
          <button class="icon-btn" (click)="goLast()" [disabled]="currentIndex >= sheets.length" title="Last page">⏭</button>
        </div>
      </div>

      <div class="book-wrap">
        <div class="book">
          <div class="book__spine"></div>

          <div class="book__pages">
            @for (sheet of sheets; track sheet.index; let i = $index) {
              <div
                class="sheet"
                [class.sheet--flipped]="i < currentIndex"
                [class.sheet--flipping]="i === flippingIndex"
                [style.z-index]="getZIndex(i)"
              >
                <div class="sheet__face sheet__face--front">
                  <ng-container [ngTemplateOutlet]="pageTpl" [ngTemplateOutletContext]="{ $implicit: sheet.front, side: 'right' }"></ng-container>
                </div>
                <div class="sheet__face sheet__face--back">
                  <ng-container [ngTemplateOutlet]="pageTpl" [ngTemplateOutletContext]="{ $implicit: sheet.back, side: 'left' }"></ng-container>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="progress">
        <div class="progress__bar">
          <div class="progress__fill" [style.width.%]="progressPercent"></div>
        </div>
        <div class="progress__label">{{ progressPercent | number:'1.0-0' }}% complete</div>
      </div>
    </div>

    <ng-template #pageTpl let-page let-side="side">
      @switch (page.kind) {
        @case ('cover') {
          <div class="page page--cover">
            <div class="page--cover__ornament"></div>
            <div class="page--cover__title">{{ page.title }}</div>
            @if (page.subtitle) {
              <div class="page--cover__subtitle">{{ page.subtitle }}</div>
            }
            <div class="page--cover__meta">
              {{ lectures.length }} lecture{{ lectures.length === 1 ? '' : 's' }}
            </div>
            <div class="page--cover__hint">Press → or click ▶ to begin</div>
          </div>
        }
        @case ('heading') {
          <div class="page page--heading">
            <div class="page--heading__inner">
              @if (page.subtitle) {
                <div class="page--heading__kicker">{{ page.subtitle }}</div>
              }
              <h1 class="page--heading__title">{{ page.title }}</h1>
              <div class="page--heading__rule"></div>
              @if (page.pageNumber) {
                <div class="page--heading__chapter">Chapter {{ page.pageNumber }}</div>
              }
            </div>
            <div class="page__folio page__folio--left">{{ page.pageNumber }}</div>
          </div>
        }
        @case ('content') {
          <div class="page page--content">
            <header class="page__header">
              <div class="page__kicker">{{ page.subtitle || 'Continued' }}</div>
              <h2 class="page__title">{{ page.title }}</h2>
            </header>
            <div class="page__body" [innerHTML]="page.content | safeHtml"></div>
            <div class="page__folio page__folio--right">{{ page.pageNumber }}</div>
          </div>
        }
        @case ('end') {
          <div class="page page--end">
            <div class="page--end__inner">
              <h2>The End</h2>
              <p>You've reached the end of <em>{{ bookTitle }}</em>.</p>
              <p class="muted">Use ◀ or ← to revisit previous pages.</p>
            </div>
          </div>
        }
        @default {
          <div class="page page--blank"></div>
        }
      }
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 28px 16px;
      background: radial-gradient(ellipse at top, #1e293b 0%, #0f172a 70%);
      min-height: 100vh;
      color: #e2e8f0;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      width: min(980px, 100%);
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
    }

    .toolbar__title {
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .toolbar__info {
      font-size: 13px;
      color: #94a3b8;
      font-variant-numeric: tabular-nums;
    }

    .toolbar__actions { display: flex; gap: 6px; }

    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
      cursor: pointer;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
    }

    .icon-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .icon-btn:active:not(:disabled) { transform: scale(0.95); }

    .icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    .book-wrap {
      width: 100%;
      display: flex;
      justify-content: center;
      perspective: 2400px;
      perspective-origin: 50% 50%;
    }

    .book {
      position: relative;
      width: min(960px, 95vw);
      aspect-ratio: 3 / 2;
      transform-style: preserve-3d;
      transform: rotateX(4deg);
    }

    .book::before {
      content: '';
      position: absolute;
      inset: auto 0 -22px 0;
      height: 30px;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%);
      filter: blur(6px);
      pointer-events: none;
    }

    .book__spine {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 10px;
      transform: translateX(-50%);
      background: linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0.05), rgba(0,0,0,0.35));
      z-index: 50;
      pointer-events: none;
    }

    .book__pages {
      position: absolute;
      inset: 0;
      transform-style: preserve-3d;
    }

    /* Static base page visible on both halves as fallback background */
    .book::after {
      content: '';
      position: absolute;
      inset: 0;
      background: #fdfcf8;
      border-radius: 10px 10px 10px 10px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
      z-index: -1;
    }

    .sheet {
      position: absolute;
      top: 0;
      right: 0;
      width: 50%;
      height: 100%;
      transform-style: preserve-3d;
      transform-origin: left center;
      transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
      will-change: transform;
    }

    .sheet--flipped { transform: rotateY(-180deg); }

    .sheet--flipping { box-shadow: 0 30px 50px -10px rgba(0,0,0,0.55); }

    .sheet__face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      overflow: hidden;
      border-radius: 2px 10px 10px 2px;
      background: #fdfcf8;
      box-shadow: inset 2px 0 6px rgba(0,0,0,0.08);
    }

    .sheet__face--back {
      transform: rotateY(180deg);
      border-radius: 10px 2px 2px 10px;
      box-shadow: inset -2px 0 6px rgba(0,0,0,0.08);
    }

    .page {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 40px 44px 56px;
      box-sizing: border-box;
      color: #1f2937;
      font-family: 'Georgia', 'Times New Roman', serif;
      overflow: auto;
      background:
        linear-gradient(90deg, rgba(0,0,0,0.06) 0%, transparent 6%),
        #fdfcf8;
    }

    .sheet__face--back .page {
      background:
        linear-gradient(270deg, rgba(0,0,0,0.06) 0%, transparent 6%),
        #fdfcf8;
    }

    .page--blank { background: #fdfcf8; }

    .page__header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }

    .page__kicker {
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 11px;
      color: #9ca3af;
      font-family: 'Inter', system-ui, sans-serif;
      margin-bottom: 6px;
    }

    .page__title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      line-height: 1.3;
    }

    .page__body { font-size: 14px; line-height: 1.8; color: #374151; }

    .page__body ::ng-deep section { display: block; }
    .page__body ::ng-deep h2 { font-size: 18px; color: #1f2937; margin: 16px 0 10px; }
    .page__body ::ng-deep h3 { font-size: 16px; color: #374151; margin: 14px 0 8px; }
    .page__body ::ng-deep p { margin: 0 0 10px; }
    .page__body ::ng-deep ul,
    .page__body ::ng-deep ol { padding-left: 22px; margin: 8px 0 12px; }
    .page__body ::ng-deep li { margin: 4px 0; }
    .page__body ::ng-deep a { color: #2563eb; text-decoration: underline; }
    .page__body ::ng-deep code {
      background: #f3f4f6; padding: 2px 6px; border-radius: 4px;
      font-family: 'Menlo', monospace; font-size: 12px;
    }
    .page__body ::ng-deep table {
      width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px;
    }
    .page__body ::ng-deep th,
    .page__body ::ng-deep td {
      border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left;
    }
    .page__body ::ng-deep th { background: #f9fafb; font-weight: 600; }

    .page__folio {
      position: absolute;
      bottom: 18px;
      font-size: 11px;
      color: #9ca3af;
      font-family: 'Inter', system-ui, sans-serif;
      letter-spacing: 1px;
    }
    .page__folio--left { left: 28px; }
    .page__folio--right { right: 28px; }

    /* Cover */
    .page--cover {
      background:
        radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.12), transparent 60%),
        linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #9333ea 100%);
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 18px;
      font-family: 'Georgia', serif;
    }

    .page--cover__ornament {
      width: 80px; height: 4px;
      background: linear-gradient(90deg, transparent, #fde68a, transparent);
      border-radius: 4px;
    }

    .page--cover__title {
      font-size: 32px; font-weight: 700; line-height: 1.2;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3); padding: 0 20px;
    }

    .page--cover__subtitle { font-size: 16px; opacity: 0.85; font-style: italic; }

    .page--cover__meta {
      margin-top: 8px; font-size: 13px; letter-spacing: 2px;
      text-transform: uppercase; opacity: 0.75;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .page--cover__hint {
      margin-top: 20px; font-size: 12px; opacity: 0.6;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* Heading page (left side of a spread) */
    .page--heading {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background:
        radial-gradient(ellipse at 30% 30%, rgba(147, 51, 234, 0.06), transparent 60%),
        #faf9f5;
    }

    .page--heading__inner {
      max-width: 80%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }

    .page--heading__kicker {
      text-transform: uppercase;
      letter-spacing: 3px;
      font-size: 11px;
      color: #9333ea;
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 600;
    }

    .page--heading__title {
      margin: 0;
      font-size: 34px;
      line-height: 1.2;
      color: #111827;
      font-weight: 700;
      font-family: 'Georgia', serif;
    }

    .page--heading__rule {
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #8b5cf6, #ec4899);
      border-radius: 3px;
    }

    .page--heading__chapter {
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #6b7280;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* End page */
    .page--end {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background:
        radial-gradient(ellipse at 70% 80%, rgba(147, 51, 234, 0.1), transparent 60%),
        #faf9f5;
    }

    .page--end__inner h2 {
      margin: 0 0 12px;
      font-size: 28px;
      color: #111827;
    }

    .page--end .muted {
      color: #6b7280;
      font-size: 13px;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .progress {
      width: min(960px, 95vw);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress__bar {
      flex: 1; height: 6px;
      background: rgba(255,255,255,0.08);
      border-radius: 3px; overflow: hidden;
    }

    .progress__fill {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6, #ec4899);
      transition: width 0.5s ease;
    }

    .progress__label {
      font-size: 12px; color: #94a3b8;
      font-variant-numeric: tabular-nums;
      min-width: 90px; text-align: right;
    }

    @media (max-width: 720px) {
      .book { aspect-ratio: 4 / 5; }
      .sheet { width: 100%; }
      .book__spine { display: none; }
      .page { padding: 22px 20px 40px; }
      .page--heading__title { font-size: 24px; }
      .page--cover__title { font-size: 24px; }
      .toolbar__title { font-size: 13px; }
    }
  `],
})
export class ThreeDBookComponent implements OnInit, AfterViewInit {
  @Input() lectures: Lecture[] = [];
  @Input() bookTitle: string = 'Lecture Materials';

  @Output() pageChanged = new EventEmitter<number>();
  @Output() bookCompleted = new EventEmitter<void>();

  sheets: Sheet[] = [];
  currentIndex = 0;          // Number of flipped sheets (0..sheets.length)
  flippingIndex: number | null = null;

  private readonly flipDurationMs = 800;
  private isAnimating = false;
  private completedOnce = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buildSheets();
  }

  ngAfterViewInit(): void {
    this.cdr.markForCheck();
  }

  get currentLabel(): string {
    const total = this.lectures.length;
    if (this.currentIndex === 0) return `Cover`;
    if (this.currentIndex > total) return `The End`;
    return `Lecture ${this.currentIndex} / ${total}`;
  }

  get progressPercent(): number {
    if (this.sheets.length === 0) return 0;
    return (this.currentIndex / this.sheets.length) * 100;
  }

  getZIndex(i: number): number {
    const total = this.sheets.length;
    if (i === this.flippingIndex) return total * 2 + 10;
    if (i < this.currentIndex) return total + i; // flipped (left stack, later-flipped on top)
    return total - i;                             // unflipped (right stack, earlier on top)
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
    this.cdr.markForCheck();
  }

  goLast(): void {
    if (this.isAnimating || this.currentIndex >= this.sheets.length) return;
    this.currentIndex = this.sheets.length;
    this.emitPageChanged();
    this.checkCompletion();
    this.cdr.markForCheck();
  }

  private animateTo(target: number): void {
    const forward = target > this.currentIndex;
    this.flippingIndex = forward ? this.currentIndex : target;
    this.isAnimating = true;
    this.cdr.markForCheck();

    requestAnimationFrame(() => {
      this.currentIndex = target;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.flippingIndex = null;
        this.isAnimating = false;
        this.emitPageChanged();
        this.checkCompletion();
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

    const sheets: Sheet[] = [];

    // Sheet 0: cover front, first heading back
    sheets.push({
      index: 0,
      front: cover,
      back: headings[0] ?? end,
    });

    // Sheets 1..N: front = content_k, back = heading_{k+1} (or end)
    for (let k = 0; k < sorted.length; k++) {
      sheets.push({
        index: k + 1,
        front: contents[k],
        back: headings[k + 1] ?? end,
      });
    }

    // Pad last sheet so 'end' page sits alone cleanly
    if (sheets.length > 0 && sheets[sheets.length - 1].back.kind !== 'end') {
      sheets.push({
        index: sheets.length,
        front: blank,
        back: end,
      });
    }

    this.sheets = sheets;
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
  }
}
