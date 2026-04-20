import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from './safe-html.pipe';

@Component({
  selector: 'app-css-book-viewer',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  template: `
    <div class="book-container">
      <div class="book-controls">
        <button (click)="previousPage()" [disabled]="currentPage === 1" class="control-btn">
          ◀ Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="control-btn">
          Next ▶
        </button>
      </div>

      <div class="book">
        <div class="book__pages">
          @for (page of pages; track $index) {
            <div class="book__page" [class.book__page--active]="$index + 1 === currentPage">
              <div class="book__page-front">
                <div class="page-content">
                  <div class="page-header">
                    <h2>{{ page.title }}</h2>
                  </div>
                  <div class="page-body" [innerHTML]="page.content | safeHtml"></div>
                </div>
              </div>
              <div class="book__page-back">
                <div class="page-content">
                  <div class="page-header">
                    <h2>{{ pages[$index + 1]?.title || 'Back Cover' }}</h2>
                  </div>
                  <div class="page-body" [innerHTML]="pages[$index + 1]?.content | safeHtml"></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="book-progress">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="(currentPage / totalPages) * 100"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .book-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .book-controls {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      align-items: center;
      background: white;
      padding: 12px 24px;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .control-btn {
      padding: 8px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .control-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .control-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .book {
      position: relative;
      width: 900px;
      height: 600px;
      perspective: 1500px;
    }

    .book__pages {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .book__page {
      position: absolute;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: left center;
      animation: fadeIn 0.5s ease-out;
    }

    .book__page--active {
      transform: rotateY(-180deg);
    }

    .book__page-front,
    .book__page-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      overflow-y: auto;
    }

    .book__page-front {
      transform: rotateY(0deg);
    }

    .book__page-back {
      transform: rotateY(180deg);
      background: #fafafa;
    }

    .page-content {
      padding: 30px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .page-header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .page-body {
      flex: 1;
      line-height: 1.8;
      color: #444;
      font-size: 14px;
    }

    .page-body ::ng-deep h2 {
      font-size: 20px;
      color: #667eea;
      margin-top: 0;
    }

    .page-body ::ng-deep h3 {
      font-size: 18px;
      color: #764ba2;
      margin-top: 20px;
    }

    .page-body ::ng-deep ul,
    .page-body ::ng-deep ol {
      padding-left: 20px;
    }

    .page-body ::ng-deep li {
      margin: 8px 0;
    }

    .page-body ::ng-deep table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 13px;
    }

    .page-body ::ng-deep th,
    .page-body ::ng-deep td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    .page-body ::ng-deep th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }

    .book-progress {
      margin-top: 30px;
      width: 900px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
    }

    .progress-fill {
      height: 100%;
      background: white;
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    @media (max-width: 1000px) {
      .book, .book-progress {
        width: 95%;
      }

      .book {
        height: 500px;
      }

      .page-content {
        padding: 15px;
      }

      .page-header h2 {
        font-size: 18px;
      }

      .page-body {
        font-size: 12px;
        line-height: 1.6;
      }
    }

    .book__page-front::-webkit-scrollbar,
    .book__page-back::-webkit-scrollbar {
      width: 8px;
    }

    .book__page-front::-webkit-scrollbar-track,
    .book__page-back::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .book__page-front::-webkit-scrollbar-thumb,
    .book__page-back::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .book__page-front::-webkit-scrollbar-thumb:hover,
    .book__page-back::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class CssBookViewerComponent implements OnInit {
  @Input() lectures: any[] = [];

  pages: any[] = [];
  currentPage: number = 1;
  totalPages: number = 0;

  ngOnInit() {
    this.preparePages();
  }

  preparePages() {
    this.pages = this.lectures.map(lecture => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = lecture.content;
      const h2 = tempDiv.querySelector('h2');
      const title = h2?.textContent?.trim() || lecture.title || 'Untitled';

      if (h2) h2.remove();
      const content = tempDiv.innerHTML;

      return {
        title,
        content,
      };
    });

    this.totalPages = this.pages.length;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
