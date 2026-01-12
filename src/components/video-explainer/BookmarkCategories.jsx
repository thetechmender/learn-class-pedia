import { useState } from 'react';
import { Bookmark, Tag, Plus, X, Edit2, Trash2 } from 'lucide-react';

export default function BookmarkCategories({ bookmarks, slides, onCategoryChange, onRemoveBookmark, onNavigate }) {
    const [categories, setCategories] = useState({
        'important': { name: 'Important', color: 'red', icon: '⭐' },
        'review': { name: 'Review Later', color: 'yellow', icon: '🔄' },
        'question': { name: 'Questions', color: 'blue', icon: '❓' },
        'key-concept': { name: 'Key Concepts', color: 'green', icon: '💡' }
    });

    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Group bookmarks by category
    const groupedBookmarks = bookmarks.reduce((acc, slideIndex) => {
        const category = bookmarks[slideIndex]?.category || 'uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(slideIndex);
        return acc;
    }, {});

    const getCategoryColor = (category) => {
        const colors = {
            'important': 'border-red-500/50 bg-red-500/10',
            'review': 'border-yellow-500/50 bg-yellow-500/10',
            'question': 'border-blue-500/50 bg-blue-500/10',
            'key-concept': 'border-green-500/50 bg-green-500/10',
            'uncategorized': 'border-white/20 bg-white/5'
        };
        return colors[category] || colors.uncategorized;
    };

    return (
        <div className="h-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-orange-400" />
                    <h3 className="font-semibold text-white">Bookmarks</h3>
                </div>
                <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                    {bookmarks.length}
                </span>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {bookmarks.length === 0 ? (
                    <div className="text-center py-12">
                        <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 text-sm">No bookmarks yet</p>
                        <p className="text-white/30 text-xs mt-1">Press 'B' to bookmark slides</p>
                    </div>
                ) : (
                    Object.entries(categories).map(([key, category]) => {
                        const categoryBookmarks = bookmarks.filter(b => 
                            (typeof b === 'object' ? b.category : 'uncategorized') === key
                        );
                        
                        if (categoryBookmarks.length === 0) return null;

                        return (
                            <div key={key} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{category.icon}</span>
                                    <h4 className="text-xs font-semibold text-white/80">{category.name}</h4>
                                    <span className="text-xs text-white/40">({categoryBookmarks.length})</span>
                                </div>
                                {categoryBookmarks.map((bookmark, index) => {
                                    const slideIndex = typeof bookmark === 'object' ? bookmark.slideIndex : bookmark;
                                    const slide = slides[slideIndex];
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => onNavigate(slideIndex)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02] ${getCategoryColor(key)}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded">
                                                            Slide {slideIndex + 1}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-white/90 font-medium truncate">
                                                        {slide?.title || 'Untitled Slide'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemoveBookmark(slideIndex);
                                                    }}
                                                    className="text-white/40 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(categories).slice(0, 4).map(([key, category]) => (
                        <button
                            key={key}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${getCategoryColor(key)} hover:scale-105`}
                        >
                            <span className="mr-1">{category.icon}</span>
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
