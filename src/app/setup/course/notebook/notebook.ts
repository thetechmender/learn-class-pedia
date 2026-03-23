import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-notebook',
  imports: [],
  templateUrl: './notebook.html',
  styleUrl: './notebook.sass',
})
export class Notebook {
  isAddingNote = signal(false);
  noteText = signal('');
  
  savedNotes = signal<Array<{
    id: number;
    timestamp: string;
    transcript: string;
    userNote: string;
  }>>([
    {
      id: 1,
      timestamp: '0:07-0:15',
      transcript: 'Of the hundreds of millions of people who use Chat GPT each week, teachers are some of our earliest and most active adopters',
      userNote: 'looks good thanks'
    }
  ]);

  onSaveNote() {
    this.isAddingNote.set(true);
  }

  onCancelNote() {
    this.isAddingNote.set(false);
    this.noteText.set('');
  }

  onSaveNoteConfirm() {
    if (this.noteText()) {
      const newNote = {
        id: Date.now(),
        timestamp: '0:07-0:15',
        transcript: 'Of the hundreds of millions of people who use Chat GPT each week, teachers are some of our earliest and most active adopters',
        userNote: this.noteText()
      };
      this.savedNotes.update(notes => [...notes, newNote]);
    }
    this.isAddingNote.set(false);
    this.noteText.set('');
  }

  onDeleteNote(id: number) {
    this.savedNotes.update(notes => notes.filter(n => n.id !== id));
  }
}
