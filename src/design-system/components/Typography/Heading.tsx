import React from 'react';
import { getCSSVariable } from '../../styles';

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
  style = {},
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

  const getColorValue = () => {
    const colorMap = {
      primary: getCSSVariable('--color-heading'),
      secondary: getCSSVariable('--color-text'),
      muted: getCSSVariable('--color-muted'),
      success: getCSSVariable('--color-success-500'),
      warning: getCSSVariable('--color-warning-500'),
      error: getCSSVariable('--color-error-500'),
      inherit: 'inherit'
    };
    return colorMap[color];
  };

  const getFontSize = (sizeValue: string): string => {
    if (responsive) {
      // Responsive font sizes that scale down on mobile
      const responsiveMap: Record<string, string> = {
        xs: 'clamp(0.75rem, 2vw, 0.75rem)',
        sm: 'clamp(0.875rem, 2.5vw, 0.875rem)',
        base: 'clamp(1rem, 3vw, 1rem)',
        lg: 'clamp(1.125rem, 3.5vw, 1.125rem)',
        xl: 'clamp(1.25rem, 4vw, 1.25rem)',
        '2xl': 'clamp(1.5rem, 5vw, 1.5rem)',
        '3xl': 'clamp(1.875rem, 6vw, 1.875rem)'
      };
      return responsiveMap[sizeValue] || getCSSVariable(`--font-size-${sizeValue}`);
    }
    return getCSSVariable(`--font-size-${sizeValue}`);
  };

  const headingStyles: React.CSSProperties = {
    fontSize: getFontSize(getDefaultSize()),
    fontWeight: getCSSVariable(`--font-weight-${weight}`),
    color: getColorValue(),
    textAlign: align,
    lineHeight: level <= 2 ? '1.2' : level <= 4 ? '1.3' : '1.4',
    margin: 0, // Reset default margins
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }),
    ...style
  };

  // Use custom element or default to semantic heading
  const Component = as || (`h${level}` as keyof React.JSX.IntrinsicElements);

  return React.createElement(
    Component,
    {
      ref,
      style: headingStyles,
      className: `design-system-heading design-system-heading-${level} ${className}`,
      // Add aria-level if using custom element to maintain semantic meaning
      ...(as && as !== `h${level}` ? { 'aria-level': level } : {}),
      ...props
    },
    children
  );
});

Heading.displayName = 'Heading';

export default Heading;