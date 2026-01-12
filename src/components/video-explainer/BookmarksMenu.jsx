import { X, Bookmark, Clock } from 'lucide-react';

export default function BookmarksMenu({ bookmarks, slides, onJumpToBookmark, onRemoveBookmark, onClose }) {
    if (bookmarks.length === 0) {
        return (
            <div className="absolute bottom-full right-0 mb-2 w-72 bg-black/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Bookmarks</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">No bookmarks yet</p>
                    <p className="text-white/30 text-xs mt-1">Press 'B' to bookmark slides</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute bottom-full right-0 mb-2 w-80 max-h-96 bg-black/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-white">Bookmarks ({bookmarks.length})</h3>
                </div>
                <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="overflow-y-auto max-h-80 custom-scrollbar">
                {bookmarks.map((slideIndex, index) => {
                    const slide = slides[slideIndex];
                    return (
                        <div
                            key={index}
                            className="group flex items-center justify-between p-3 hover:bg-white/5 border-b border-white/5 transition-colors cursor-pointer"
                            onClick={() => onJumpToBookmark(slideIndex)}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-medium">
                                        Slide {slideIndex + 1}
                                    </span>
                                </div>
                                <p className="text-sm text-white/90 truncate">
                                    {slide?.title || 'Untitled Slide'}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveBookmark(slideIndex);
                                }}
                                className="ml-2 p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Remove bookmark"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5">
                <p className="text-xs text-white/50 text-center">
                    Click to jump to bookmarked slide
                </p>
            </div>
        </div>
    );
}
