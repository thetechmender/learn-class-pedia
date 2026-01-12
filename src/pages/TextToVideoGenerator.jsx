import React from 'react';
import VideoCreator from '../components/TextToVideo/VideoCreator';
import { Sparkles } from 'lucide-react';

const TextToVideoGenerator = () => {
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-[1800px] mx-auto space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                AI Video Studio
                            </h1>
                            <p className="text-sm text-gray-500">Text-to-Video Generation Engine</p>
                        </div>
                    </div>
                </header>

                <VideoCreator />
            </div>
        </div>
    );
};

export default TextToVideoGenerator;
