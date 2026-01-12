import { BarChart3, Bookmark, Lightbulb } from 'lucide-react';
import Avatar from '../Avatar';

export default function AvatarSection({ 
    isAudioPlaying, 
    bookmarks, 
    currentSlide,
    showProgressChart,
    onToggleStats,
    onToggleBookmark,
    onSaveNote
}) {
    return (
        <div className="w-1/5 flex flex-col items-center justify-between p-4">
            {/* Avatar */}
            <div className="relative">
                <div className={`absolute w-32 h-32 rounded-full transition-all duration-500 ${isAudioPlaying ? 'bg-blue-500/40 scale-110 animate-pulse' : 'bg-blue-500/10'
                    }`} style={{ filter: 'blur(30px)' }}></div>

                <div className="relative">
                    <div className={`relative transition-all duration-300 ${isAudioPlaying ? 'scale-105' : ''}`}>
                        <div className={`absolute -inset-1.5 rounded-full transition-all ${isAudioPlaying ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-spin-slow opacity-70'
                            : 'bg-gray-600/50'
                            }`} style={{ animationDuration: '3s' }}></div>

                        <Avatar type="video" isTalking={isAudioPlaying}
                            className="relative w-20 h-20 rounded-full border-2 border-white/20 shadow-xl" />
                    </div>

                    <div className="mt-2 text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                            <p className="text-white text-xs">Instructor</p>
                        </div>
                    </div>

                    {isAudioPlaying && (
                        <div className="mt-2 flex items-center justify-center space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-0.5 bg-cyan-400 rounded-full animate-bounce"
                                    style={{ height: `${6 + Math.random() * 6}px`, animationDelay: `${i * 100}ms` }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Controls */}
            <div className="w-full space-y-3">
                <button
                    onClick={onToggleStats}
                    className="w-full bg-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">Stats</span>
                </button>

                <button
                    onClick={onToggleBookmark}
                    className={`w-full p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${bookmarks.includes(currentSlide)
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                        }`}
                >
                    <Bookmark className="w-4 h-4" />
                    <span className="text-xs">Bookmark</span>
                </button>

                <button
                    onClick={onSaveNote}
                    className="w-full bg-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-xs">Add Note</span>
                </button>
            </div>
        </div>
    );
}
