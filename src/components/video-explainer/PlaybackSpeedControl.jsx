import { useState } from 'react';
import { Gauge, Check } from 'lucide-react';

export default function PlaybackSpeedControl({ playbackRate, onSpeedChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const speeds = [
        { value: 0.5, label: '0.5x', description: 'Slow' },
        { value: 0.75, label: '0.75x', description: 'Relaxed' },
        { value: 1, label: '1x', description: 'Normal' },
        { value: 1.25, label: '1.25x', description: 'Faster' },
        { value: 1.5, label: '1.5x', description: 'Fast' },
        { value: 1.75, label: '1.75x', description: 'Very Fast' },
        { value: 2, label: '2x', description: 'Maximum' }
    ];

    const currentSpeed = speeds.find(s => s.value === playbackRate) || speeds[2];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-white transition-all border border-white/10"
                title="Playback Speed"
            >
                <Gauge className="w-4 h-4" />
                <span className="text-sm font-medium">{currentSpeed.label}</span>
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute bottom-full mb-2 right-0 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-50 overflow-hidden min-w-[200px]">
                        <div className="p-2 border-b border-slate-700 bg-slate-900/50">
                            <p className="text-xs font-semibold text-white/80">Playback Speed</p>
                        </div>
                        <div className="p-1">
                            {speeds.map((speed) => (
                                <button
                                    key={speed.value}
                                    onClick={() => {
                                        onSpeedChange(speed.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                                        speed.value === playbackRate
                                            ? 'bg-blue-500 text-white'
                                            : 'hover:bg-white/10 text-white/80'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">{speed.label}</span>
                                        <span className="text-xs text-white/50">{speed.description}</span>
                                    </div>
                                    {speed.value === playbackRate && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="p-2 border-t border-slate-700 bg-slate-900/50">
                            <p className="text-xs text-white/40 text-center">
                                Adjust speed to match your learning pace
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
