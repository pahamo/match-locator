import React from 'react';
import { getCSSVariable } from '../../styles';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Flex direction */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** Align items */
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  /** Justify content */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  /** Flex wrap */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Gap between items */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'none';
  /** Flex grow for container */
  grow?: boolean;
  /** Flex shrink for container */
  shrink?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Full height */
  fullHeight?: boolean;
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(({
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  gap = 'none',
  grow = false,
  shrink = true,
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
      stretch: 'stretch',
      baseline: 'baseline'
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

  const flexStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    alignItems: getAlignItems(),
    justifyContent: getJustifyContent(),
    flexWrap: wrap,
    gap: gap !== 'none' ? getCSSVariable(`--spacing-${gap}`) : undefined,
    flexGrow: grow ? 1 : undefined,
    flexShrink: shrink ? 1 : 0,
    width: fullWidth ? '100%' : undefined,
    height: fullHeight ? '100%' : undefined,
    ...style
  };

  return (
    <div
      ref={ref}
      style={flexStyles}
      className={`design-system-flex ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Flex.displayName = 'Flex';

export default Flex;