import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text', 
  width = '100%', 
  height,
  count = 1,
  className = '' 
}) => {
  const getHeight = () => {
    if (height) return height;
    switch (variant) {
      case 'text': return '1em';
      case 'card': return '120px';
      case 'circle': return '40px';
      case 'rect': return '60px';
      default: return '1em';
    }
  };

  const getBorderRadius = () => {
    switch (variant) {
      case 'circle': return '50%';
      case 'card': return 'var(--border-radius)';
      case 'rect': return '4px';
      case 'text': return '4px';
      default: return '4px';
    }
  };

  const skeletonStyle: React.CSSProperties = {
    display: 'block',
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof getHeight() === 'number' ? `${getHeight()}px` : getHeight(),
    backgroundColor: '#e2e8f0',
    borderRadius: getBorderRadius(),
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    marginBottom: variant === 'text' ? '0.5em' : '0',
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} style={skeletonStyle} className={className} />
  ));

  return <>{skeletons}</>;
};

// Predefined skeleton components for common use cases
export const FixtureCardSkeleton: React.FC = () => (
  <div style={{
    borderRadius: '12px',
    border: '1px solid rgba(209, 213, 219, 0.8)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    padding: '16px',
    marginBottom: '12px'
  }}>
    {/* Header with MW pill and date skeleton */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      paddingBottom: '8px',
      borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
    }}>
      <div style={{
        background: '#f3f4f6',
        borderRadius: '12px',
        padding: '4px 8px'
      }}>
        <SkeletonLoader variant="text" width="40px" height="12px" />
      </div>
      <SkeletonLoader variant="text" width="80px" height="14px" />
    </div>

    {/* Time skeleton */}
    <div style={{ marginBottom: '8px' }}>
      <SkeletonLoader variant="text" width="50px" height="12px" />
    </div>

    {/* Teams skeleton */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginBottom: '12px',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0 }}>
        <SkeletonLoader variant="circle" width="18px" height="18px" />
        <SkeletonLoader variant="text" width="90px" height="14px" />
      </div>
      <SkeletonLoader variant="text" width="20px" height="12px" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
        <SkeletonLoader variant="text" width="90px" height="14px" />
        <SkeletonLoader variant="circle" width="18px" height="18px" />
      </div>
    </div>
    
    {/* Footer with broadcaster and view button skeleton */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px'
    }}>
      <SkeletonLoader variant="text" width="60px" height="24px" />
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        padding: '4px 8px'
      }}>
        <SkeletonLoader variant="text" width="40px" height="12px" />
      </div>
    </div>
  </div>
);

export const ClubCardSkeleton: React.FC = () => (
  <div style={{
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <SkeletonLoader variant="circle" width="24px" height="24px" />
      <SkeletonLoader variant="text" width="120px" height="16px" />
    </div>
  </div>
);

export default SkeletonLoader;