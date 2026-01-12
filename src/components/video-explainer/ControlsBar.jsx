import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Maximize2, Minimize2, RotateCcw, Share2, Settings, Clock,
    Bookmark, BookmarkCheck, Download, Expand, Eye, EyeOff,
    Airplay, PictureInPicture, Repeat, Repeat1, 
    Scissors, Type, Shield, Mic, MicOff
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import PlaybackSpeedControl from './PlaybackSpeedControl';
import BookmarksMenu from './BookmarksMenu';

export default function ControlsBar({ 
    isPlaying,
    currentSlide,
    totalSlides,
    isMuted,
    isAudioPlaying,
    speechProgress,
    overallProgress,
    timeSpent,
    slides,
    bookmarks,
    playbackRate,
    onPlayPause,
    onPrevSlide,
    onNextSlide,
    onReset,
    onToggleMute,
    onProgressClick,
    onSpeedChange,
    formatTime,
    onAddBookmark,
    onRemoveBookmark,
    onJumpToSlide,
    onToggleSubtitles,
    onTogglePictureInPicture,
    onToggleFullscreen,
    onToggleRepeat,
    isFullscreen,
    areSubtitlesEnabled,
    isRepeating,
    isPictureInPicture,
    onDownload,
    onShare,
    onSettings,
    onAirplay,
    onClip,
    onTranscript,
    onAudioOnly
}) {
    const [showBookmarksMenu, setShowBookmarksMenu] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(100);
    const [showTimeTooltip, setShowTimeTooltip] = useState(false);
    const [tooltipTime, setTooltipTime] = useState(0);
    const [tooltipPosition, setTooltipPosition] = useState(0);
    const progressBarRef = useRef(null);
    const volumeSliderRef = useRef(null);
    const bookmarksButtonRef = useRef(null);

    const currentSlideHasBookmark = bookmarks.includes(currentSlide);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (volumeSliderRef.current && !volumeSliderRef.current.contains(event.target)) {
                setShowVolumeSlider(false);
            }
            if (bookmarksButtonRef.current && !bookmarksButtonRef.current.contains(event.target)) {
                setShowBookmarksMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProgressMouseMove = (e) => {
        if (!progressBarRef.current) return;
        
        const rect = progressBarRef.current.getBoundingClientRect();
        const position = ((e.clientX - rect.left) / rect.width) * 100;
        const clampedPosition = Math.max(0, Math.min(100, position));
        
        setTooltipTime((timeSpent / overallProgress) * clampedPosition);
        setTooltipPosition(clampedPosition);
        setShowTimeTooltip(true);
    };

    const handleProgressMouseLeave = () => {
        setShowTimeTooltip(false);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolumeLevel(newVolume);
        // You would typically call a prop function here to change actual volume
        // onVolumeChange(newVolume / 100);
    };

    const handleBookmarkToggle = () => {
        if (currentSlideHasBookmark) {
            onRemoveBookmark(currentSlide);
        } else {
            onAddBookmark(currentSlide);
        }
    };

    const handleJumpToBookmark = (slideIndex) => {
        onJumpToSlide(slideIndex);
        setShowBookmarksMenu(false);
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-16 pb-4 px-6 backdrop-blur-sm">
            {/* Enhanced Progress Bar with Preview */}
            <div className="mb-4 relative" 
                 ref={progressBarRef}
                 onMouseMove={handleProgressMouseMove}
                 onMouseLeave={handleProgressMouseLeave}>
                
                {/* Time Preview Tooltip */}
                {showTimeTooltip && (
                    <div 
                        className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded-md pointer-events-none z-50"
                        style={{ left: `${tooltipPosition}%`, transform: 'translateX(-50%)' }}
                    >
                        {formatTime(tooltipTime)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                    </div>
                )}

                {/* Main Progress Bar */}
                <div className="w-full h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden group relative hover:h-2.5 transition-all duration-200"
                    onClick={onProgressClick}>
                    
                    {/* Overall Progress */}
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full transition-all duration-300 shadow-lg"
                        style={{ width: `${overallProgress}%` }}
                    >
                        {/* Progress Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 blur-sm"></div>
                    </div>

                    {/* Current Position Indicator */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg ring-2 ring-cyan-400/50 cursor-pointer hover:scale-125 transition-transform"
                        style={{ left: `${overallProgress}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        <div className="absolute inset-0 bg-white animate-ping opacity-20"></div>
                    </div>

                    {/* Slide markers with hover effects */}
                    {slides.map((slide, index) => (
                        <div key={index}
                            className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ${index <= currentSlide ? 'bg-gradient-to-b from-cyan-300 to-blue-400 shadow-md' : 'bg-white/40'} 
                                ${bookmarks.includes(index) ? 'w-3 h-3 ring-2 ring-yellow-400 shadow-lg' : 'w-1.5 h-2.5'} 
                                rounded-full cursor-pointer hover:scale-150 hover:shadow-lg group/marker`}
                            style={{ left: `${(index / slides.length) * 100}%` }}
                            title={bookmarks.includes(index) ? `Bookmarked: Slide ${index + 1}` : `Slide ${index + 1}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onJumpToSlide(index);
                            }}
                        >
                            {/* Marker Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded-md opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                Slide {index + 1}
                                {bookmarks.includes(index) && ' ★'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Info Row */}
                <div className="flex justify-between mt-3 text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">Slide {currentSlide + 1}/{totalSlides}</span>
                            <button 
                                ref={bookmarksButtonRef}
                                onClick={handleBookmarkToggle}
                                className={`p-1.5 rounded-lg transition-all ${currentSlideHasBookmark 
                                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                                    : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                title={currentSlideHasBookmark ? 'Remove Bookmark' : 'Add Bookmark'}
                            >
                                {currentSlideHasBookmark ? 
                                    <BookmarkCheck className="w-4 h-4" /> : 
                                    <Bookmark className="w-4 h-4" />
                                }
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 text-white/70">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 animate-pulse"></div>
                            <span>{Math.round(overallProgress)}% complete</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {isAudioPlaying && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-full animate-pulse">
                                <div className="flex space-x-0.5">
                                    {[1, 2, 3, 2, 1].map((height, i) => (
                                        <div 
                                            key={i}
                                            className="w-0.5 bg-cyan-400 rounded-full animate-wave"
                                            style={{
                                                animationDelay: `${i * 0.1}s`,
                                                height: `${height * 4}px`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                                <span className="text-cyan-300 text-xs font-medium">
                                    {speechProgress}% audio
                                </span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-white/60">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{formatTime(timeSpent)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Control Buttons */}
            <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center space-x-1">
                    <button onClick={onReset}
                        className="group p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        title="Restart Course">
                        <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                    </button>

                    <button onClick={onPrevSlide} disabled={currentSlide === 0}
                        className="group p-3 text-white hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Previous Slide">
                        <SkipBack className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>

                    <button onClick={onPlayPause}
                        className={`group w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95
                            ${isPlaying 
                                ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600' 
                                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600'
                            }`}
                        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                        {isPlaying ? 
                            <Pause className="w-6 h-6 text-white fill-current group-hover:scale-110 transition-transform" /> : 
                            <Play className="w-6 h-6 text-white fill-current ml-0.5 group-hover:scale-110 transition-transform" />
                        }
                    </button>

                    <button onClick={onNextSlide} disabled={currentSlide === totalSlides - 1}
                        className="group p-3 text-white hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Next Slide">
                        <SkipForward className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Volume Control with Slider */}
                    <div className="relative" ref={volumeSliderRef}>
                        <button 
                            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            className={`group p-3 rounded-xl transition-all duration-200 ${isMuted 
                                ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                                : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                        >
                            {isMuted ? 
                                <VolumeX className="w-5 h-5 group-hover:scale-110 transition-transform" /> : 
                                <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            }
                        </button>
                        
                        {showVolumeSlider && (
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-3 bg-black/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10">
                                <div className="h-32 flex items-center">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={volumeLevel}
                                        onChange={handleVolumeChange}
                                        className="volume-slider"
                                        orient="vertical"
                                    />
                                </div>
                                <div className="text-center text-xs text-white/70 mt-2">
                                    {volumeLevel}%
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Controls - Playback Speed */}
                <div className="flex items-center space-x-2">
                    {isRepeating && (
                        <div className="text-xs text-purple-400 font-medium bg-purple-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <Repeat1 className="w-3 h-3" />
                            Repeating
                        </div>
                    )}
                    
                    <PlaybackSpeedControl
                        playbackRate={playbackRate}
                        onSpeedChange={onSpeedChange}
                    />
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-1">
                    <button onClick={onToggleSubtitles}
                        className={`p-3 rounded-xl transition-all duration-200 ${areSubtitlesEnabled 
                            ? 'text-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30' 
                            : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        title={areSubtitlesEnabled ? 'Hide Subtitles' : 'Show Subtitles'}>
                        {areSubtitlesEnabled ? 
                            <Eye className="w-5 h-5" /> : 
                            <EyeOff className="w-5 h-5" />
                        }
                    </button>

                    <button onClick={onToggleRepeat}
                        className={`p-3 rounded-xl transition-all duration-200 ${isRepeating 
                            ? 'text-purple-400 bg-purple-500/20 hover:bg-purple-500/30' 
                            : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        title={isRepeating ? 'Disable Repeat' : 'Repeat Current Slide'}>
                        {isRepeating ? 
                            <Repeat1 className="w-5 h-5" /> : 
                            <Repeat className="w-5 h-5" />
                        }
                    </button>

                    <button onClick={onTogglePictureInPicture}
                        className={`p-3 rounded-xl transition-all duration-200 ${isPictureInPicture 
                            ? 'text-green-400 bg-green-500/20 hover:bg-green-500/30' 
                            : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        title="Picture-in-Picture">
                        <PictureInPicture className="w-5 h-5" />
                    </button>

                    <button onClick={onClip}
                        className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        title="Create Clip">
                        <Scissors className="w-5 h-5" />
                    </button>

                    <button onClick={onTranscript}
                        className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        title="Show Transcript">
                        <Type className="w-5 h-5" />
                    </button>

                    <button onClick={onShare}
                        className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
                        title="Share Course">
                        <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>

                    <button onClick={onDownload}
                        className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        title="Download">
                        <Download className="w-5 h-5" />
                    </button>

                    <button onClick={onSettings}
                        className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
                        title="Settings">
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <button onClick={onToggleFullscreen}
                        className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}>
                        {isFullscreen ? 
                            <Minimize2 className="w-5 h-5" /> : 
                            <Maximize2 className="w-5 h-5" />
                        }
                    </button>
                </div>
            </div>

            {/* Additional Quick Actions Bar */}
            <div className="flex justify-center mt-4 space-x-3">
                <button onClick={onAudioOnly}
                    className="px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-1.5">
                    <Mic className="w-3 h-3" />
                    Audio Only
                </button>
                
                <button onClick={onAirplay}
                    className="px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-1.5">
                    <Airplay className="w-3 h-3" />
                    AirPlay
                </button>
                
                <button 
                    onClick={() => setShowBookmarksMenu(!showBookmarksMenu)}
                    className="px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-1.5 relative">
                    <BookmarkCheck className="w-3 h-3" />
                    Bookmarks ({bookmarks.length})
                    {showBookmarksMenu && (
                        <BookmarksMenu
                            bookmarks={bookmarks}
                            slides={slides}
                            onJumpToBookmark={handleJumpToBookmark}
                            onRemoveBookmark={onRemoveBookmark}
                            onClose={() => setShowBookmarksMenu(false)}
                        />
                    )}
                </button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-white/40 hidden group-hover:block">
                Space: Play/Pause • ←→: Navigate • F: Fullscreen • M: Mute
            </div>

            {/* CSS for vertical volume slider */}
            <style jsx>{`
                .volume-slider {
                    -webkit-appearance: slider-vertical;
                    width: 6px;
                    height: 80px;
                    background: linear-gradient(to top, #06b6d4, #3b82f6);
                    border-radius: 3px;
                    outline: none;
                }
                
                .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                }
                
                @keyframes wave {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(0.5); }
                }
                
                .animate-wave {
                    animation: wave 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}