import React from 'react';
import { cn } from '../../../lib/utils';

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
  ...props
}, ref) => {
  const spaceClasses = {
    'xs': 'gap-1',
    'sm': 'gap-2',
    'md': 'gap-3',
    'lg': 'gap-4',
    'xl': 'gap-5',
    '2xl': 'gap-6',
    '3xl': 'gap-8',
    '4xl': 'gap-10'
  };

  const directionClasses = {
    'vertical': 'flex-col',
    'horizontal': 'flex-row'
  };

  const alignClasses = {
    'start': 'items-start',
    'end': 'items-end',
    'center': 'items-center',
    'stretch': 'items-stretch'
  };

  const justifyClasses = {
    'start': 'justify-start',
    'end': 'justify-end',
    'center': 'justify-center',
    'between': 'justify-between',
    'around': 'justify-around',
    'evenly': 'justify-evenly'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        spaceClasses[space],
        wrap && 'flex-wrap',
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

Stack.displayName = 'Stack';

export default Stack;