import React, { useRef, useEffect } from 'react';

export default function Avatar({ type = 'video', isTalking = false, className = '' }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (type === 'video' && videoRef.current) {
            if (isTalking) {
                videoRef.current.play().catch(e => console.warn("Avatar video play failed", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isTalking, type]);

    if (type === 'video') {
        return (
            <div className={`relative rounded-xl overflow-hidden shadow-lg border-2 transition-all duration-300 ${isTalking ? 'border-primary-400 shadow-xl' : 'border-white/20 grayscale'} ${className}`}>
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src="https://videos.pexels.com/video-files/3209298/3209298-hd_1920_1080_25fps.mp4"
                    playsInline
                    muted
                    loop
                />
                {/* Inactive Overlay */}
                {!isTalking && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Image mode fallback
    return (
        <div className={`relative rounded-full overflow-hidden shadow-lg ring-4 ring-white transition-transform duration-200 ${isTalking ? 'scale-105 ring-primary-200' : ''} ${className}`}>
            {/* Use a placeholder image or prop if passed, defaulting to no-op if deleted */}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-medium">
                JPG
            </div>

            {isTalking && (
                <div className="absolute inset-0 bg-primary-500/10 animate-pulse rounded-full" />
            )}
        </div>
    );
}
