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
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius)',
    padding: 'clamp(12px, 3vw, 16px)',
    marginBottom: 'var(--spacing-md)',
  }}>
    <SkeletonLoader variant="text" width="30%" height="14px" />
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      margin: '12px 0',
      gap: 'clamp(8px, 2vw, 12px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <SkeletonLoader variant="circle" width="24px" height="24px" />
        <SkeletonLoader variant="text" width="80px" height="16px" />
      </div>
      <SkeletonLoader variant="text" width="20px" height="14px" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
        <SkeletonLoader variant="text" width="80px" height="16px" />
        <SkeletonLoader variant="circle" width="24px" height="24px" />
      </div>
    </div>
    <SkeletonLoader variant="text" width="60%" height="14px" />
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