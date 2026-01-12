import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Maximize2, RotateCcw, ChevronRight, ChevronLeft, Layers,
    BookOpen, Target, Zap, CheckCircle, XCircle, HelpCircle,
    Download, Share2, Settings, Bookmark, Clock, BarChart3,
    Lightbulb, Code, Database, Server, Cpu, Network,
    ChevronDown, ChevronUp, ExternalLink, Copy, Check
} from 'lucide-react';
import Avatar from './Avatar';
import { apiService } from '../services/api';
import mermaid from 'mermaid';

// Initialize Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
    },
    themeCSS: `
    .node rect, .node circle, .node ellipse, .node polygon {
      fill: #1e293b;
      stroke: #0ea5e9;
      stroke-width: 2px;
    }
    .edgePath path {
      stroke: #0ea5e9;
      stroke-width: 2px;
    }
    .cluster rect {
      fill: rgba(30, 41, 59, 0.7);
      stroke: rgba(14, 165, 233, 0.5);
      stroke-dasharray: 5,5;
    }
  `
});

export default function VideoCourseExplainer({
    lessonText,
    audios = [],
    diagrams = [],
    examples = [],
    assessments = [],
    structuredOutline,
    keyConcepts,
    learningObjectives,
    comprehensiveSummary,
    practiceExercises
}) {
    // State
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioStreamUrl, setAudioStreamUrl] = useState('');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [speechProgress, setSpeechProgress] = useState(0);
    const [showSlidePanel, setShowSlidePanel] = useState(true);
    const [showNotesPanel, setShowNotesPanel] = useState(false);
    const [showDiagrams, setShowDiagrams] = useState(true);
    const [userNotes, setUserNotes] = useState({});
    const [bookmarks, setBookmarks] = useState([]);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [activeTab, setActiveTab] = useState('content'); // 'content', 'examples', 'quiz'
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizScore, setQuizScore] = useState(null);
    const [showProgressChart, setShowProgressChart] = useState(false);
    const [completedSlides, setCompletedSlides] = useState(new Set());
    const [timeSpent, setTimeSpent] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    // TTS State
    const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1);
    const [voices, setVoices] = useState([]);
    const [useTTS, setUseTTS] = useState(true);

    // Diagram State
    const [renderedDiagrams, setRenderedDiagrams] = useState({});
    const [diagramLoading, setDiagramLoading] = useState(false);

    // Refs
    const audioRef = useRef(null);
    const containerRef = useRef(null);
    const slidePanelRef = useRef(null);
    const timerRef = useRef(null);
    const diagramRefs = useRef({});

    // Initialize timers and load voices
    useEffect(() => {
        // Start time tracking
        timerRef.current = setInterval(() => {
            if (isPlaying) {
                setTimeSpent(prev => prev + 1);
            }
        }, 1000);

        // Load TTS Voices
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            if (availableVoices.length > 0 && !selectedVoice) {
                const preferredVoice = availableVoices.find(v =>
                    v.name.includes('Google') && v.lang.includes('en')
                ) || availableVoices.find(v => v.lang.includes('en-US')) || availableVoices[0];
                setSelectedVoice(preferredVoice.name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // Render initial diagrams
        renderDiagrams();

        return () => {
            clearInterval(timerRef.current);
            window.speechSynthesis.cancel();
        };
    }, []);

    // Enhanced Text Processing
    useEffect(() => {
        if (lessonText) {
            processLessonText(lessonText);
        } else if (structuredOutline) {
            // Generate slides from structured outline
            generateSlidesFromOutline();
        }
    }, [lessonText, structuredOutline]);

    const processLessonText = (text) => {
        const cleanText = text
            .replace(/\*\*/g, '').replace(/##/g, '').replace(/#/g, '')
            .replace(/&nbsp;/g, ' ').trim();

        const slideRegex = /\[SLIDE\s*\d*[:\]]/gi;
        const slideMarkers = cleanText.match(slideRegex);
        let processedSlides = [];

        if (slideMarkers && slideMarkers.length > 0) {
            const slidesSplit = cleanText.split(slideRegex);
            if (slidesSplit[0].trim() === '') slidesSplit.shift();

            slidesSplit.forEach((slideContent, index) => {
                const slideData = parseSlideContent(slideContent.trim(), index);
                if (slideData) processedSlides.push(slideData);
            });
        } else {
            // Fallback: split by double newlines
            const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
            paragraphs.forEach((paragraph, index) => {
                processedSlides.push({
                    title: `Section ${index + 1}`,
                    content: paragraph.trim(),
                    slideNumber: index + 1,
                    type: 'content',
                    duration: 60, // Estimated duration in seconds
                    hasDiagram: diagrams.some(d => d.slideNumber === index + 1),
                    hasExample: examples.some(e => e.slideNumber === index + 1)
                });
            });
        }

        // Add extra slides for key concepts, examples, etc.
        enhancedSlidesWithResources(processedSlides);
    };

    const parseSlideContent = (content, index) => {
        if (!content) return null;

        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        let title = '';
        const bullets = [];
        const notes = [];
        let type = 'content';
        let duration = 45;
        let slideNumber = index + 1;

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();

            if (lowerLine.includes('title:')) {
                title = line.split(':')[1].trim();
            } else if (lowerLine.includes('objective:') || lowerLine.includes('agenda:')) {
                type = 'objective';
                bullets.push(`🎯 ${line}`);
            } else if (lowerLine.includes('example:') || lowerLine.includes('scenario:')) {
                type = 'example';
                bullets.push(`💡 ${line}`);
            } else if (lowerLine.includes('diagram:') || lowerLine.includes('visual:')) {
                type = 'diagram';
                bullets.push(`📊 ${line}`);
            } else if (lowerLine.includes('exercise:') || lowerLine.includes('practice:')) {
                type = 'exercise';
                bullets.push(`🏋️ ${line}`);
            } else if (lowerLine.includes('summary:') || lowerLine.includes('key takeaway:')) {
                type = 'summary';
                bullets.push(`📝 ${line}`);
            } else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
                bullets.push(line);
            } else if (line.includes('(Note:') || line.includes('[Note:')) {
                notes.push(line.replace(/[\(\)\[\]]/g, ''));
            } else if (line.length > 0) {
                bullets.push(line);
            }
        });

        // Determine duration based on content
        const wordCount = bullets.join(' ').split(/\s+/).length;
        duration = Math.max(30, Math.min(120, Math.ceil(wordCount / 3)));

        // Check if this slide has associated diagrams or examples
        const hasDiagram = diagrams.some(d => d.slideNumber === slideNumber);
        const hasExample = examples.some(e => e.slideNumber === slideNumber);

        return {
            title: title || `Slide ${slideNumber}`,
            content: bullets.join('\n'),
            notes: notes,
            type,
            duration,
            slideNumber,
            hasDiagram,
            hasExample,
            wordCount
        };
    };

    const enhancedSlidesWithResources = (baseSlides) => {
        const enhancedSlides = [...baseSlides];

        // Add key concepts slide if available
        if (keyConcepts) {
            enhancedSlides.splice(1, 0, {
                title: "Key Concepts",
                content: keyConcepts,
                type: "concepts",
                slideNumber: "KC",
                hasDiagram: false,
                hasExample: false,
                duration: 90
            });
        }

        // Add learning objectives slide if available
        if (learningObjectives) {
            enhancedSlides.splice(0, 0, {
                title: "Learning Objectives",
                content: learningObjectives,
                type: "objectives",
                slideNumber: "LO",
                hasDiagram: false,
                hasExample: false,
                duration: 60
            });
        }

        // Add interactive quiz slide at the end
        if (assessments?.length > 0) {
            enhancedSlides.push({
                title: "Knowledge Check",
                content: "Test your understanding with these questions",
                type: "quiz",
                slideNumber: "QC",
                hasDiagram: false,
                hasExample: false,
                duration: 120
            });
        }

        // Add summary slide at the end
        if (comprehensiveSummary) {
            enhancedSlides.push({
                title: "Course Summary",
                content: comprehensiveSummary,
                type: "summary",
                slideNumber: "SUM",
                hasDiagram: false,
                hasExample: false,
                duration: 60
            });
        }

        setSlides(enhancedSlides);
    };

    const generateSlidesFromOutline = () => {
        if (!structuredOutline) return;

        const outlineSections = structuredOutline.split('\n').filter(line => line.trim());
        const generatedSlides = outlineSections.map((section, index) => {
            return {
                title: section.split(':')[0]?.trim() || `Module ${index + 1}`,
                content: section,
                type: 'outline',
                slideNumber: index + 1,
                duration: 60,
                hasDiagram: false,
                hasExample: false
            };
        });

        setSlides(generatedSlides);
    };

    // Audio/TTS Management
    useEffect(() => {
        if (audios && audios.length > currentSlide && audios[currentSlide]) {
            setAudioStreamUrl(apiService.getAudioStreamUrl(audios[currentSlide].id));
            setUseTTS(false);
        } else {
            setAudioStreamUrl('');
            setUseTTS(true);
        }
    }, [currentSlide, audios]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio && audioStreamUrl && !useTTS) {
            audio.muted = isMuted;
            audio.playbackRate = playbackRate;
            if (isPlaying) {
                audio.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
            } else {
                audio.pause();
                setIsAudioPlaying(false);
            }
        }
    }, [isPlaying, audioStreamUrl, useTTS, isMuted, playbackRate]);

    // TTS Logic
    useEffect(() => {
        if (!useTTS || !isPlaying || isMuted) {
            if (useTTS) {
                window.speechSynthesis.cancel();
                setHighlightedCharIndex(-1);
                setSpeechProgress(0);
                if (isMuted) setIsAudioPlaying(false);
            }
            return;
        }

        const currentSlideData = slides[currentSlide];
        if (!currentSlideData) return;

        let ttsContent = currentSlideData.content
            .replace(/\*\*/g, '').replace(/##/g, '').replace(/#/g, '')
            .replace(/^[-•*]\s*/gm, '')
            .replace(/^(Visual|Diagram|Flowchart|Chart|Image|Loading|Title|Slide):\s*/gim, '')
            .replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

        const title = currentSlideData.title;
        const isGenericTitle = /^(Slide|Section|Module)\s*\d+/i.test(title);
        const text = !isGenericTitle && title ? `${title}. ${ttsContent}` : ttsContent;

        if (!text || text.trim() === '' || text.trim() === '.') return;

        window.speechSynthesis.cancel();
        setIsAudioPlaying(true);
        setSpeechProgress(0);

        const utterance = new SpeechSynthesisUtterance(text.replace(/_/g, ' '));
        const voice = voices.find(v => v.name === selectedVoice) || voices[0];
        if (voice) utterance.voice = voice;

        utterance.rate = playbackRate;
        utterance.pitch = 1.0;
        utterance.volume = isMuted ? 0 : 1;

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                setHighlightedCharIndex(event.charIndex);
                setSpeechProgress(Math.min(100, Math.round((event.charIndex / text.length) * 100)));
            }
        };

        utterance.onend = () => {
            setHighlightedCharIndex(-1);
            setIsAudioPlaying(false);
            setSpeechProgress(100);
            markSlideCompleted(currentSlide);

            if (currentSlide < slides.length - 1) {
                setTimeout(() => {
                    setSpeechProgress(0);
                    setCurrentSlide(prev => prev + 1);
                }, 600);
            } else {
                setIsPlaying(false);
                if (assessments.length > 0) {
                    setActiveTab('quiz');
                }
            }
        };

        const timeout = setTimeout(() => window.speechSynthesis.speak(utterance), 400);
        return () => { clearTimeout(timeout); window.speechSynthesis.cancel(); };
    }, [isPlaying, currentSlide, slides, voices, useTTS, isMuted, playbackRate, selectedVoice]);

    // Diagram Rendering
    const renderDiagrams = async () => {
        if (!diagrams.length) return;

        setDiagramLoading(true);
        const rendered = {};

        for (const diagram of diagrams) {
            try {
                const elementId = `diagram-${diagram.id}`;
                diagramRefs.current[elementId] = diagramRefs.current[elementId] || document.createElement('div');

                const { svg } = await mermaid.render(elementId, diagram.mermaidCode || generateMermaidFromDescription(diagram.description));
                rendered[diagram.id] = svg;
            } catch (error) {
                console.error('Error rendering diagram:', error);
                rendered[diagram.id] = `<div class="text-red-400 p-4 bg-red-900/20 rounded-lg">Error rendering diagram</div>`;
            }
        }

        setRenderedDiagrams(rendered);
        setDiagramLoading(false);
    };

    const generateMermaidFromDescription = (description) => {
        // Simple Mermaid generation based on description
        return `
graph TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Result A]
    C -->|No| E[Result B]
    style A fill:#1e40af
    style D fill:#10b981
    style E fill:#ef4444
    `;
    };

    // Progress Tracking
    const markSlideCompleted = useCallback((slideIndex) => {
        setCompletedSlides(prev => new Set([...prev, slideIndex]));
    }, []);

    // Event Handlers
    const handleAudioEnded = () => {
        markSlideCompleted(currentSlide);
        if (currentSlide < slides.length - 1) {
            setTimeout(() => setCurrentSlide(prev => prev + 1), 600);
        } else {
            setIsPlaying(false);
            setActiveTab('quiz');
        }
    };

    const handlePlayPause = () => {
        if (!hasStarted) setHasStarted(true);
        if (isPlaying) {
            setIsPlaying(false);
            window.speechSynthesis.cancel();
            setIsAudioPlaying(false);
        } else {
            setSpeechProgress(0);
            setIsPlaying(true);
            markSlideCompleted(currentSlide);
        }
    };

    const handleSlideChange = (direction) => {
        if (!hasStarted) setHasStarted(true);
        window.speechSynthesis.cancel();
        setHighlightedCharIndex(-1);
        setSpeechProgress(0);
        setCurrentSlide(prev => {
            const newSlide = direction === 'prev' ? Math.max(0, prev - 1) : Math.min(slides.length - 1, prev + 1);
            markSlideCompleted(newSlide);
            return newSlide;
        });
    };

    const handleSlideClick = (index) => {
        if (!hasStarted) setHasStarted(true);
        window.speechSynthesis.cancel();
        setHighlightedCharIndex(-1);
        setSpeechProgress(0);
        setCurrentSlide(index);
        markSlideCompleted(index);
        setIsPlaying(true);
    };

    const handleReset = () => {
        window.speechSynthesis.cancel();
        setHighlightedCharIndex(-1);
        setSpeechProgress(0);
        setCurrentSlide(0);
        setIsPlaying(false);
        setQuizAnswers({});
        setQuizScore(null);
        setCompletedSlides(new Set());
        setTimeSpent(0);
        // Do NOT reset hasStarted, so overlay doesn't reappear
    };

    const handleQuizSubmit = () => {
        let correct = 0;
        const total = assessments.length;

        assessments.forEach((question, index) => {
            if (quizAnswers[index] === question.correctOptionIndex) {
                correct++;
            }
        });

        setQuizScore({
            correct,
            total,
            percentage: Math.round((correct / total) * 100)
        });
    };

    const toggleBookmark = () => {
        if (bookmarks.includes(currentSlide)) {
            setBookmarks(prev => prev.filter(b => b !== currentSlide));
        } else {
            setBookmarks(prev => [...prev, currentSlide]);
        }
    };

    const saveNote = () => {
        const note = prompt('Enter your note for this slide:');
        if (note) {
            setUserNotes(prev => ({
                ...prev,
                [currentSlide]: [...(prev[currentSlide] || []), {
                    text: note,
                    timestamp: new Date().toISOString(),
                    slide: currentSlide
                }]
            }));
        }
    };

    // Statistics
    const slideProgress = slides.length > 0 ? (currentSlide / slides.length) * 100 : 0;
    const currentSlideContribution = slides.length > 0 ? (speechProgress / 100) * (100 / slides.length) : 0;
    const overallProgress = slideProgress + currentSlideContribution;
    const completionPercentage = slides.length > 0 ? Math.round((completedSlides.size / slides.length) * 100) : 0;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Memoized Components
    const SlideContent = useMemo(() => {
        const currentSlideData = slides[currentSlide];
        if (!currentSlideData) return null;

        const { title, content, type, hasDiagram, hasExample, slideNumber } = currentSlideData;
        const slideDiagrams = diagrams.filter(d => d.slideNumber === slideNumber);
        const slideExamples = examples.filter(e => e.slideNumber === slideNumber);

        const renderContentWithHighlighting = () => {
            const text = content.replace(/\*\*/g, '');
            const words = text.split(/(\s+)/);
            let charCount = 0;

            return words.map((word, i) => {
                const start = charCount;
                const end = charCount + word.length;
                charCount = end;
                const isCurrent = highlightedCharIndex >= start && highlightedCharIndex < end && word.trim().length > 0;

                return (
                    <span key={i} className={`transition-all duration-150 ${isCurrent ? 'bg-yellow-400 text-gray-900 font-bold px-1 rounded scale-110 inline-block shadow-lg'
                        : 'text-white/90'
                        }`}>{word}</span>
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
                        Duration: {currentSlideData.duration}s
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
                                <p className="text-white/90 leading-relaxed text-sm md:text-base">
                                    {renderContentWithHighlighting()}
                                </p>
                            ) : (
                                <div className="prose prose-invert max-w-none">
                                    {content.split('\n').map((line, idx) => (
                                        <p key={idx} className="text-white/90 mb-2 text-sm md:text-base">
                                            {line}
                                        </p>
                                    ))}
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
                                    {diagramLoading && (
                                        <div className="text-xs text-white/50">Rendering...</div>
                                    )}
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
    }, [slides, currentSlide, highlightedCharIndex, isPlaying, useTTS, diagrams, examples, renderedDiagrams, bookmarks, userNotes]);

    const QuizComponent = useMemo(() => {
        if (!assessments.length) return null;

        return (
            <div className="h-full flex flex-col">
                <div className="mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6" /> Knowledge Check
                    </h2>
                    <p className="text-white/70 text-sm">Test your understanding of the course material</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {assessments.map((question, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-white font-medium">Question {index + 1}</h3>
                                <span className="text-xs px-2 py-1 bg-slate-700/50 rounded">
                                    {question.difficulty || 'Medium'}
                                </span>
                            </div>

                            <p className="text-white/90 mb-4">{question.question}</p>

                            <div className="space-y-2">
                                {JSON.parse(question.options || '[]').map((option, optIndex) => (
                                    <button
                                        key={optIndex}
                                        onClick={() => setQuizAnswers(prev => ({ ...prev, [index]: optIndex }))}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${quizAnswers[index] === optIndex
                                            ? optIndex === question.correctOptionIndex
                                                ? 'bg-green-500/20 border-green-400/50'
                                                : 'bg-red-500/20 border-red-400/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center ${quizAnswers[index] === optIndex
                                                ? optIndex === question.correctOptionIndex
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                : 'bg-white/10 text-white/60'
                                                }`}>
                                                {String.fromCharCode(65 + optIndex)}
                                            </div>
                                            <span className="text-white/80">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {quizScore !== null && (
                                <div className={`mt-3 p-3 rounded-lg ${question.correctOptionIndex === quizAnswers[index]
                                    ? 'bg-green-500/10 border border-green-500/20'
                                    : 'bg-red-500/10 border border-red-500/20'
                                    }`}>
                                    <p className="text-sm font-medium text-white mb-1">
                                        {question.correctOptionIndex === quizAnswers[index] ? '✓ Correct!' : '✗ Incorrect'}
                                    </p>
                                    <p className="text-white/70 text-xs">{question.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                    {quizScore === null ? (
                        <button
                            onClick={handleQuizSubmit}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all"
                        >
                            Submit Answers
                        </button>
                    ) : (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">
                                {quizScore.percentage}%
                            </div>
                            <p className="text-white/70">
                                You got {quizScore.correct} out of {quizScore.total} questions correct
                            </p>
                            <button
                                onClick={() => setQuizScore(null)}
                                className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Retry Quiz
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }, [assessments, quizAnswers, quizScore]);

    const StatisticsPanel = useMemo(() => {
        return (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> Learning Statistics
                </h3>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm text-white/70 mb-1">
                            <span>Course Progress</span>
                            <span>{completionPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-3 rounded-lg">
                            <div className="text-white/50 text-xs">Time Spent</div>
                            <div className="text-white text-lg font-semibold">{formatTime(timeSpent)}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg">
                            <div className="text-white/50 text-xs">Slides Viewed</div>
                            <div className="text-white text-lg font-semibold">
                                {completedSlides.size}/{slides.length}
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg">
                            <div className="text-white/50 text-xs">Bookmarks</div>
                            <div className="text-white text-lg font-semibold">{bookmarks.length}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg">
                            <div className="text-white/50 text-xs">Notes Taken</div>
                            <div className="text-white text-lg font-semibold">
                                {Object.values(userNotes).flat().length}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Quick Actions</h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigator.clipboard.writeText(window.location.href)}
                                className="flex-1 bg-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Copy className="w-4 h-4" /> Copy Link
                            </button>
                            <button
                                onClick={() => {/* Export logic */ }}
                                className="flex-1 bg-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Export Notes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [completionPercentage, timeSpent, completedSlides.size, slides.length, bookmarks.length, userNotes]);

    return (
        <div ref={containerRef} className="w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative aspect-video">
            <audio ref={audioRef} src={audioStreamUrl} onEnded={handleAudioEnded} className="hidden" />

            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"></div>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="absolute inset-0 flex">
                {/* Left - Avatar & Controls */}
                <div className="w-1/5 flex flex-col items-center justify-between p-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className={`absolute w-32 h-32 rounded-full transition-all duration-500 ${isAudioPlaying ? 'bg-blue-500/40 scale-110 animate-pulse' : 'bg-blue-500/10'
                            }`} style={{ filter: 'blur(30px)' }}></div>

                        <div className="relative">
                            <div className={`relative transition-all duration-300 ${isAudioPlaying ? 'scale-105' : ''}`}>
                                <div className={`absolute -inset-1.5 rounded-full transition-all ${isAudioPlaying ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-spin-slow opacity-70'
                                    : 'bg-gray-600/50'
                                    }`} style={{ animationDuration: '3s' }}></div>

                                <Avatar type="video" isTalking={isAudioPlaying}
                                    className="relative w-20 h-20 rounded-full border-2 border-white/20 shadow-xl" />
                            </div>

                            <div className="mt-2 text-center">
                                <div className="bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                                    <p className="text-white text-xs">Instructor</p>
                                </div>
                            </div>

                            {isAudioPlaying && (
                                <div className="mt-2 flex items-center justify-center space-x-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-0.5 bg-cyan-400 rounded-full animate-bounce"
                                            style={{ height: `${6 + Math.random() * 6}px`, animationDelay: `${i * 100}ms` }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Controls */}
                    <div className="w-full space-y-3">
                        <button
                            onClick={() => setShowProgressChart(!showProgressChart)}
                            className="w-full bg-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-xs">Stats</span>
                        </button>

                        <button
                            onClick={toggleBookmark}
                            className={`w-full p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${bookmarks.includes(currentSlide)
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                                }`}
                        >
                            <Bookmark className="w-4 h-4" />
                            <span className="text-xs">Bookmark</span>
                        </button>

                        <button
                            onClick={saveNote}
                            className="w-full bg-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Lightbulb className="w-4 h-4" />
                            <span className="text-xs">Add Note</span>
                        </button>
                    </div>
                </div>

                {/* Center - Content Area */}
                <div className={`${showSlidePanel ? 'w-2/5' : 'w-3/5'} ${showNotesPanel ? 'w-2/5' : ''} p-4 flex flex-col transition-all duration-300`}>
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 mb-4 bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'content'
                                ? 'bg-blue-500 text-white shadow'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <BookOpen className="w-4 h-4 inline-block mr-2" />
                            Content
                        </button>

                        {examples.length > 0 && (
                            <button
                                onClick={() => setActiveTab('examples')}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'examples'
                                    ? 'bg-green-500 text-white shadow'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Code className="w-4 h-4 inline-block mr-2" />
                                Examples
                            </button>
                        )}

                        {assessments.length > 0 && (
                            <button
                                onClick={() => setActiveTab('quiz')}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'quiz'
                                    ? 'bg-orange-500 text-white shadow'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Target className="w-4 h-4 inline-block mr-2" />
                                Quiz
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-xl overflow-hidden">
                        {activeTab === 'content' && SlideContent}
                        {activeTab === 'examples' && examples.length > 0 && (
                            <div className="h-full overflow-y-auto">
                                <div className="space-y-4">
                                    {examples.map(example => (
                                        <div key={example.id} className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/30">
                                            <h3 className="text-lg font-semibold text-white mb-2">{example.title}</h3>
                                            <p className="text-white/80 text-sm mb-3">{example.description}</p>
                                            {example.codeExample && (
                                                <pre className="bg-black/50 rounded p-3 text-xs font-mono text-emerald-300 overflow-x-auto">
                                                    <code>{example.codeExample}</code>
                                                </pre>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'quiz' && QuizComponent}
                    </div>
                </div>

                {/* Right Panels */}
                <div className={`${showSlidePanel ? 'w-1/5' : 'w-0'} ${showNotesPanel ? 'w-1/5' : ''} transition-all duration-300 overflow-hidden flex flex-col`}>
                    {/* Slide Panel */}
                    {showSlidePanel && (
                        <div className="flex-1 flex flex-col p-3 pr-0">
                            <div className="flex items-center justify-between mb-2 pr-2">
                                <div className="flex items-center space-x-1.5 text-white/80">
                                    <Layers className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">Slides</span>
                                </div>
                                <span className="text-xs text-white/50">{slides.length} total</span>
                            </div>

                            <div ref={slidePanelRef} className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {slides.map((slide, index) => (
                                    <button
                                        key={index}
                                        data-slide={index}
                                        onClick={() => handleSlideClick(index)}
                                        className={`w-full text-left p-2 rounded-lg border transition-all group ${index === currentSlide
                                            ? 'bg-blue-500/30 border-blue-400/50 ring-1 ring-blue-400/30'
                                            : index < currentSlide
                                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-start space-x-2">
                                            <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${index === currentSlide
                                                ? 'bg-blue-500 text-white'
                                                : index < currentSlide
                                                    ? 'bg-green-500/30 text-green-400'
                                                    : 'bg-white/10 text-white/60'
                                                }`}>
                                                {index < currentSlide ? '✓' : index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium truncate ${index === currentSlide ? 'text-white' : 'text-white/70'
                                                    }`}>
                                                    {slide.title}
                                                </p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {slide.hasDiagram && (
                                                        <span className="text-[10px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">D</span>
                                                    )}
                                                    {slide.hasExample && (
                                                        <span className="text-[10px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded">E</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {index === currentSlide && isPlaying && (
                                            <div className="mt-1.5 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-400 rounded-full transition-all duration-150"
                                                    style={{ width: `${speechProgress}%` }} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes Panel */}
                    {showNotesPanel && (
                        <div className="flex-1 flex flex-col p-3 border-l border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-1.5 text-white/80">
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">Notes</span>
                                </div>
                                <span className="text-xs text-white/50">
                                    {Object.values(userNotes).flat().length} notes
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2">
                                {userNotes[currentSlide]?.map((note, idx) => (
                                    <div key={idx} className="bg-amber-900/20 rounded-lg p-2 border border-amber-700/30">
                                        <p className="text-white/80 text-xs">{note.text}</p>
                                        <p className="text-white/50 text-[10px] mt-1">
                                            {new Date(note.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistics Panel Overlay */}
                {showProgressChart && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96 z-30">
                        {StatisticsPanel}
                    </div>
                )}
            </div>

            {/* Advanced Controls */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                {/* Playback Rate */}
                <div className="relative group">
                    <button className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white/70 hover:text-white transition-all text-xs">
                        {playbackRate}x
                    </button>
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                        <div className="p-2 space-y-1">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                <button
                                    key={rate}
                                    onClick={() => setPlaybackRate(rate)}
                                    className={`block w-full text-left px-3 py-1 rounded text-sm ${playbackRate === rate
                                        ? 'bg-blue-500 text-white'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {rate}x speed
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Voice Selection */}
                {voices.length > 0 && useTTS && (
                    <div className="relative group">
                        <button className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white/70 hover:text-white transition-all text-xs">
                            Voice
                        </button>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                            <div className="p-2 space-y-1">
                                {voices.map((voice, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVoice(voice.name)}
                                        className={`block w-full text-left px-3 py-1 rounded text-sm truncate ${selectedVoice === voice.name
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {voice.name.replace('Microsoft', 'MS').replace('Google', 'G')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings */}
                <button
                    onClick={() => setShowDiagrams(!showDiagrams)}
                    className={`p-1.5 rounded-lg transition-all ${showDiagrams ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/70 hover:text-white'
                        }`}
                    title="Toggle Diagrams"
                >
                    <Database className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setShowNotesPanel(!showNotesPanel)}
                    className={`p-1.5 rounded-lg transition-all ${showNotesPanel ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/70 hover:text-white'
                        }`}
                    title="Toggle Notes"
                >
                    <Lightbulb className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setShowSlidePanel(!showSlidePanel)}
                    className="p-1.5 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                >
                    {showSlidePanel ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-3 px-4">
                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden group relative"
                        onClick={(e) => {
                            window.speechSynthesis.cancel();
                            setHighlightedCharIndex(-1);
                            setSpeechProgress(0);
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = (e.clientX - rect.left) / rect.width;
                            setCurrentSlide(Math.min(Math.max(0, Math.floor(pct * slides.length)), slides.length - 1));
                        }}>
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${overallProgress}%` }} />

                        {/* Slide markers */}
                        {slides.map((_, index) => (
                            <div key={index}
                                className={`absolute top-1/2 -translate-y-1/2 w-1 h-3 rounded-full transition-all ${index <= currentSlide ? 'bg-cyan-300' : 'bg-white/40'
                                    } ${bookmarks.includes(index) ? 'ring-1 ring-yellow-400 ring-offset-1' : ''}`}
                                style={{ left: `${(index / slides.length) * 100}%` }}
                                title={bookmarks.includes(index) ? 'Bookmarked' : ''}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between mt-2 text-xs text-white/50">
                        <div className="flex items-center gap-4">
                            <span>Slide {currentSlide + 1}/{slides.length}</span>
                            <span>{Math.round(overallProgress)}% complete</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(timeSpent)}</span>
                        </div>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button onClick={handleReset}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Restart Course">
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        <button onClick={() => handleSlideChange('prev')} disabled={currentSlide === 0}
                            className="p-2 text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30"
                            title="Previous Slide">
                            <SkipBack className="w-5 h-5" />
                        </button>

                        <button onClick={handlePlayPause}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isPlaying ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                }`}
                            title={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? <Pause className="w-5 h-5 text-white fill-current" /> : <Play className="w-5 h-5 text-white fill-current ml-0.5" />}
                        </button>

                        <button onClick={() => handleSlideChange('next')} disabled={currentSlide === slides.length - 1}
                            className="p-2 text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30"
                            title="Next Slide">
                            <SkipForward className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        {isAudioPlaying && (
                            <div className="flex items-center space-x-1 text-cyan-400 text-xs animate-pulse">
                                <Volume2 className="w-4 h-4" />
                                <span>{speechProgress}%</span>
                            </div>
                        )}

                        <button onClick={() => setIsMuted(!isMuted)}
                            className={`p-2 rounded-lg transition-all ${isMuted ? 'text-red-400 bg-red-500/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                            title={isMuted ? 'Unmute' : 'Mute'}>
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        <button onClick={() => {/* Share functionality */ }}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Share Course">
                            <Share2 className="w-5 h-5" />
                        </button>

                        <button onClick={() => {/* Settings modal */ }}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Settings">
                            <Settings className="w-5 h-5" />
                        </button>

                        <button onClick={() => {/* Fullscreen logic */ }}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Fullscreen">
                            <Maximize2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Start Overlay */}
            {!hasStarted && slides.length > 0 && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/20 shadow-2xl max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl">
                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Ready to Learn?</h2>
                        <p className="text-white/70 mb-6">
                            This course contains {slides.length} slides with interactive content
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 p-3 rounded-lg">
                                <div className="text-cyan-400 text-sm">Duration</div>
                                <div className="text-white font-semibold">~{Math.round(slides.reduce((a, b) => a + b.duration, 0) / 60)} min</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <div className="text-cyan-400 text-sm">Sections</div>
                                <div className="text-white font-semibold">{slides.length}</div>
                            </div>
                        </div>

                        <button
                            onClick={handlePlayPause}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all text-lg"
                        >
                            Start Learning
                        </button>

                        <button
                            onClick={() => setShowProgressChart(true)}
                            className="w-full mt-3 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                        >
                            View course details
                        </button>
                    </div>
                </div>
            )}

            {/* Completion Overlay */}
            {currentSlide === slides.length - 1 && !isPlaying && overallProgress >= 99 && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-green-900/30 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="text-center p-8 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl">
                            <Check className="w-10 h-10 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Course Completed! 🎉</h2>
                        <p className="text-white/70 mb-6">
                            You've successfully completed all {slides.length} slides
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <div className="text-emerald-400 text-sm mb-1">Time Spent</div>
                                <div className="text-white text-xl font-bold">{formatTime(timeSpent)}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <div className="text-cyan-400 text-sm">Bookmarks</div>
                                    <div className="text-white font-semibold">{bookmarks.length}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <div className="text-cyan-400 text-sm">Notes</div>
                                    <div className="text-white font-semibold">{Object.values(userNotes).flat().length}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleReset}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-all"
                            >
                                Review Again
                            </button>
                            {assessments.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('quiz')}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all"
                                >
                                    Take Quiz
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add CSS for custom scrollbar and animations
const styles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.1);
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  
  .mermaid-diagram svg {
    width: 100%;
    height: auto;
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  .prose {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .prose p {
    margin-bottom: 1rem;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}