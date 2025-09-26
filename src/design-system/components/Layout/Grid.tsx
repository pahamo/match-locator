import React from 'react';
import { cn } from '../../../lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  /** Responsive columns - small screens */
  smCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  /** Responsive columns - medium screens */
  mdCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  /** Responsive columns - large screens */
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  /** Responsive columns - extra large screens */
  xlCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  /** Gap between items */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Full width */
  fullWidth?: boolean;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(({
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  xlCols,
  gap = 'md',
  fullWidth = true,
  children,
  className = '',
  ...props
}, ref) => {
  const gapClasses = {
    'xs': 'gap-1',
    'sm': 'gap-2',
    'md': 'gap-4',
    'lg': 'gap-6',
    'xl': 'gap-8',
    '2xl': 'gap-10'
  };

  const getColsClass = (colsNum: number, prefix = '') => {
    const colMap: Record<number, string> = {
      1: `${prefix}grid-cols-1`,
      2: `${prefix}grid-cols-2`,
      3: `${prefix}grid-cols-3`,
      4: `${prefix}grid-cols-4`,
      5: `${prefix}grid-cols-5`,
      6: `${prefix}grid-cols-6`,
      12: `${prefix}grid-cols-12`
    };
    return colMap[colsNum];
  };

  return (
    <div
      ref={ref}
      className={cn(
        'grid',
        getColsClass(cols),
        smCols && getColsClass(smCols, 'sm:'),
        mdCols && getColsClass(mdCols, 'md:'),
        lgCols && getColsClass(lgCols, 'lg:'),
        xlCols && getColsClass(xlCols, 'xl:'),
        gapClasses[gap],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';

export default Grid;