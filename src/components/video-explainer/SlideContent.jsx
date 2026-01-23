import { useEffect, useState, useRef } from 'react';
import { BookOpen, Lightbulb, Code, HelpCircle, FileText } from 'lucide-react';

export default function SlideContent({
    slide,
    currentSlide,
    highlightedCharIndex,
    isPlaying,
    useTTS
}) {
    const [visibleLines, setVisibleLines] = useState(0);
    const [fadeIn, setFadeIn] = useState(false);
    const prevSlideRef = useRef(currentSlide);

    // Cinematic fade-in effect on slide change
    useEffect(() => {
        if (currentSlide !== prevSlideRef.current) {
            setFadeIn(false);
            setVisibleLines(0);
            prevSlideRef.current = currentSlide;
            setTimeout(() => setFadeIn(true), 50);
        } else {
            setFadeIn(true);
        }
    }, [currentSlide]);

    // Progressive line reveal effect when playing
    useEffect(() => {
        if (!slide || !isPlaying) return;
        const lines = slide.content.split('\n').slice(1).filter(l => l.trim()).length;
        if (visibleLines < lines) {
            const timer = setTimeout(() => setVisibleLines(v => v + 1), 400);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, visibleLines, slide]);

    // Show all lines when not playing
    useEffect(() => {
        if (!isPlaying && slide) {
            const lines = slide.content.split('\n').slice(1).filter(l => l.trim()).length;
            setVisibleLines(lines);
        }
    }, [isPlaying, slide]);

    if (!slide) return null;

    const { title, content, type } = slide;

    const getTypeIcon = () => {
        switch (type) {
            case 'objective': return <Lightbulb className="w-4 h-4" />;
            case 'example': return <Code className="w-4 h-4" />;
            case 'quiz': return <HelpCircle className="w-4 h-4" />;
            case 'diagram': return <FileText className="w-4 h-4" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'objective': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-400';
            case 'example': return 'from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-400';
            case 'diagram': return 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400';
            case 'quiz': return 'from-orange-500/20 to-amber-500/20 border-orange-500/40 text-orange-400';
            default: return 'from-slate-700/50 to-slate-600/50 border-white/20 text-white/80';
        }
    };

    const renderContentWithHighlighting = () => {
        const text = content.replace(/\*\*/g, '');
        const paragraphs = text.split('\n').slice(1);
        let lineIndex = 0;
        let paragraphIndex = 0; // Track actual paragraph index (excluding empty lines)

        // Decode the highlighted index: paragraphIndex * 10000 + wordInParagraph
        const highlightedParagraph = Math.floor(highlightedCharIndex / 10000);
        const highlightedWordInParagraph = highlightedCharIndex % 10000;

        return paragraphs.map((paragraph, pIdx) => {
            if (!paragraph.trim()) {
                return <div key={pIdx} className="h-4" />;
            }

            const currentParagraphIndex = paragraphIndex;
            paragraphIndex++;
            lineIndex++;
            const isVisible = lineIndex <= visibleLines;

            // Reset word count for each paragraph
            let wordInParagraph = 0;

            // Split into words and spaces
            const tokens = paragraph.split(/(\s+)/);
            const paragraphContent = tokens.map((token, tIdx) => {
                const isWord = token.trim().length > 0;
                
                // Clean the word the same way TTS does
                const cleanedWord = token
                    .replace(/\*\*/g, '').replace(/##/g, '').replace(/#/g, '')
                    .replace(/^[-•*]\s*/g, '')
                    .replace(/\([^)]*\)/g, '')
                    .trim();
                
                let isCurrent = false;
                if (isWord && cleanedWord.length > 0) {
                    // Match by paragraph index AND word index within paragraph
                    isCurrent = currentParagraphIndex === highlightedParagraph && 
                                wordInParagraph === highlightedWordInParagraph;
                    wordInParagraph++;
                }

                return (
                    <span 
                        key={tIdx} 
                        className={`transition-colors duration-75 ${
                            isCurrent 
                                ? 'bg-yellow-400/90 text-gray-900 font-medium rounded px-0.5'
                                : 'text-slate-200'
                        }`}
                    >
                        {token}
                    </span>
                );
            });

            const isBullet = paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-');
            
            return (
                <p 
                    key={pIdx} 
                    className={`mb-6 text-xl md:text-xl lg:text-xl leading-relaxed transition-all duration-500 ${
                        isBullet ? 'pl-8 border-l-3 border-purple-500/50' : ''
                    } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${lineIndex * 100}ms` }}
                >
                    {paragraphContent}
                </p>
            );
        });
    };

    const renderStaticContent = () => {
        const paragraphs = content.split('\n').slice(1);
        let lineIndex = 0;

        return paragraphs.map((line, idx) => {
            if (!line.trim()) return <div key={idx} className="h-5" />;
            
            lineIndex++;
            const isVisible = lineIndex <= visibleLines;
            const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
            
            return (
                <p 
                    key={idx} 
                    className={`text-slate-200 mb-6 text-xl md:text-2xl lg:text-3xl leading-relaxed transition-all duration-500 ${
                        isBullet ? 'pl-8 border-l-3 border-purple-500/50' : ''
                    } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${lineIndex * 100}ms` }}
                >
                    {line}
                </p>
            );
        });
    };

    return (
        <div className={`h-full flex flex-col transition-all duration-700 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Content Area with cinematic presentation */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Main Content */}
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 md:p-10 border border-slate-700/50 shadow-2xl">
                    <div className="prose prose-invert max-w-none">
                        {isPlaying && useTTS && highlightedCharIndex >= 0 
                            ? renderContentWithHighlighting()
                            : renderStaticContent()
                        }
                    </div>
                </div>
            </div>

            {/* Bottom accent */}
            <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                isPlaying ? 'bg-purple-500 animate-pulse' : 'bg-slate-700'
                            }`}
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
