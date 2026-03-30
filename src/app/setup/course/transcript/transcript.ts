import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transcript.html',
  styleUrl: './transcript.sass',
})
export class Transcript {
  private courseService = inject(CourseService);

  get activeSection() {
    return this.courseService.activeSection();
  }

  get transcriptParagraphs(): string[] {
    const section = this.activeSection;
    if (!section?.content) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = section.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';

    return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0).map(s => s.trim());
  }
}
