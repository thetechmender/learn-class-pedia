import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { SpeechService } from '../../../services/speech.service';

@Component({
  selector: 'app-notebook',
  imports: [],
  templateUrl: './notebook.html',
  styleUrl: './notebook.sass',
})
export class Notebook implements OnInit {
  @Input() orderPayload: any = null;
  @Input() videoTimeSeconds: number = 0;
  deletingNoteId = signal<number | null>(null);

  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private speechService = inject(SpeechService);

  isAddingNote = signal(false);
  isSaving = signal(false);
  noteText = signal('');
  savedNotes = signal<any[]>([]);

  ngOnInit() {
    this.fetchNotes();
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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
