import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function SlideViewer({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [slideUrls, setSlideUrls] = useState({});

  useEffect(() => {
    if (slides && slides.length > 0) {
      const urls = {};
      slides.forEach(slide => {
        urls[slide.id] = apiService.getImageStreamUrl(slide.id);
      });
      setSlideUrls(urls);
    }
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">No slides available</p>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageError = (slideIndex) => {
    setImageErrors(prev => new Set([...prev, slideIndex]));
  };

  const currentSlideData = slides[currentSlide];
  const hasImageError = imageErrors.has(currentSlide);
  const currentImageUrl = slideUrls[currentSlideData?.id];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Slide Header */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
          <h3 className="font-medium text-gray-900">
            Course Slides ({slides.length} slides)
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {currentSlide + 1} of {slides.length}
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="relative">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            {hasImageError ? (
              <div className="text-center p-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Failed to load slide {currentSlide + 1}</p>
                <p className="text-xs text-gray-500">ID: {currentSlideData?.id}</p>
              </div>
            ) : (
              <img
                src={currentImageUrl}
                alt={`Slide ${currentSlideData.sequence}`}
                className="max-w-full max-h-full object-contain"
                onError={() => handleImageError(currentSlide)}
                crossOrigin="anonymous"
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                disabled={currentSlide === slides.length - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Slide Info */}
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Sequence: {currentSlideData.sequence}</span>
            <span>ID: {currentSlideData.id}</span>
          </div>
        </div>

        {/* Slide Thumbnails */}
        {slides.length > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2 overflow-x-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all ${
                    currentSlide === index
                      ? 'border-primary-600 ring-2 ring-primary-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {imageErrors.has(index) ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={slideUrls[slide.id]}
                      alt={`Slide ${slide.sequence}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(index)}
                      crossOrigin="anonymous"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            {hasImageError ? (
              <div className="text-center p-16 text-white">
                <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                <p className="text-xl">Failed to load slide {currentSlide + 1}</p>
                <p className="text-sm opacity-75">ID: {currentSlideData?.id}</p>
              </div>
            ) : (
              <img
                src={currentImageUrl}
                alt={`Slide ${currentSlideData.sequence}`}
                className="max-w-full max-h-full object-contain"
                crossOrigin="anonymous"
              />
            )}
            
            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  disabled={currentSlide === slides.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {currentSlide + 1} of {slides.length} - ID: {currentSlideData?.id}
            </div>
          </div>
        </div>
      )}
    </>
  );
}