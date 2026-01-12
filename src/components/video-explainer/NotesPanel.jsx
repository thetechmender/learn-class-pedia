import { useState } from 'react';
import { FileText, Download, Trash2, Edit2, Save, X, Calendar, Clock } from 'lucide-react';

export default function NotesPanel({ notes, onAddNote, onDeleteNote, onEditNote, currentSlide }) {
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editText, setEditText] = useState('');

    const allNotes = Object.entries(notes).flatMap(([slideNum, slideNotes]) =>
        slideNotes.map(note => ({ ...note, slideNumber: parseInt(slideNum) }))
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const handleExportNotes = () => {
        const notesText = allNotes.map(note => {
            const date = new Date(note.timestamp).toLocaleString();
            return `[Slide ${note.slideNumber}] - ${date}\n${note.text}\n\n`;
        }).join('---\n\n');

        const blob = new Blob([notesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lecture-notes-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const startEdit = (note) => {
        setEditingNoteId(note.timestamp);
        setEditText(note.text);
    };

    const saveEdit = (slideNumber, timestamp) => {
        if (editText.trim()) {
            onEditNote(slideNumber, timestamp, editText);
            setEditingNoteId(null);
            setEditText('');
        }
    };

    const cancelEdit = () => {
        setEditingNoteId(null);
        setEditText('');
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/50 rounded-xl border border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-white">My Notes</h3>
                    </div>
                    <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                        {allNotes.length} {allNotes.length === 1 ? 'note' : 'notes'}
                    </span>
                </div>
                <button
                    onClick={handleExportNotes}
                    disabled={allNotes.length === 0}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export All Notes
                </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {allNotes.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 text-sm">No notes yet</p>
                        <p className="text-white/30 text-xs mt-1">Press 'N' to add a note</p>
                    </div>
                ) : (
                    allNotes.map((note) => (
                        <div
                            key={note.timestamp}
                            className={`p-3 rounded-lg border transition-all ${
                                note.slideNumber === currentSlide
                                    ? 'bg-purple-500/20 border-purple-500/50'
                                    : 'bg-slate-800/50 border-white/10 hover:border-white/20'
                            }`}
                        >
                            {/* Note Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                    <span className="bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">
                                        Slide {note.slideNumber}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(note.timestamp).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {editingNoteId === note.timestamp ? (
                                        <>
                                            <button
                                                onClick={() => saveEdit(note.slideNumber, note.timestamp)}
                                                className="text-green-400 hover:text-green-300 p-1"
                                                title="Save"
                                            >
                                                <Save className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="text-white/60 hover:text-white p-1"
                                                title="Cancel"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(note)}
                                                className="text-blue-400 hover:text-blue-300 p-1"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteNote(note.slideNumber, note.timestamp)}
                                                className="text-red-400 hover:text-red-300 p-1"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Note Content */}
                            {editingNoteId === note.timestamp ? (
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full bg-slate-700 text-white text-sm p-2 rounded border border-white/20 focus:outline-none focus:border-purple-500 resize-none"
                                    rows={3}
                                    autoFocus
                                />
                            ) : (
                                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                                    {note.text}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Quick Add Note */}
            <div className="p-4 border-t border-white/10 bg-slate-900/80">
                <button
                    onClick={() => onAddNote(currentSlide)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                >
                    <FileText className="w-4 h-4" />
                    Add Note for Current Slide
                </button>
            </div>
        </div>
    );
}
