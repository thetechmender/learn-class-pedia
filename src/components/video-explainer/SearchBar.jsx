import { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';

export default function SearchBar({ slides, onNavigateToSlide, currentSlide }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = [];

        slides.forEach((slide, index) => {
            const titleMatch = slide.title?.toLowerCase().includes(query);
            const contentMatch = slide.content?.toLowerCase().includes(query);

            if (titleMatch || contentMatch) {
                // Find the matching text snippet
                let snippet = '';
                if (contentMatch) {
                    const content = slide.content.toLowerCase();
                    const matchIndex = content.indexOf(query);
                    const start = Math.max(0, matchIndex - 40);
                    const end = Math.min(content.length, matchIndex + query.length + 40);
                    snippet = slide.content.substring(start, end);
                    if (start > 0) snippet = '...' + snippet;
                    if (end < content.length) snippet = snippet + '...';
                }

                results.push({
                    slideIndex: index,
                    title: slide.title,
                    snippet: snippet || slide.content.substring(0, 80) + '...',
                    type: slide.type
                });
            }
        });

        setSearchResults(results);
    }, [searchQuery, slides]);

    const handleSelectResult = (slideIndex) => {
        onNavigateToSlide(slideIndex);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchQuery('');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white/90 transition-all text-sm border border-white/10"
                title="Search in lecture (Ctrl+F)"
            >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 pt-20">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700">
                {/* Search Input */}
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-white/60" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search in lecture content..."
                            className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-lg"
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setSearchQuery('');
                            }}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                    {searchQuery.trim().length < 2 ? (
                        <div className="p-8 text-center text-white/50">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Type at least 2 characters to search</p>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="p-8 text-center text-white/50">
                            <p className="text-sm">No results found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectResult(result.slideIndex)}
                                    className={`w-full text-left p-4 rounded-lg transition-all mb-2 ${
                                        result.slideIndex === currentSlide
                                            ? 'bg-blue-500/20 border border-blue-500/50'
                                            : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded">
                                                    Slide {result.slideIndex + 1}
                                                </span>
                                                {result.slideIndex === currentSlide && (
                                                    <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-white font-medium text-sm mb-1 truncate">
                                                {result.title}
                                            </h4>
                                            <p className="text-white/60 text-xs line-clamp-2">
                                                {result.snippet}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/40 flex-shrink-0 mt-1" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-700 bg-slate-900/50">
                    <p className="text-xs text-white/40 text-center">
                        {searchResults.length > 0 && `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found • `}
                        Press ESC to close
                    </p>
                </div>
            </div>
        </div>
    );
}
