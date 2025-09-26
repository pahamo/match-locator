import React from 'react';
import { cn } from '../../../lib/utils';

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
  ...props
}, ref) => {
  const directionClasses = {
    'row': 'flex-row',
    'row-reverse': 'flex-row-reverse',
    'column': 'flex-col',
    'column-reverse': 'flex-col-reverse'
  };

  const alignClasses = {
    'start': 'items-start',
    'end': 'items-end',
    'center': 'items-center',
    'stretch': 'items-stretch',
    'baseline': 'items-baseline'
  };

  const justifyClasses = {
    'start': 'justify-start',
    'end': 'justify-end',
    'center': 'justify-center',
    'between': 'justify-between',
    'around': 'justify-around',
    'evenly': 'justify-evenly'
  };

  const wrapClasses = {
    'nowrap': 'flex-nowrap',
    'wrap': 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const gapClasses = {
    'xs': 'gap-1',
    'sm': 'gap-2',
    'md': 'gap-3',
    'lg': 'gap-4',
    'xl': 'gap-5',
    '2xl': 'gap-6',
    '3xl': 'gap-8',
    '4xl': 'gap-10',
    'none': ''
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        wrapClasses[wrap],
        gap !== 'none' && gapClasses[gap],
        grow && 'flex-grow',
        shrink && 'flex-shrink',
        fullWidth && 'w-full',
        fullHeight && 'h-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Flex.displayName = 'Flex';

export default Flex;