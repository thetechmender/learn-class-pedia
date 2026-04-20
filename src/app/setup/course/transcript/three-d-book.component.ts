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

type PageKind = 'cover' | 'index' | 'heading' | 'content' | 'end' | 'blank';

export interface IndexEntry {
  chapter: number;
  title: string;
  subtitle?: string;
  targetIndex: number;
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

  private readonly flipDurationMs = 850;
  private readonly dragCommitThreshold = 90; // degrees
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
    return `Lecture ${this.currentIndex} of ${total}`;
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
    this.cdr.markForCheck();
  }

  goLast(): void {
    if (this.isAnimating || this.currentIndex >= this.sheets.length) return;
    this.currentIndex = this.sheets.length;
    this.emitPageChanged();
    this.checkCompletion();
    this.cdr.markForCheck();
  }

  goTo(target: number): void {
    const clamped = Math.max(0, Math.min(this.sheets.length, target));
    if (this.isAnimating || clamped === this.currentIndex) return;
    this.currentIndex = clamped;
    this.emitPageChanged();
    this.checkCompletion();
    this.cdr.markForCheck();
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

    try { container.setPointerCapture(ev.pointerId); } catch {}
    ev.preventDefault();
    this.cdr.markForCheck();
  }

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragging || this.dragPointerId !== ev.pointerId) return;

    const deltaX = ev.clientX - this.dragStartX;
    const ratio = Math.max(-1, Math.min(1, deltaX / this.dragHalfWidth));
    const sweep = ratio * 180;

    if (this.dragDirection === 'forward') {
      // 0 -> -180, only leftward motion counts
      this.dragRotation = Math.max(-180, Math.min(0, sweep));
    } else {
      // -180 -> 0, only rightward motion counts
      this.dragRotation = Math.max(-180, Math.min(0, -180 + sweep));
    }
    this.cdr.markForCheck();
  }

  onPointerUp(ev: PointerEvent): void {
    if (!this.dragging || this.dragPointerId !== ev.pointerId) return;

    const container = ev.currentTarget as HTMLElement;
    try { container.releasePointerCapture(ev.pointerId); } catch {}

    const commit = Math.abs(this.dragRotation) >= this.dragCommitThreshold
      && Math.abs(this.dragRotation) <= 180 - this.dragCommitThreshold + 180; // always true upper
    const shouldCommit =
      this.dragDirection === 'forward'
        ? this.dragRotation <= -this.dragCommitThreshold
        : this.dragRotation >= -180 + this.dragCommitThreshold;

    // Release drag visuals; let CSS transition animate to final state
    this.dragging = false;
    this.dragPointerId = null;
    this.cdr.markForCheck();

    if (shouldCommit) {
      // Move currentIndex so class-based final state matches; clear inline transform next frame
      if (this.dragDirection === 'forward') {
        this.currentIndex = Math.min(this.sheets.length, this.currentIndex + 1);
      } else {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
      }
      this.flippingIndex = this.dragSheetIdx;
      this.emitPageChanged();
    } else {
      // Revert: keep flippingIndex to get shadow, then clear
      this.flippingIndex = this.dragSheetIdx;
    }

    // Clear inline transform so CSS class takes over with transition
    const idx = this.dragSheetIdx;
    this.dragSheetIdx = null;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.flippingIndex = null;
      this.checkCompletion();
      this.cdr.markForCheck();
    }, this.flipDurationMs);

    // Suppress unused var lint
    void idx; void commit;
  }

  onPointerCancel(ev: PointerEvent): void {
    if (!this.dragging) return;
    this.onPointerUp(ev);
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

    // Index entries: chapter k (1-indexed) is reached when currentIndex = k + 1
    // given the sheet layout below.
    const entries: IndexEntry[] = sorted.map((lec, i) => {
      const { title } = this.extractTitleAndContent(lec);
      return {
        chapter: i + 1,
        title,
        subtitle: lec.sectionType,
        targetIndex: i + 2,
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
