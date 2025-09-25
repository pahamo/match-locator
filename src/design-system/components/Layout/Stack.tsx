import React from 'react';
import { getCSSVariable } from '../../tokens';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Space between items */
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  /** Align items */
  align?: 'start' | 'end' | 'center' | 'stretch';
  /** Justify content */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  /** Wrap items */
  wrap?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Full height */
  fullHeight?: boolean;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(({
  space = 'md',
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  fullWidth = false,
  fullHeight = false,
  children,
  className = '',
  style = {},
  ...props
}, ref) => {
  const getAlignItems = () => {
    const alignMap = {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      stretch: 'stretch'
    };
    return alignMap[align];
  };

  const getJustifyContent = () => {
    const justifyMap = {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly'
    };
    return justifyMap[justify];
  };

  const isVertical = direction === 'vertical';

  const stackStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    gap: getCSSVariable(`--spacing-${space}`),
    alignItems: getAlignItems(),
    justifyContent: getJustifyContent(),
    flexWrap: wrap ? 'wrap' : 'nowrap',
    width: fullWidth ? '100%' : undefined,
    height: fullHeight ? '100%' : undefined,
    ...style
  };

  return (
    <div
      ref={ref}
      style={stackStyles}
      className={`design-system-stack design-system-stack-${direction} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Stack.displayName = 'Stack';

export default Stack;