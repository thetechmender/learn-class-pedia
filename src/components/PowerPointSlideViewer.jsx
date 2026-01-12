import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2, X, BookOpen, Volume2, VolumeX, SkipForward } from 'lucide-react';

export default function PowerPointSlideViewer({ lessonText }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideAnimation, setSlideAnimation] = useState('');
  const [autoPlayInterval, setAutoPlayInterval] = useState(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVoice, setSpeechVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const slideRef = useRef(null);
  const speechSynthRef = useRef(null);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Try to find a good default voice (English, female if available)
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        setSpeechVoice(preferredVoice);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Text-to-speech functionality
  const speakSlideContent = (slideContent, title) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const textToSpeak = `${title}. ${slideContent}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    if (speechVoice) {
      utterance.voice = speechVoice;
    }

    utterance.onstart = () => setIsNarrating(true);
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  };

  const skipSpeech = () => {
    stopSpeech();
    if (currentSlide < slides.length - 1) {
      nextSlide();
    }
  };
  // Animation types for different slides
  const animations = [
    'slideInRight',
    'slideInLeft', 
    'fadeIn',
    'slideInUp',
    'slideInDown',
    'zoomIn',
    'flipInX',
    'bounceIn'
  ];

  useEffect(() => {
    if (lessonText) {
      // Enhanced text processing for educational slides
      let processedSlides = [];
      
      // First try to split by double line breaks (paragraphs)
      const paragraphs = lessonText
        .split(/\n\s*\n/)
        .filter(p => p.trim().length > 0)
        .map(p => p.trim());
      
      if (paragraphs.length > 1) {
        processedSlides = paragraphs.map((paragraph, index) => ({
          id: index,
          content: paragraph,
          title: extractTitle(paragraph),
          bulletPoints: extractBulletPoints(paragraph),
          type: determinSlideType(paragraph)
        }));
      } else {
        // Split by sentences and group them
        const sentences = lessonText
          .split(/[.!?]+/)
          .filter(s => s.trim().length > 15)
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        // Group sentences into slides
        let currentSlideContent = '';
        let slideIndex = 0;
        
        sentences.forEach((sentence, index) => {
          if (currentSlideContent.length + sentence.length < 400) {
            currentSlideContent += (currentSlideContent ? '. ' : '') + sentence;
          } else {
            if (currentSlideContent) {
              processedSlides.push({
                id: slideIndex++,
                content: currentSlideContent + '.',
                title: `Key Point ${slideIndex}`,
                bulletPoints: [currentSlideContent + '.'],
                type: 'content'
              });
            }
            currentSlideContent = sentence;
          }
        });
        
        if (currentSlideContent) {
          processedSlides.push({
            id: slideIndex,
            content: currentSlideContent + '.',
            title: `Key Point ${slideIndex + 1}`,
            bulletPoints: [currentSlideContent + '.'],
            type: 'content'
          });
        }
      }
      
      // Add title slide
      if (processedSlides.length > 0) {
        processedSlides.unshift({
          id: -1,
          content: 'Welcome to the Lesson',
          title: 'Lesson Overview',
          bulletPoints: [`${processedSlides.length} key topics to cover`],
          type: 'title'
        });
      }
      
      setSlides(processedSlides);
    }
  }, [lessonText]);

  // Helper functions for slide processing
  const extractTitle = (text) => {
    const firstSentence = text.split(/[.!?]/)[0];
    return firstSentence.length > 50 ? 'Key Learning Point' : firstSentence;
  };

  const extractBulletPoints = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 4).map(s => s.trim());
  };

  const determinSlideType = (text) => {
    if (text.includes('?')) return 'question';
    if (text.includes('example') || text.includes('for instance')) return 'example';
    if (text.includes('important') || text.includes('key')) return 'important';
    return 'content';
  };

  // Auto-play functionality with audio narration
  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      const currentSlideData = slides[currentSlide];
      
      // Start narration for current slide
      if (audioEnabled && currentSlideData) {
        const slideText = currentSlideData.bulletPoints.join('. ');
        speakSlideContent(slideText, currentSlideData.title);
      }

      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev < slides.length - 1) {
            triggerSlideAnimation();
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, audioEnabled ? 8000 : 6000); // Longer duration when audio is enabled

      setAutoPlayInterval(interval);
      return () => {
        clearInterval(interval);
        stopSpeech();
      };
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
      stopSpeech();
    }
  }, [isPlaying, slides.length, currentSlide, audioEnabled]);

  // Handle slide changes for manual navigation
  useEffect(() => {
    if (!isPlaying && audioEnabled && slides.length > 0) {
      const currentSlideData = slides[currentSlide];
      if (currentSlideData) {
        // Small delay to let slide animation start
        setTimeout(() => {
          const slideText = currentSlideData.bulletPoints.join('. ');
          speakSlideContent(slideText, currentSlideData.title);
        }, 500);
      }
    }
  }, [currentSlide, audioEnabled]);

  const triggerSlideAnimation = () => {
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    setSlideAnimation(randomAnimation);
    setTimeout(() => setSlideAnimation(''), 800);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      stopSpeech();
      triggerSlideAnimation();
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      stopSpeech();
      triggerSlideAnimation();
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    stopSpeech();
    triggerSlideAnimation();
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    if (isPlaying) {
      stopSpeech();
    }
    setIsPlaying(!isPlaying);
  };

  const resetSlides = () => {
    stopSpeech();
    setCurrentSlide(0);
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      stopSpeech();
    }
    setAudioEnabled(!audioEnabled);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getSlideTheme = (slide) => {
    switch (slide.type) {
      case 'title':
        return 'bg-gradient-to-br from-blue-600 to-purple-700 text-white';
      case 'question':
        return 'bg-gradient-to-br from-green-500 to-teal-600 text-white';
      case 'example':
        return 'bg-gradient-to-br from-orange-500 to-red-600 text-white';
      case 'important':
        return 'bg-gradient-to-br from-red-500 to-pink-600 text-white';
      default:
        return 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white';
    }
  };

  if (!lessonText || slides.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No lesson content available for presentation</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  const SlideContent = ({ slide, isFullscreen = false }) => (
    <div className={`
      ${getSlideTheme(slide)} 
      ${isFullscreen ? 'h-screen' : 'h-96'} 
      rounded-lg flex flex-col justify-center items-center p-8 relative overflow-hidden
      ${slideAnimation ? `animate-${slideAnimation}` : ''}
    `}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
      
      {/* Slide number and audio indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className="text-white opacity-70 text-sm">
          {currentSlide + 1} / {slides.length}
        </div>
        {isNarrating && (
          <div className="flex items-center space-x-1 bg-black bg-opacity-30 rounded-full px-2 py-1">
            <Volume2 className="h-3 w-3 text-white animate-pulse" />
            <span className="text-white text-xs">Speaking</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="text-center max-w-4xl">
        <h1 className={`font-bold mb-6 ${isFullscreen ? 'text-6xl' : 'text-3xl'}`}>
          {slide.title}
        </h1>
        
        {slide.type === 'title' ? (
          <div className={`${isFullscreen ? 'text-2xl' : 'text-lg'} opacity-90`}>
            <p className="mb-4">Interactive Learning Experience</p>
            <div className="flex justify-center space-x-8 mt-8">
              <div className="text-center">
                <div className={`${isFullscreen ? 'text-4xl' : 'text-2xl'} font-bold`}>
                  {slides.length - 1}
                </div>
                <div className="text-sm opacity-75">Topics</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {slide.bulletPoints.map((point, index) => (
              <div 
                key={index}
                className={`
                  flex items-start space-x-3 
                  ${isFullscreen ? 'text-xl' : 'text-base'}
                  animate-fadeInUp
                `}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`
                  ${isFullscreen ? 'w-3 h-3 mt-2' : 'w-2 h-2 mt-1.5'} 
                  bg-white rounded-full flex-shrink-0
                `}></div>
                <p className="text-left leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Slide type indicator */}
      <div className="absolute bottom-4 left-4 text-white opacity-50 text-xs uppercase tracking-wide">
        {slide.type}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Interactive Lesson Presentation
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                Slide {currentSlide + 1} of {slides.length}
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-200 transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Display */}
        <div className="relative">
          <SlideContent slide={currentSlideData} />
          
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAutoPlay}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isPlaying 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>
              
              <button
                onClick={resetSlides}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>

              <button
                onClick={toggleAudio}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  audioEnabled 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-400 text-white hover:bg-gray-500'
                }`}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>{audioEnabled ? 'Audio On' : 'Audio Off'}</span>
              </button>

              {isNarrating && (
                <button
                  onClick={skipSpeech}
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <SkipForward className="h-4 w-4" />
                  <span>Skip</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {Math.round(((currentSlide + 1) / slides.length) * 100)}% Complete
              </div>
              
              {audioEnabled && availableVoices.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Voice:</label>
                  <select
                    value={speechVoice?.name || ''}
                    onChange={(e) => {
                      const voice = availableVoices.find(v => v.name === e.target.value);
                      setSpeechVoice(voice);
                    }}
                    className="text-xs border rounded px-2 py-1"
                  >
                    {availableVoices
                      .filter(voice => voice.lang.startsWith('en'))
                      .map(voice => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name.split(' ')[0]}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {audioEnabled && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Speed:</label>
                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Slide Thumbnails */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`
                  flex-shrink-0 w-20 h-12 rounded border-2 transition-all text-xs p-1 overflow-hidden
                  ${currentSlide === index 
                    ? 'border-indigo-500 ring-2 ring-indigo-200' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${getSlideTheme(slide)}
                `}
              >
                <div className="text-white text-center">
                  <div className="font-bold text-xs truncate">{slide.title}</div>
                  <div className="text-xs opacity-75">{index + 1}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="w-full max-w-6xl">
              <SlideContent slide={currentSlideData} isFullscreen={true} />
            </div>
          </div>
          
          {/* Fullscreen Navigation */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          {/* Fullscreen Progress */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
            <div className="flex items-center space-x-4 mb-2">
              <div>Slide {currentSlide + 1} of {slides.length}</div>
              {isNarrating && (
                <div className="flex items-center space-x-1 bg-black bg-opacity-50 rounded-full px-3 py-1">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Speaking</span>
                </div>
              )}
            </div>
            <div className="w-64 bg-white bg-opacity-30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes flipInX {
          from { transform: perspective(400px) rotateX(90deg); opacity: 0; }
          to { transform: perspective(400px) rotateX(0deg); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.8s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.8s ease-out; }
        .animate-slideInDown { animation: slideInDown 0.8s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.8s ease-out; }
        .animate-flipInX { animation: flipInX 0.8s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.8s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </>
  );
}