import { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export default function KeyboardShortcuts({ onAction }) {
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e) => {
            // Don't trigger shortcuts if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    onAction('togglePlay');
                    break;
                case 'arrowright':
                case 'l':
                    e.preventDefault();
                    onAction('nextSlide');
                    break;
                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    onAction('prevSlide');
                    break;
                case 'm':
                    e.preventDefault();
                    onAction('toggleMute');
                    break;
                case 'f':
                    e.preventDefault();
                    onAction('toggleFullscreen');
                    break;
                case 'b':
                    e.preventDefault();
                    onAction('toggleBookmark');
                    break;
                case 'n':
                    e.preventDefault();
                    onAction('addNote');
                    break;
                case 'c':
                    e.preventDefault();
                    onAction('toggleChat');
                    break;
                case 's':
                    e.preventDefault();
                    onAction('toggleStats');
                    break;
                case '?':
                    e.preventDefault();
                    setShowHelp(!showHelp);
                    break;
                case 'escape':
                    setShowHelp(false);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onAction, showHelp]);

    return (
        <>
            {/* Help Button */}
            <button
                onClick={() => setShowHelp(!showHelp)}
                className="fixed bottom-20 left-6 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-full shadow-lg transition-all z-40"
                title="Keyboard Shortcuts (Press ?)"
            >
                <Keyboard className="w-5 h-5" />
            </button>

            {/* Shortcuts Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Keyboard className="w-6 h-6 text-white" />
                                <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                            </div>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Playback Controls */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Playback Controls
                                </h3>
                                <div className="space-y-2">
                                    <ShortcutItem keys={['Space', 'K']} description="Play / Pause" />
                                    <ShortcutItem keys={['→', 'L']} description="Next Slide" />
                                    <ShortcutItem keys={['←', 'J']} description="Previous Slide" />
                                    <ShortcutItem keys={['M']} description="Mute / Unmute" />
                                </div>
                            </div>

                            {/* Learning Tools */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Learning Tools
                                </h3>
                                <div className="space-y-2">
                                    <ShortcutItem keys={['B']} description="Toggle Bookmark" />
                                    <ShortcutItem keys={['N']} description="Add Note" />
                                    <ShortcutItem keys={['C']} description="Toggle Chat" />
                                    <ShortcutItem keys={['S']} description="Toggle Statistics" />
                                </div>
                            </div>

                            {/* View Controls */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    View Controls
                                </h3>
                                <div className="space-y-2">
                                    <ShortcutItem keys={['F']} description="Toggle Fullscreen" />
                                    <ShortcutItem keys={['?']} description="Show/Hide Shortcuts" />
                                    <ShortcutItem keys={['Esc']} description="Close Modals" />
                                </div>
                            </div>

                            {/* Pro Tips */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 Pro Tips</h3>
                                <ul className="text-sm text-white/70 space-y-1">
                                    <li>• Use keyboard shortcuts for faster navigation</li>
                                    <li>• Bookmark important slides for quick review</li>
                                    <li>• Take notes during lectures to improve retention</li>
                                    <li>• Ask the AI assistant if you need clarification</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function ShortcutItem({ keys, description }) {
    return (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
            <span className="text-white/80 text-sm">{description}</span>
            <div className="flex gap-2">
                {keys.map((key, index) => (
                    <span key={index}>
                        <kbd className="px-3 py-1 bg-slate-700 text-white text-xs font-semibold rounded border border-slate-600 shadow-sm">
                            {key}
                        </kbd>
                        {index < keys.length - 1 && (
                            <span className="text-white/40 mx-1">or</span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}
