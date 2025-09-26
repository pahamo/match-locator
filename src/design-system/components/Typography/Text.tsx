import React from 'react';
import { cn } from '../../../lib/utils';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Font size */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text color */
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'inherit';
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Text variant for semantic meaning */
  variant?: 'body' | 'caption' | 'subtitle' | 'overline' | 'code';
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Number of lines before truncating (requires -webkit-line-clamp support) */
  lineClamp?: number;
  /** HTML element to render */
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'code' | 'pre';
  /** Enable text selection (defaults to true) */
  selectable?: boolean;
}

const Text = React.forwardRef<HTMLElement, TextProps>(({
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  variant = 'body',
  truncate = false,
  lineClamp,
  as = 'p',
  selectable = true,
  children,
  className = '',
  ...props
}, ref) => {
  // Variant overrides
  const finalSize = variant === 'caption' ? 'sm' : variant === 'subtitle' ? 'lg' : variant === 'overline' ? 'xs' : size;
  const finalWeight = variant === 'subtitle' ? 'medium' : variant === 'overline' ? 'semibold' : weight;
  const finalColor = variant === 'caption' ? 'muted' : color;

  const classes = cn(
    // Base styles
    {
      'mb-4': as === 'p', // Only add margin to paragraphs
      'm-0': as !== 'p',
    },

    // Font sizes
    {
      'text-xs': finalSize === 'xs',
      'text-sm': finalSize === 'sm',
      'text-base': finalSize === 'base',
      'text-lg': finalSize === 'lg',
      'text-xl': finalSize === 'xl',
      'text-2xl': finalSize === '2xl',
      'text-3xl': finalSize === '3xl',
    },

    // Font weights
    {
      'font-normal': finalWeight === 'normal',
      'font-medium': finalWeight === 'medium',
      'font-semibold': finalWeight === 'semibold',
      'font-bold': finalWeight === 'bold',
    },

    // Colors
    {
      'text-foreground': finalColor === 'primary',
      'text-muted-foreground': finalColor === 'secondary' || finalColor === 'muted',
      'text-green-600 dark:text-green-400': finalColor === 'success',
      'text-yellow-600 dark:text-yellow-400': finalColor === 'warning',
      'text-red-600 dark:text-red-400': finalColor === 'error',
    },

    // Text alignment
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
      'text-justify': align === 'justify',
    },

    // Line heights by variant
    {
      'leading-relaxed': variant === 'body', // 1.6
      'leading-normal': variant === 'caption' || variant === 'subtitle', // 1.4 / 1.5
      'leading-tight': variant === 'overline', // 1.2
    },

    // Variant-specific styles
    {
      'uppercase tracking-wide': variant === 'overline',
      'font-mono text-sm bg-muted px-1 py-0.5 rounded border': variant === 'code',
    },

    // Text selection
    {
      'select-text': selectable,
      'select-none': !selectable,
    },

    // Truncation
    truncate && 'truncate',
    lineClamp && lineClamp > 0 && 'line-clamp-' + lineClamp,

    className
  );

  return React.createElement(
    as,
    {
      ref: ref as React.Ref<any>,
      className: classes,
      ...props
    },
    children
  );
});

Text.displayName = 'Text';

export default Text;