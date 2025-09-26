import React from 'react';
import { cn } from '../../../lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level - affects both semantic HTML and visual styling */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size override (decouples semantic meaning from visual appearance) */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text color */
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'inherit';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Responsive font size */
  responsive?: boolean;
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Custom HTML element (while keeping semantic level for screen readers) */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(({
  level,
  size,
  weight = 'semibold',
  color = 'primary',
  align = 'left',
  responsive = false,
  truncate = false,
  as,
  children,
  className = '',
  ...props
}, ref) => {
  // Default size based on level if not specified
  const getDefaultSize = (): string => {
    const sizeMap = {
      1: '3xl',
      2: '2xl',
      3: 'xl',
      4: 'lg',
      5: 'base',
      6: 'sm'
    };
    return size || sizeMap[level];
  };

  const sizeValue = getDefaultSize();

  // Build Tailwind classes
  const classes = cn(
    // Base heading styles
    'm-0', // Reset margins

    // Font sizes
    {
      'text-xs': sizeValue === 'xs',
      'text-sm': sizeValue === 'sm',
      'text-base': sizeValue === 'base',
      'text-lg': sizeValue === 'lg',
      'text-xl': sizeValue === 'xl',
      'text-2xl': sizeValue === '2xl',
      'text-3xl': sizeValue === '3xl',
    },

    // Font weights
    {
      'font-normal': weight === 'normal',
      'font-medium': weight === 'medium',
      'font-semibold': weight === 'semibold',
      'font-bold': weight === 'bold',
    },

    // Colors
    {
      'text-foreground': color === 'primary',
      'text-muted-foreground': color === 'secondary' || color === 'muted',
      'text-green-600': color === 'success',
      'text-yellow-600': color === 'warning',
      'text-red-600': color === 'error',
    },

    // Text alignment
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
    },

    // Line heights
    {
      'leading-tight': level <= 2,
      'leading-snug': level > 2 && level <= 4,
      'leading-normal': level > 4,
    },

    // Truncation
    truncate && 'truncate',

    className
  );

  // Use custom element or default to semantic heading
  const Component = as || (`h${level}` as keyof React.JSX.IntrinsicElements);

  return React.createElement(
    Component,
    {
      ref,
      className: classes,
      // Add aria-level if using custom element to maintain semantic meaning
      ...(as && as !== `h${level}` ? { 'aria-level': level } : {}),
      ...props
    },
    children
  );
});

Heading.displayName = 'Heading';

export default Heading;