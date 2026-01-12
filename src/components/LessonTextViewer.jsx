import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, 
  Volume2, VolumeX, BookOpen, FileText, Sparkles,
  GraduationCap, Clock
} from 'lucide-react';

export default function LessonTextViewer({ lessonText }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // TTS State
  const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1);
  const [voices, setVoices] = useState([]);
  const [speechProgress, setSpeechProgress] = useState(0); // 0-100 progress within current slide
  const [totalTextLength, setTotalTextLength] = useState(0);
  const contentRef = useRef(null);

  // Text Processing - Enhanced for slide-based content
  useEffect(() => {
    if (lessonText) {
      const cleanText = lessonText
        .replace(/\*\*/g, '')
        .replace(/##/g, '')
        .replace(/#/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

      const slideMarkers = cleanText.match(/\[SLIDE\s*\d*[:\]]/gi);
      let processedSlides = [];

      if (slideMarkers && slideMarkers.length > 0) {
        const slidesSplit = cleanText.split(/\[SLIDE[^\]]*\]/i);
        if (slidesSplit[0].trim() === '') slidesSplit.shift();

        slidesSplit.forEach((slideContent, index) => {
          const trimmedContent = slideContent.trim();
          if (trimmedContent) {
            const lines = trimmedContent.split('\n').map(line => line.trim()).filter(line => line);
            let title = '';
            let content = [];
            
            for (const line of lines) {
              if (line.match(/^-?\s*title\s*:/i)) {
                title = line.replace(/^-?\s*title\s*:\s*/i, '').trim();
              } else if (line.match(/^-?\s*(objective|agenda|benefits|applications|takeaways|reading)\s*:/i)) {
                content.push(`**${line.replace(/^-?\s*/, '')}**`);
              } else if (line.startsWith('- ') || line.startsWith('• ')) {
                content.push(line);
              } else if (line.length > 0) {
                content.push(line);
              }
            }

            processedSlides.push({
              title: title || `Slide ${index + 1}`,
              content: content.join('\n'),
              slideNumber: index + 1
            });
          }
        });
      } else {
        const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0).map(p => p.trim());
        paragraphs.forEach((paragraph, index) => {
          processedSlides.push({
            title: `Section ${index + 1}`,
            content: paragraph,
            slideNumber: index + 1
          });
        });
      }
      
      setSlides(processedSlides.filter(s => s.content && s.content.length > 0));
    }
  }, [lessonText]);

  // Load Voices
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // TTS Logic
  useEffect(() => {
    if (!isPlaying || isMuted) {
      window.speechSynthesis.cancel();
      setHighlightedCharIndex(-1);
      setSpeechProgress(0);
      return;
    }

    const currentSlideData = slides[currentSlide];
    if (!currentSlideData) return;

    let ttsContent = currentSlideData.content
      .replace(/\*\*/g, '').replace(/##/g, '').replace(/#/g, '')
      .replace(/^[-•]\s*/gm, '')
      .replace(/^(Visual|Diagram|Flowchart|Chart|Image|Loading|Title|Slide):\s*/gim, '')
      .replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

    const title = currentSlideData.title;
    const isGenericTitle = /^(Slide|Section)\s*\d+/i.test(title);
    
    let text = !isGenericTitle && title ? `${title}. ${ttsContent}` : ttsContent;
    if (!text || text.trim() === '' || text.trim() === '.') return;

    // Store total text length for progress calculation
    setTotalTextLength(text.length);
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.replace(/_/g, ' '));
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en')) ||
      voices.find(v => v.lang.includes('en-US')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setHighlightedCharIndex(event.charIndex);
        // Calculate speech progress percentage
        const progress = Math.min(100, Math.round((event.charIndex / text.length) * 100));
        setSpeechProgress(progress);
      }
    };

    utterance.onend = () => {
      setHighlightedCharIndex(-1);
      setSpeechProgress(100);
      if (currentSlide < slides.length - 1) {
        setTimeout(() => {
          setSpeechProgress(0);
          setCurrentSlide(prev => prev + 1);
        }, 500);
      } else {
        setIsPlaying(false);
      }
    };

    const timeout = setTimeout(() => window.speechSynthesis.speak(utterance), 200);
    return () => { clearTimeout(timeout); window.speechSynthesis.cancel(); };
  }, [isPlaying, currentSlide, slides, voices, isMuted]);

  // Render slide content with highlighting
  const renderSlideContent = useMemo(() => {
    const currentSlideData = slides[currentSlide];
    if (!currentSlideData) return null;

    const titleText = currentSlideData.title;
    const contentText = currentSlideData.content;
    const isGenericTitle = /^(Slide|Section)\s*\d+/i.test(titleText);
    const titleLength = isGenericTitle ? 0 : titleText.length + 2;

    const renderHighlightedText = (text, startOffset = 0, isTitle = false) => {
      const words = text.split(/(\s+)/);
      let localCharCount = startOffset;

      return words.map((word, i) => {
        const start = localCharCount;
        const end = localCharCount + word.length;
        localCharCount = end;
        const isCurrent = highlightedCharIndex >= start && highlightedCharIndex < end && word.trim().length > 0;
        const isPast = end <= highlightedCharIndex;

        return (
          <span
            key={i}
            className={`transition-all duration-150 ${
              isCurrent
                ? 'bg-gradient-to-r from-yellow-300 to-amber-300 text-gray-900 font-semibold px-1.5 py-0.5 rounded-md shadow-md scale-105 inline-block'
                : isPast
                  ? isTitle ? 'text-blue-400' : 'text-gray-400'
                  : isTitle ? 'text-gray-800' : 'text-gray-700'
            }`}
          >
            {word}
          </span>
        );
      });
    };

    const formatContent = (text) => {
      const lines = text.split('\n').filter(line => line.trim());
      return lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.match(/^\*\*.*\*\*$/)) {
          return (
            <div key={index} className="mb-4 mt-6 first:mt-0">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-blue-700 font-semibold text-lg">{trimmedLine.replace(/\*\*/g, '')}</span>
              </div>
            </div>
          );
        }
        
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
          return (
            <div key={index} className="flex items-start mb-3 ml-2 group">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 mr-3 group-hover:scale-125 transition-transform"></div>
              <span className="text-gray-700 leading-relaxed">{trimmedLine.replace(/^[-•]\s*/, '')}</span>
            </div>
          );
        }
        
        return <p key={index} className="text-gray-700 leading-relaxed mb-3">{trimmedLine}</p>;
      });
    };

    const isHighlighting = highlightedCharIndex >= 0 && isPlaying && !isMuted;

    return (
      <div className="h-full flex flex-col">
        {/* Title Section */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
            {!isGenericTitle && isHighlighting && highlightedCharIndex < titleLength
              ? renderHighlightedText(titleText, 0, true)
              : <span className={!isGenericTitle && isHighlighting && highlightedCharIndex >= titleLength ? 'text-blue-400' : 'text-gray-800'}>{titleText}</span>
            }
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1 rounded-full">
              <FileText className="h-3.5 w-3.5" />
              <span>Slide {currentSlideData.slideNumber} of {slides.length}</span>
            </div>
            {isPlaying && !isMuted && (
              <div className="flex items-center space-x-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>Speaking</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto text-lg leading-relaxed pr-2" ref={contentRef}>
          {isHighlighting && highlightedCharIndex >= titleLength
            ? <div>{renderHighlightedText(contentText.replace(/\*\*/g, '').replace(/^[-•]\s*/gm, ''), titleLength)}</div>
            : <div>{formatContent(contentText)}</div>
          }
        </div>
      </div>
    );
  }, [slides, currentSlide, highlightedCharIndex, isPlaying, isMuted]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    } else {
      setSpeechProgress(0);
      setIsPlaying(true);
    }
  };

  const handleSlideChange = (direction) => {
    window.speechSynthesis.cancel();
    setHighlightedCharIndex(-1);
    setSpeechProgress(0);
    setCurrentSlide(prev => direction === 'prev' 
      ? Math.max(0, prev - 1) 
      : Math.min(slides.length - 1, prev + 1));
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setHighlightedCharIndex(-1);
    setSpeechProgress(0);
    setCurrentSlide(0);
    setIsPlaying(false);
  };

  // Calculate overall progress (slides + current speech)
  const slideProgress = slides.length > 0 ? (currentSlide / slides.length) * 100 : 0;
  const currentSlideContribution = slides.length > 0 ? (speechProgress / 100) * (100 / slides.length) : 0;
  const overallProgress = slideProgress + currentSlideContribution;
  
  const estimatedTime = Math.ceil(slides.length * 0.5); // ~30 sec per slide

  if (!lessonText || slides.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No lesson content available</p>
        <p className="text-gray-400 text-sm mt-1">Content will appear here once generated</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Interactive Lesson</h3>
              <div className="flex items-center space-x-2 text-blue-200 text-xs">
                <Clock className="h-3 w-3" />
                <span>~{estimatedTime} min</span>
                <span>•</span>
                <span>{slides.length} slides</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-all ${
                isMuted 
                  ? 'bg-red-500/20 text-red-300' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Status Badge */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isPlaying && !isMuted
                ? 'bg-green-500/20 text-green-300'
                : 'bg-white/10 text-white/80'
            }`}>
              {isPlaying && !isMuted ? (
                <>
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" />
                  <span>Ready</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        {/* Teacher Avatar Section */}
        <div className="flex items-start p-6 gap-6">
          {/* Avatar */}
          <div className="hidden md:flex flex-col items-center">
            <div className={`relative transition-all duration-300 ${isPlaying && !isMuted ? 'scale-105' : ''}`}>
              {/* Glow effect */}
              <div className={`absolute -inset-2 rounded-full transition-all duration-500 ${
                isPlaying && !isMuted 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 animate-pulse blur-md' 
                  : 'bg-gray-200 opacity-30'
              }`}></div>
              
              {/* Avatar circle */}
              <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 transition-all ${
                isPlaying && !isMuted 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-300' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 border-gray-300'
              }`}>
                <span className="text-3xl">🎓</span>
              </div>
            </div>

            {/* Speaking indicator */}
            {isPlaying && !isMuted && (
              <div className="mt-3 flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-blue-500 rounded-full animate-bounce"
                    style={{ 
                      height: `${8 + Math.random() * 8}px`,
                      animationDelay: `${i * 100}ms` 
                    }}
                  ></div>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500 font-medium">AI Teacher</p>
          </div>

          {/* Content Panel */}
          <div className="flex-1 min-h-[350px] bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-inner">
            {renderSlideContent}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        {/* Dual Progress Bars */}
        <div className="mb-4 space-y-3">
          {/* Overall Slide Progress */}
          <div>
            <div className="flex justify-between mb-1 text-xs text-gray-500">
              <span className="font-medium">Course Progress</span>
              <span>{Math.round(overallProgress)}% complete</span>
            </div>
            <div 
              className="w-full h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden group"
              onClick={(e) => {
                window.speechSynthesis.cancel();
                setHighlightedCharIndex(-1);
                setSpeechProgress(0);
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setCurrentSlide(Math.min(Math.max(0, Math.floor(pct * slides.length)), slides.length - 1));
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 relative"
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity -mr-2"></div>
              </div>
            </div>
            
            {/* Slide markers */}
            <div className="relative h-1 mt-1">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`absolute w-1 h-1 rounded-full transition-colors ${
                    index < currentSlide ? 'bg-blue-500' : index === currentSlide ? 'bg-blue-400' : 'bg-gray-300'
                  }`}
                  style={{ left: `${(index / slides.length) * 100}%` }}
                  title={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Current Slide Speech Progress */}
          {isPlaying && !isMuted && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex justify-between mb-1.5 text-xs">
                <span className="text-blue-700 font-medium flex items-center">
                  <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
                  Reading Slide {currentSlide + 1}
                </span>
                <span className="text-blue-600">{speechProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-150"
                  style={{ width: `${speechProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Main Controls */}
          <div className="flex items-center space-x-3">
            {/* Previous */}
            <button
              onClick={() => handleSlideChange('prev')}
              disabled={currentSlide === 0}
              className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${
                isPlaying
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              {isPlaying 
                ? <Pause className="h-6 w-6 text-white fill-current" /> 
                : <Play className="h-6 w-6 text-white fill-current ml-1" />
              }
            </button>

            {/* Next */}
            <button
              onClick={() => handleSlideChange('next')}
              disabled={currentSlide === slides.length - 1}
              className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Slide Counter */}
          <div className="text-sm text-gray-500 font-mono">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>

      {/* Start Overlay */}
      {/* {!isPlaying && currentSlide === 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
          <button
            onClick={handlePlayPause}
            className="group flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-10 h-10 text-white fill-current ml-1" />
            </div>
            <p className="mt-4 text-gray-800 font-semibold text-lg">Start Learning</p>
            <p className="text-gray-500 text-sm">{slides.length} slides • ~{estimatedTime} min</p>
          </button>
        </div>
      )} */}
    </div>
  );
}
