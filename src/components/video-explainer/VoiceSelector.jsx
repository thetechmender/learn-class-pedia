import { useState } from 'react';
import { ChevronDown, Volume2 } from 'lucide-react';

// Predefined human-like voices with fallbacks
const HUMAN_VOICES = [
    { 
        id: 'google-us-female',
        name: 'Sarah (US Female)',
        keywords: ['Google US English', 'en-US', 'Female'],
        icon: '👩',
        description: 'Clear and professional'
    },
    { 
        id: 'google-us-male',
        name: 'James (US Male)',
        keywords: ['Google US English', 'en-US', 'Male'],
        icon: '👨',
        description: 'Deep and authoritative'
    },
    { 
        id: 'google-uk-female',
        name: 'Emma (UK Female)',
        keywords: ['Google UK English', 'en-GB', 'Female'],
        icon: '👩',
        description: 'British accent'
    },
    { 
        id: 'microsoft-female',
        name: 'Zira (Natural)',
        keywords: ['Microsoft Zira', 'en-US', 'Female'],
        icon: '👩',
        description: 'Warm and friendly'
    },
    { 
        id: 'microsoft-male',
        name: 'David (Natural)',
        keywords: ['Microsoft David', 'en-US', 'Male'],
        icon: '👨',
        description: 'Smooth and engaging'
    }
];

export default function VoiceSelector({ 
    voices, 
    selectedVoice, 
    onVoiceChange,
    className = '' 
}) {
    const [isOpen, setIsOpen] = useState(false);

    // Match available system voices to our predefined human-like voices
    const getMatchedVoices = () => {
        console.log('VoiceSelector: Total available voices:', voices.length);
        const matched = [];
        
        HUMAN_VOICES.forEach(humanVoice => {
            // Find the best matching system voice
            const systemVoice = voices.find(v => 
                humanVoice.keywords.some(keyword => 
                    v.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    v.lang.toLowerCase().includes(keyword.toLowerCase())
                )
            );
            
            if (systemVoice) {
                console.log(`Matched ${humanVoice.name} to ${systemVoice.name}`);
                matched.push({
                    ...humanVoice,
                    systemVoice: systemVoice,
                    systemName: systemVoice.name
                });
            }
        });

        // If we found fewer than 3 voices, add some fallback voices
        if (matched.length < 3) {
            const englishVoices = voices.filter(v => 
                v.lang.includes('en') && !matched.some(m => m.systemName === v.name)
            );
            
            console.log('Adding fallback voices:', englishVoices.length);
            englishVoices.slice(0, 5 - matched.length).forEach((voice, idx) => {
                matched.push({
                    id: `fallback-${idx}`,
                    name: voice.name.split(' ').slice(0, 2).join(' '),
                    icon: idx % 2 === 0 ? '👩' : '👨',
                    description: 'Natural voice',
                    systemVoice: voice,
                    systemName: voice.name
                });
            });
        }

        console.log('VoiceSelector: Total matched voices:', matched.length);
        return matched.slice(0, 5); // Limit to 5 voices
    };

    const matchedVoices = getMatchedVoices();
    const currentVoice = matchedVoices.find(v => v.systemName === selectedVoice) || matchedVoices[0];

    const handleVoiceSelect = (voice) => {
        console.log('🎤 Voice selected:', voice.systemName);
        console.log('🎤 Current selectedVoice before change:', selectedVoice);
        onVoiceChange(voice.systemName);
        console.log('🎤 onVoiceChange called with:', voice.systemName);
        setIsOpen(false);
        
        // Show a brief notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] animate-fade-in';
        notification.textContent = `Voice changed to ${voice.name}`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    };

    if (matchedVoices.length === 0) return null;

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-white/90 transition-all text-sm border border-white/10"
            >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">{currentVoice?.icon} {currentVoice?.name.split('(')[0].trim()}</span>
                <span className="sm:hidden">{currentVoice?.icon}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-700 bg-slate-900/50">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Volume2 className="w-4 h-4" />
                                Select Voice
                            </h3>
                            <p className="text-xs text-white/50 mt-0.5">Choose your AI instructor's voice</p>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {matchedVoices.map((voice) => (
                                <button
                                    key={voice.id}
                                    onClick={() => handleVoiceSelect(voice)}
                                    className={`w-full text-left p-3 transition-all border-b border-slate-700/50 last:border-0 ${
                                        voice.systemName === selectedVoice
                                            ? 'bg-blue-500/20 border-l-4 border-l-blue-500'
                                            : 'hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">{voice.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white text-sm">
                                                    {voice.name}
                                                </span>
                                                {voice.systemName === selectedVoice && (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-white/60 mt-0.5">{voice.description}</p>
                                            <p className="text-xs text-white/40 mt-1 truncate">{voice.systemName}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-2 bg-slate-900/50 border-t border-slate-700">
                            <p className="text-xs text-white/40 text-center">
                                {matchedVoices.length} voice{matchedVoices.length !== 1 ? 's' : ''} available
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
