import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
  lazy?: boolean;
  onError?: () => void;
}

/**
 * Optimized image component for club crests and competition logos
 * - Properly sized images to save cellular data
 * - Lazy loading support
 * - Error handling with fallback
 * - Responsive sizing
 */
const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  fallback,
  lazy = true,
  onError
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // If there's an error and a fallback, show fallback
  if (hasError && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{
          objectFit: 'contain',
          ...style
        }}
        onError={() => setHasError(true)}
        onLoad={handleLoad}
      />
    );
  }

  // If there's an error and no fallback, show placeholder
  if (hasError) {
    return (
      <div
        className={className}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#6b7280',
          border: '1px solid #e5e7eb',
          ...style
        }}
      >
        ⚽
      </div>
    );
  }

  return (
    <>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            ...style
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{
          objectFit: 'contain',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
          ...style
        }}
        loading={lazy ? 'lazy' : 'eager'}
        onError={handleError}
        onLoad={handleLoad}
        // Add size hints for browser optimization
        sizes={`${width}px`}
        // Provide width/height attributes for layout stability
        {...(width && { width })}
        {...(height && { height })}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
});

export default OptimizedImage;