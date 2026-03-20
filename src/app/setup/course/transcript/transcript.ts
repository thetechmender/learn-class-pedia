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

  get transcriptLines() {
    const section = this.activeSection;
    if (!section?.content) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = section.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const wordsPerMinute = 150;
    let currentTime = 0;
    
    return sentences.map((sentence, index) => {
      const wordCount = sentence.split(/\s+/).filter(w => w.length > 0).length;
      const duration = (wordCount / wordsPerMinute) * 60;
      const startTime = currentTime;
      currentTime += duration;
      
      return {
        time: this.formatTime(startTime),
        text: sentence.trim(),
        index
      };
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
