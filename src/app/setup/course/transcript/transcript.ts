import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeDBookComponent } from './three-d-book.component';

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [CommonModule, ThreeDBookComponent],
  template: `
    <div class="lecture-container">
      @if (lectures.length > 0) {
        <app-3d-book
          [lectures]="lectures"
          [bookTitle]="currentShortCourse?.title || 'Lecture Materials'">
        </app-3d-book>

        <div class="action-button">
          <button (click)="onButtonClick()" class="quiz-button">
            {{ courseTypeId == 3 ? 'Start Assessment' : 'Take Quiz' }}
          </button>
        </div>
      } @else {
        <div class="empty-state">
          <p>No lecture content available</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .lecture-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .action-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 1000;
    }

    .quiz-button {
      padding: 12px 32px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }

    .quiz-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: white;
      font-size: 18px;
    }
  `]
})
export class Transcript {
  @Input() currentShortCourse: any = null;
  @Input() courseTypeId: any = null;
  @Output() moveToQuiz = new EventEmitter<void>();
  @Output() startAssessment = new EventEmitter<void>();

  onButtonClick() {
    if (this.courseTypeId == 3) {
      this.startAssessment.emit();
    } else {
      this.moveToQuiz.emit();
    }
  }

  get lectures(): any[] {
    const sc = this.currentShortCourse;
    if (!sc?.lectures) return [];
    return sc.lectures;
  }
}
