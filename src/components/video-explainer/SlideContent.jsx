import { Database, Code, Lightbulb, Bookmark } from 'lucide-react';

export default function SlideContent({
    slide,
    currentSlide,
    highlightedCharIndex,
    isPlaying,
    useTTS,
    diagrams,
    examples,
    renderedDiagrams,
    bookmarks,
    userNotes,
    showDiagrams
}) {
    if (!slide) return null;

    const { title, content, type, hasDiagram, hasExample, slideNumber } = slide;
    const slideDiagrams = diagrams.filter(d => d.slideNumber === slideNumber);
    const slideExamples = examples.filter(e => e.slideNumber === slideNumber);

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
                        {type.toUpperCase()}
                    </div>
                    {bookmarks.includes(currentSlide) && (
                        <Bookmark className="w-4 h-4 text-yellow-400 fill-current" />
                    )}
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

                    {/* Diagrams */}
                    {showDiagrams && slideDiagrams.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                                    <Database className="w-5 h-5" /> Diagrams
                                </h3>
                            </div>
                            {slideDiagrams.map(diagram => (
                                <div key={diagram.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-medium text-white">{diagram.title}</h4>
                                        <span className="text-xs px-2 py-1 bg-slate-700/50 rounded">
                                            {diagram.diagramType}
                                        </span>
                                    </div>
                                    <div
                                        className="mermaid-diagram rounded overflow-hidden bg-slate-900/50 p-4"
                                        dangerouslySetInnerHTML={{ __html: renderedDiagrams[diagram.id] || '' }}
                                    />
                                    <p className="text-white/70 text-xs mt-2">{diagram.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Examples */}
                    {slideExamples.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                                <Code className="w-5 h-5" /> Examples
                            </h3>
                            {slideExamples.map(example => (
                                <div key={example.id} className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-700/30">
                                    <h4 className="text-sm font-medium text-white mb-2">{example.title}</h4>
                                    {example.codeExample && (
                                        <pre className="bg-black/50 rounded p-3 text-xs font-mono text-emerald-300 overflow-x-auto">
                                            <code>{example.codeExample}</code>
                                        </pre>
                                    )}
                                    {example.scenario && (
                                        <p className="text-white/80 text-sm mt-2">{example.scenario}</p>
                                    )}
                                    {example.stepByStepExplanation && (
                                        <div className="mt-3">
                                            <h5 className="text-xs font-semibold text-emerald-400 mb-1">Step-by-Step:</h5>
                                            <div className="text-white/70 text-sm space-y-1">
                                                {example.stepByStepExplanation.split('\n').map((step, idx) => (
                                                    <div key={idx} className="flex items-start gap-2">
                                                        <span className="text-emerald-400">{idx + 1}.</span>
                                                        <span>{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* User Notes */}
                    {userNotes[currentSlide]?.length > 0 && (
                        <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-700/30">
                            <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" /> Your Notes
                            </h3>
                            <div className="space-y-2 mt-2">
                                {userNotes[currentSlide].map((note, idx) => (
                                    <div key={idx} className="text-white/80 text-sm bg-amber-900/10 p-2 rounded">
                                        {note.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
