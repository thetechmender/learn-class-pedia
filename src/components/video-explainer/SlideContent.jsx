export default function SlideContent({
    slide,
    currentSlide,
    highlightedCharIndex,
    isPlaying,
    useTTS
}) {
    if (!slide) return null;

    const { title, content, type } = slide;

    const renderContentWithHighlighting = () => {
        const text = content.replace(/\*\*/g, '');
        const paragraphs = text.split('\n');
        // Skip the first paragraph (heading) - start from index 1
        const contentParagraphs = paragraphs.slice(1);
        let globalCharCount = 0;

        return contentParagraphs.map((paragraph, pIdx) => {
            if (!paragraph.trim()) {
                globalCharCount += 1; // Account for newline
                return <div key={pIdx} className="h-3" />;
            }

            const words = paragraph.split(/(\s+)/);
            const paragraphContent = words.map((word, wIdx) => {
                const start = globalCharCount;
                const end = globalCharCount + word.length;
                globalCharCount = end;
                const isCurrent = highlightedCharIndex >= start && highlightedCharIndex < end && word.trim().length > 0;

                return (
                    <span key={wIdx} className={`transition-all duration-150 ${isCurrent ? 'bg-yellow-400 text-gray-900 font-bold px-1 rounded scale-110 inline-block shadow-lg'
                        : 'text-white/90'
                        }`}>{word}</span>
                );
            });

            globalCharCount += 1; // Account for newline between paragraphs

            // Check if paragraph starts with bullet point
            const isBullet = paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-');
            
            return (
                <p key={pIdx} className={`text-white/90 mb-3 text-sm md:text-base leading-relaxed ${isBullet ? 'pl-4' : ''}`}>
                    {paragraphContent}
                </p>
            );
        });
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Slide Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${type === 'objective' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        type === 'example' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            type === 'diagram' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                type === 'quiz' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                    'bg-gray-700/50 text-white/80 border border-white/10'
                        }`}>
                        {type?.toUpperCase() || 'CONTENT'}
                    </div>
                </div>
                <div className="text-xs text-white/50">
                    Duration: {slide.duration}s
                </div>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {title}
            </h2>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {/* Main Content */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        {isPlaying && useTTS && highlightedCharIndex >= 0 ? (
                            <div className="prose prose-invert max-w-none">
                                {renderContentWithHighlighting()}
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none">
                                {content.split('\n').slice(1).map((line, idx) => {
                                    if (!line.trim()) return <div key={idx} className="h-3" />;
                                    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
                                    return (
                                        <p key={idx} className={`text-white/90 mb-3 text-sm md:text-base leading-relaxed ${isBullet ? 'pl-4' : ''}`}>
                                            {line}
                                        </p>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
