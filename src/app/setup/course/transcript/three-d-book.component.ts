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

  private readonly flipDurationMs = 850;
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

    sheets.push({
      index: 0,
      front: cover,
      back: headings[0] ?? end,
    });

    for (let k = 0; k < sorted.length; k++) {
      sheets.push({
        index: k + 1,
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
