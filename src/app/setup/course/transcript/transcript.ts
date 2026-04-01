import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transcript.html',
  styleUrl: './transcript.sass',
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

  getHeadingFromContent(content: string): string {
    if (!content) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const h2 = tempDiv.querySelector('h2');
    return h2?.textContent?.trim() || '';
  }

  getContentText(content: string): string {
    if (!content) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Extract only <p> elements, skip h2 since it's shown as subheading above
    const paragraphs = tempDiv.querySelectorAll('p');
    let result = '';
    paragraphs.forEach((p, index) => {
      const text = (p.textContent || '').trim();
      if (text) {
        result += text + (index < paragraphs.length - 1 ? '\n\n' : '');
      }
    });
    
    // Fallback if no <p> elements found
    if (!result) {
      result = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    return result.trim();
  }
}
