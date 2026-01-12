import React from 'react';
import { Settings, Type, Mic, Palette } from 'lucide-react';

const Controls = ({
    text,
    setText,
    selectedVoice,
    setSelectedVoice,
    voices,
    isGenerating,
    onGenerate
}) => {
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl h-full flex flex-col gap-6">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Settings className="w-5 h-5" />
                <h2 className="text-xl font-bold text-white">Configuration</h2>
            </div>

            <div className="space-y-4 flex-1">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                        <Type className="w-4 h-4 text-pink-500" />
                        Script
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
                        placeholder="Type your script here... Each sentence will be a new frame in the video."
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                        <Mic className="w-4 h-4 text-cyan-500" />
                        Voice Identity
                    </label>
                    <select
                        value={selectedVoice?.name || ''}
                        onChange={(e) => {
                            const voice = voices.find(v => v.name === e.target.value);
                            setSelectedVoice(voice);
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                    >
                        {voices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <p className="text-xs text-indigo-200 leading-relaxed">
                        💡 Pro Tip: The video will be generated in real-time. Please utilize your browser's audio capabilities.
                    </p>
                </div>
            </div>

            <button
                onClick={onGenerate}
                disabled={isGenerating || !text.trim()}
                className={`
            w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300
            ${isGenerating
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:scale-[1.02] hover:shadow-indigo-500/25'
                    }
        `}
            >
                {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Rendering Video...
                    </span>
                ) : (
                    'Generate Video'
                )}
            </button>
        </div>
    );
};

export default Controls;
