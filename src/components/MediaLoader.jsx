import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function MediaLoader({ 
  src, 
  alt, 
  type = 'image', 
  className = '', 
  onLoad, 
  onError,
  fallbackContent,
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(prev => prev + 1);
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        {fallbackContent || (
          <div className="text-center p-4">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Failed to load {type}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        )}
        <img
          src={`${src}${retryCount > 0 ? `?retry=${retryCount}` : ''}`}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity ${className}`}
          crossOrigin="anonymous"
          {...props}
        />
      </div>
    );
  }

  if (type === 'audio') {
    return (
      <audio
        src={`${src}${retryCount > 0 ? `?retry=${retryCount}` : ''}`}
        onLoadedMetadata={handleLoad}
        onError={handleError}
        crossOrigin="anonymous"
        {...props}
      />
    );
  }

  return null;
}