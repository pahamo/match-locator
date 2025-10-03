import React from 'react';
import { tokens } from '../tokens';

export interface ContentCardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ContentCard - Consistent card component for content layout
 * Used for text-heavy content like about pages, legal pages, etc.
 */
const ContentCard: React.FC<ContentCardProps> = ({
  children,
  padding = 'xl',
  className = '',
  style = {}
}) => {
  const paddingValue = tokens.spacing[padding];

  return (
    <div
      className={`content-card ${className}`}
      style={{
        background: 'var(--color-card, white)',
        border: '1px solid var(--color-border, var(--color-gray-200))',
        borderRadius: 'var(--border-radius, var(--border-radius-lg))',
        padding: paddingValue,
        boxShadow: 'var(--shadow, var(--shadow-sm))',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ContentCard;