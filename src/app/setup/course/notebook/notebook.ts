import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { SpeechService } from '../../../services/speech.service';

@Component({
  selector: 'app-notebook',
  imports: [],
  templateUrl: './notebook.html',
  styleUrl: './notebook.sass',
})
export class Notebook implements OnInit, OnChanges {
  @Input() orderPayload: any = null;
  @Input() videoTimeSeconds: number = 0;
  @Output() notePlaying = new EventEmitter<void>();
  deletingNoteId = signal<number | null>(null);

  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private speechService = inject(SpeechService);

  isAddingNote = signal(false);
  isSaving = signal(false);
  noteText = signal('');
  savedNotes = signal<any[]>([]);

  private lastShortCourseId: number | null = null;

  ngOnInit() {
    this.fetchNotes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orderPayload'] && !changes['orderPayload'].firstChange) {
      const newId = this.orderPayload?.shortCourseId;
      if (newId && newId !== this.lastShortCourseId) {
        this.lastShortCourseId = newId;
        this.isAddingNote.set(false);
        this.noteText.set('');
        this.fetchNotes();
      }
    }
  }

  fetchNotes() {
    const p = this.orderPayload;
    if (!p?.shortCourseId) return;
    const token = this.authService.getToken();
    this.courseService.getNotebooks(p.shortCourseId, p.courseCertificateId, p.professionalCertificateId, token).subscribe({
      next: (res: any) => {
        const data = res?.isSuccess !== undefined ? res.data : res;
        this.savedNotes.set(Array.isArray(data?.notes) ? data.notes : []);
      },
      error: (err: any) => console.error('Fetch Notes Error:', err)
    });
  }

  onSaveNote() {
    this.isAddingNote.set(true);
  }

  onCancelNote() {
    this.isAddingNote.set(false);
    this.noteText.set('');
  }

  onSaveNoteConfirm() {
    if (!this.noteText() || !this.orderPayload?.shortCourseId) return;
    this.isSaving.set(true);
    const token = this.authService.getToken();
    const payload = {
      shortCourseId: this.orderPayload.shortCourseId,
      courseCertificateId: this.orderPayload.courseCertificateId || null,
      professionalCertificateId: this.orderPayload.professionalCertificateId || null,
      videoTimeSeconds: Math.floor(this.videoTimeSeconds),
      noteText: this.noteText()
    };
    this.courseService.saveNotebook(payload, token).subscribe({
      next: (res: any) => {
        this.isSaving.set(false);
        this.isAddingNote.set(false);
        this.noteText.set('');
        this.fetchNotes();
      },
      error: (err: any) => {
        console.error('Save Note Error:', err);
        this.isSaving.set(false);
      }
    });
  }

  onNoteClick(seconds: number) {
    if (this.speechService.totalDuration() > 0) {
      this.speechService.seekToTime(seconds);
      this.notePlaying.emit();
    }
  }

  onDeleteNote(id: number) {
    const token = this.authService.getToken();
    this.deletingNoteId.set(id);
    this.courseService.deleteNotebook(id, token).subscribe({
      next: () => {
        this.savedNotes.update(notes => notes.filter(n => n.id !== id));
        this.deletingNoteId.set(null);
      },
      error: (err: any) => {
        console.error('Delete Note Error:', err)
           this.deletingNoteId.set(null);
      }

    });
  }

  exportNotesPdf() {
    const notes = this.savedNotes();
    if (notes.length === 0) return;

    let content = '<html><head><style>';
    content += 'body { font-family: Poppins, sans-serif; padding: 40px; color: #1a1a2e; }';
    content += 'h1 { font-size: 22px; margin-bottom: 20px; color: #0062CC; }';
    content += '.note { border-bottom: 1px solid #e5e7eb; padding: 12px 0; }';
    content += '.time { color: #0062CC; font-size: 13px; font-weight: 600; }';
    content += '.text { font-size: 14px; color: #374151; margin-top: 4px; }';
    content += '</style></head><body>';
    content += '<h1>Course Notes</h1>';

    notes.forEach((note: any) => {
      content += '<div class="note">';
      content += `<div class="time">${this.formatTime(note.videoTimeSeconds || 0)}</div>`;
      content += `<div class="text">${note.noteText}</div>`;
      content += '</div>';
    });

    content += '</body></html>';

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'course-notes.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
