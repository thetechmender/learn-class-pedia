import { useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import SlideContent from './video-explainer/SlideContent';
import Avatar from './Avatar';
import { useVideoExplainer } from './video-explainer/useVideoExplainer';
import { useSlideProcessing } from './video-explainer/useSlideProcessing';
import { useTTS } from './video-explainer/useTTS';

export default function VideoCourseExplainerSimple({
    lessonText,
    audios = [],
    courseId = 1,
    lectureId,
    durationSeconds = 0,
    onWatchProgress
}) {
    // Custom hooks
    const videoState = useVideoExplainer(lessonText, audios);
    const { processLessonText } = useSlideProcessing(videoState.setSlides);

    // Process lesson text
    useEffect(() => {
        if (lessonText) {
            processLessonText(lessonText);
            videoState.setTimeSpent(0);
            lastSentAtRef.current = 0;
        }
    }, [lessonText]);

    const lastSentAtRef = useRef(0);
    const lastPositionRef = useRef(0);
    const timeSpentRef = useRef(0);

    // TTS Effect
    useTTS({
        isPlaying: videoState.isPlaying,
        isMuted: videoState.isMuted,
        useTTS: videoState.useTTS,
        slides: videoState.slides,
        currentSlide: videoState.currentSlide,
        voices: videoState.voices,
        selectedVoice: videoState.selectedVoice,
        playbackRate: videoState.playbackRate,
        setHighlightedCharIndex: videoState.setHighlightedCharIndex,
        setSpeechProgress: videoState.setSpeechProgress,
        setIsAudioPlaying: videoState.setIsAudioPlaying,
        setCurrentSlide: videoState.setCurrentSlide,
        setIsPlaying: videoState.setIsPlaying,
        markSlideCompleted: videoState.markSlideCompleted
    });

    // Audio playback effect
    useEffect(() => {
        const audio = videoState.audioRef.current;
        if (audio && videoState.audioStreamUrl && !videoState.useTTS) {
            audio.muted = videoState.isMuted;
            audio.playbackRate = videoState.playbackRate;
            if (videoState.isPlaying) {
                audio.play().then(() => videoState.setIsAudioPlaying(true)).catch(() => videoState.setIsAudioPlaying(false));
            } else {
                audio.pause();
                videoState.setIsAudioPlaying(false);
            }
        }
    }, [videoState.isPlaying, videoState.audioStreamUrl, videoState.useTTS, videoState.isMuted, videoState.playbackRate]);

    useEffect(() => {
        timeSpentRef.current = videoState.timeSpent;
    }, [videoState.timeSpent]);

    // Watch progress heartbeat (every 15s while playing)
    useEffect(() => {
        if (!videoState.isPlaying || !onWatchProgress || !lectureId) return undefined;

        lastPositionRef.current = timeSpentRef.current;

        const intervalId = setInterval(() => {
            const positionSeconds = timeSpentRef.current;
            const deltaSeconds = Math.max(0, positionSeconds - lastPositionRef.current);

            if (deltaSeconds === 0) return;

            lastPositionRef.current = positionSeconds;
            lastSentAtRef.current = positionSeconds;

            onWatchProgress({
                deltaSeconds: Math.min(60, deltaSeconds),
                durationSeconds,
                positionSeconds
            });
        }, 15000);

        return () => clearInterval(intervalId);
    }, [videoState.isPlaying, onWatchProgress, lectureId, durationSeconds]);

    // Flush progress when playback stops
    useEffect(() => {
        if (videoState.isPlaying || !onWatchProgress || !lectureId) return;

        const positionSeconds = timeSpentRef.current;
        const deltaSeconds = Math.max(0, positionSeconds - lastPositionRef.current);

        if (deltaSeconds > 0) {
            lastPositionRef.current = positionSeconds;
            onWatchProgress({
                deltaSeconds: Math.min(60, deltaSeconds),
                durationSeconds,
                positionSeconds
            });
        }
    }, [videoState.isPlaying, onWatchProgress, lectureId, durationSeconds]);

    // Flush progress on unmount or lecture change
    useEffect(() => {
        if (!onWatchProgress || !lectureId) return undefined;

        return () => {
            const positionSeconds = timeSpentRef.current;
            const deltaSeconds = Math.max(0, positionSeconds - lastPositionRef.current);

            if (deltaSeconds > 0) {
                lastPositionRef.current = positionSeconds;
                onWatchProgress({
                    deltaSeconds: Math.min(60, deltaSeconds),
                    durationSeconds,
                    positionSeconds
                });
            }
        };
    }, [lectureId, onWatchProgress, durationSeconds]);

    // Event Handlers
    const handlePlayPause = () => {
        if (!videoState.hasStarted) videoState.setHasStarted(true);
        if (videoState.isPlaying) {
            videoState.setIsPlaying(false);
            window.speechSynthesis.cancel();
            videoState.setIsAudioPlaying(false);
        } else {
            videoState.setSpeechProgress(0);
            videoState.setIsPlaying(true);
            videoState.markSlideCompleted(videoState.currentSlide);
        }
    };

    const handleSlideChange = (direction) => {
        window.speechSynthesis.cancel();
        videoState.setHighlightedCharIndex(-1);
        videoState.setSpeechProgress(0);
        if (direction === 'next' && videoState.currentSlide < videoState.slides.length - 1) {
            videoState.setCurrentSlide(videoState.currentSlide + 1);
            videoState.markSlideCompleted(videoState.currentSlide + 1);
        } else if (direction === 'prev' && videoState.currentSlide > 0) {
            videoState.setCurrentSlide(videoState.currentSlide - 1);
        }
    };

    const handleProgressClick = (e) => {
        window.speechSynthesis.cancel();
        videoState.setHighlightedCharIndex(-1);
        videoState.setSpeechProgress(0);
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        videoState.setCurrentSlide(Math.min(Math.max(0, Math.floor(pct * videoState.slides.length)), videoState.slides.length - 1));
    };

    // Progress calculation
    const slideProgress = videoState.slides.length > 0 ? (videoState.currentSlide / videoState.slides.length) * 100 : 0;
    const currentSlideContribution = videoState.slides.length > 0 ? (videoState.speechProgress / 100) * (100 / videoState.slides.length) : 0;
    const overallProgress = slideProgress + currentSlideContribution;

    return (
        <div className="w-full h-full bg-slate-950 overflow-hidden relative flex flex-col">
            <audio ref={videoState.audioRef} src={videoState.audioStreamUrl} className="hidden" />

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-80 h-80 bg-purple-500/40 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/40 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Content Display */}
                <div className="absolute inset-0 flex items-center justify-center p-6 pb-4">
                    <div className="w-full max-w-5xl h-full bg-slate-900 rounded-2xl border border-slate-700/50 p-8 overflow-auto shadow-2xl">
                        {videoState.slides.length > 0 ? (
                            <SlideContent
                                slide={videoState.slides[videoState.currentSlide]}
                                currentSlide={videoState.currentSlide}
                                highlightedCharIndex={videoState.highlightedCharIndex}
                                isPlaying={videoState.isPlaying}
                                useTTS={videoState.useTTS}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <Play className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400">Loading content...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Slide Navigation Arrows */}
                {videoState.slides.length > 1 && (
                    <>
                        <button
                            onClick={() => handleSlideChange('prev')}
                            disabled={videoState.currentSlide === 0}
                            className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                videoState.currentSlide === 0
                                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-800/80 hover:bg-slate-700 text-white'
                            }`}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => handleSlideChange('next')}
                            disabled={videoState.currentSlide === videoState.slides.length - 1}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                videoState.currentSlide === videoState.slides.length - 1
                                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-800/80 hover:bg-slate-700 text-white'
                            }`}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Slide Title */}
                {videoState.slides.length > 0 && videoState.slides[videoState.currentSlide] && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full max-w-md">
                        <span className="text-sm text-white font-medium truncate block">
                            {videoState.slides[videoState.currentSlide].title || `Section ${videoState.currentSlide + 1}`}
                        </span>
                    </div>
                )}

                {/* Avatar Video */}
                <div className="absolute bottom-20 right-6 z-30">
                    <div className="relative">
                        {/* Glow effect when speaking */}
                        <div className={`absolute -inset-2 rounded-2xl transition-all duration-500 ${
                            videoState.isAudioPlaying 
                                ? 'bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-cyan-500/40 blur-xl animate-pulse' 
                                : 'bg-slate-700/20 blur-md'
                        }`}></div>
                        
                        {/* Avatar container */}
                        <div className={`relative transition-all duration-300 ${videoState.isAudioPlaying ? 'scale-105' : ''}`}>
                            <Avatar 
                                type="video" 
                                isTalking={videoState.isAudioPlaying}
                                className="w-32 h-32 rounded-2xl shadow-2xl"
                            />
                            
                            {/* Label */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                <div className="bg-slate-900/90 backdrop-blur-sm rounded-full px-3 py-1 border border-slate-700/50">
                                    <p className="text-white text-xs font-medium">Instructor</p>
                                </div>
                            </div>
                            
                            {/* Audio wave indicator */}
                            {videoState.isAudioPlaying && (
                                <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
                                    {[...Array(4)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className="w-1 bg-cyan-400 rounded-full animate-pulse"
                                            style={{ 
                                                height: `${8 + Math.random() * 8}px`, 
                                                animationDelay: `${i * 100}ms`,
                                                animationDuration: '0.5s'
                                            }} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls - Simple inline bar */}
            <div className="flex-shrink-0 bg-slate-900 border-t border-slate-800 px-6 py-4">
                {/* Progress Bar */}
                <div className="mb-3">
                    <div 
                        className="w-full h-1.5 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
                        onClick={handleProgressClick}
                    >
                        <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500">{videoState.formatTime(videoState.timeSpent)}</span>
                        <span className="text-xs text-slate-500 truncate max-w-xs">
                            {videoState.slides[videoState.currentSlide]?.title || `Section ${videoState.currentSlide + 1}`} ({videoState.currentSlide + 1}/{videoState.slides.length})
                        </span>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={handlePlayPause}
                            className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-400 flex items-center justify-center transition-colors"
                        >
                            {videoState.isPlaying ? (
                                <span className="w-3 h-3 bg-white rounded-sm" />
                            ) : (
                                <Play className="w-4 h-4 text-white ml-0.5" />
                            )}
                        </button>

                        {/* Prev/Next */}
                        <button
                            onClick={() => handleSlideChange('prev')}
                            disabled={videoState.currentSlide === 0}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={() => handleSlideChange('next')}
                            disabled={videoState.currentSlide === videoState.slides.length - 1}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Speed Control */}
                    <div className="flex items-center gap-3">
                        <select
                            value={videoState.playbackRate}
                            onChange={(e) => videoState.setPlaybackRate(parseFloat(e.target.value))}
                            className="bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer"
                        >
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1">1x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                        </select>

                        {/* Voice Selector */}
                        <select
                            value={videoState.selectedVoice}
                            onChange={(e) => {
                                videoState.setSelectedVoice(e.target.value);
                                // Restart speech with new voice if playing
                                if (videoState.isPlaying) {
                                    window.speechSynthesis.cancel();
                                    videoState.setSpeechProgress(0);
                                }
                            }}
                            className="bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer max-w-[140px]"
                        >
                            <option value="">Auto Voice</option>
                            {videoState.voices
                                .filter(v => v.lang.includes('en'))
                                .slice(0, 6)
                                .map((voice, idx) => (
                                    <option key={idx} value={voice.name}>
                                        {voice.name.replace('Microsoft ', '').replace('Google ', '').substring(0, 20)}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>
            </div>

            {/* Start Overlay */}
            {!videoState.hasStarted && videoState.slides.length > 0 && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="text-center">
                        <button
                            onClick={handlePlayPause}
                            className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform"
                        >
                            <Play className="w-10 h-10 text-white ml-1" />
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-2">Ready to Learn</h2>
                        <p className="text-slate-400">{videoState.slides.length} slides</p>
                    </div>
                </div>
            )}

        </div>
    );
}
