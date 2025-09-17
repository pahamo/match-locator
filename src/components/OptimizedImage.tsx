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

  // Skip loading placeholder for small images to reduce DOM complexity
  const showLoader = width >= 50 && height >= 50;

  return (
    <div
      className={`image-placeholder ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style
      }}
    >
      {/* Only show loader for larger images */}
      {!isLoaded && showLoader && (
        <div className="image-loader" />
      )}

      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="optimized-image"
        style={{
          opacity: isLoaded ? 1 : 0
        }}
        loading={lazy ? 'lazy' : 'eager'}
        onError={handleError}
        onLoad={handleLoad}
        sizes={`${width}px`}
        {...(width && { width })}
        {...(height && { height })}
      />
    </div>
  );
});

export default OptimizedImage;