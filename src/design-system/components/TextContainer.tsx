import React from 'react';
import { tokens } from '../tokens';

export interface TextContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg';
  spacing?: 'tight' | 'normal' | 'relaxed';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TextContainer - Consistent typography and spacing for text content
 * Provides standardized text layout with proper spacing between elements
 */
const TextContainer: React.FC<TextContainerProps> = ({
  children,
  size = 'base',
  spacing = 'normal',
  className = '',
  style = {}
}) => {
  const fontSize = tokens.fontSize[size];
  const lineHeight = {
    sm: '1.4',
    base: '1.6',
    lg: '1.7'
  }[size];

  const elementSpacing = {
    tight: tokens.spacing.md,
    normal: tokens.spacing.lg,
    relaxed: tokens.spacing.xl
  }[spacing];

  return (
    <div
      className={`text-container ${className}`}
      style={{
        fontSize,
        lineHeight,
        color: 'var(--color-text, var(--color-gray-700))',
        ...style
      }}
    >
      <style>{`
        .text-container h1 {
          margin: 0 0 ${tokens.spacing.xl} 0;
          font-size: clamp(1.5rem, 5vw, 1.875rem);
          font-weight: ${tokens.fontWeight.bold};
          color: var(--color-heading, var(--color-gray-900));
        }

        .text-container h2 {
          margin: ${tokens.spacing['2xl']} 0 ${tokens.spacing.lg} 0;
          font-size: ${tokens.fontSize.xl};
          font-weight: ${tokens.fontWeight.semibold};
          color: var(--color-heading, var(--color-gray-800));
        }

        .text-container h2:first-of-type {
          margin-top: ${tokens.spacing.lg};
        }

        .text-container h3 {
          margin: ${tokens.spacing.xl} 0 ${elementSpacing} 0;
          font-size: ${tokens.fontSize.lg};
          font-weight: ${tokens.fontWeight.medium};
          color: var(--color-heading, var(--color-gray-800));
        }

        .text-container p {
          margin: 0 0 ${elementSpacing} 0;
        }

        .text-container p:last-child {
          margin-bottom: 0;
        }

        .text-container p.muted {
          color: var(--color-muted, var(--color-gray-500));
          font-size: ${tokens.fontSize.sm};
        }

        .text-container ul, .text-container ol {
          margin: 0 0 ${elementSpacing} 0;
          padding-left: ${tokens.spacing.xl};
        }

        .text-container li {
          margin-bottom: ${tokens.spacing.sm};
        }

        .text-container li:last-child {
          margin-bottom: 0;
        }

        .text-container a {
          color: var(--color-accent, var(--color-primary-600));
          text-decoration: underline;
          transition: var(--transition-fast);
        }

        .text-container a:hover {
          color: var(--color-accent-hover, var(--color-primary-700));
        }

        .text-container strong {
          font-weight: ${tokens.fontWeight.semibold};
        }

        .text-container em {
          font-style: italic;
        }

        .text-container blockquote {
          margin: ${elementSpacing} 0;
          padding: ${tokens.spacing.lg} ${tokens.spacing.xl};
          border-left: 4px solid var(--color-accent, var(--color-primary-500));
          background: var(--color-gray-50);
          font-style: italic;
        }

        .text-container code {
          background: var(--color-gray-100);
          padding: ${tokens.spacing.xs} ${tokens.spacing.sm};
          border-radius: ${tokens.borderRadius.sm};
          font-family: monospace;
          font-size: 0.9em;
        }

        .text-container hr {
          margin: ${tokens.spacing['2xl']} 0;
          border: none;
          border-top: 1px solid var(--color-border, var(--color-gray-200));
        }
      `}</style>
      {children}
    </div>
  );
};

export default TextContainer;