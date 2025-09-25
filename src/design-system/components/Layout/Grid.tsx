import React from 'react';
import { getCSSVariable } from '../../styles';
import { tokens } from '../../tokens';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  cols?: number | 'auto' | 'fit';
  /** Gap between grid items */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** Responsive columns */
  smCols?: number | 'auto' | 'fit';
  mdCols?: number | 'auto' | 'fit';
  lgCols?: number | 'auto' | 'fit';
  xlCols?: number | 'auto' | 'fit';
  /** Grid template areas for named grid layouts */
  areas?: string[];
  /** Align items */
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  /** Justify items */
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  /** Full width */
  fullWidth?: boolean;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(({
  cols = 12,
  gap = 'md',
  smCols,
  mdCols,
  lgCols,
  xlCols,
  areas,
  alignItems = 'stretch',
  justifyItems = 'stretch',
  fullWidth = false,
  children,
  className = '',
  style = {},
  ...props
}, ref) => {
  const getColumnsValue = (colValue: number | 'auto' | 'fit') => {
    if (colValue === 'auto') return 'auto';
    if (colValue === 'fit') return 'max-content';
    return `repeat(${colValue}, 1fr)`;
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getColumnsValue(cols),
    gap: getCSSVariable(`--spacing-${gap}`),
    alignItems,
    justifyItems,
    width: fullWidth ? '100%' : undefined,
    gridTemplateAreas: areas ? areas.map(area => `"${area}"`).join(' ') : undefined,
    ...style
  };

  // Add responsive breakpoint styles
  const responsiveStyles: string[] = [];

  if (smCols !== undefined) {
    responsiveStyles.push(`
      ${tokens.mediaQueries.sm} {
        grid-template-columns: ${getColumnsValue(smCols)};
      }
    `);
  }

  if (mdCols !== undefined) {
    responsiveStyles.push(`
      ${tokens.mediaQueries.md} {
        grid-template-columns: ${getColumnsValue(mdCols)};
      }
    `);
  }

  if (lgCols !== undefined) {
    responsiveStyles.push(`
      ${tokens.mediaQueries.lg} {
        grid-template-columns: ${getColumnsValue(lgCols)};
      }
    `);
  }

  if (xlCols !== undefined) {
    responsiveStyles.push(`
      ${tokens.mediaQueries.xl} {
        grid-template-columns: ${getColumnsValue(xlCols)};
      }
    `);
  }

  return (
    <>
      {responsiveStyles.length > 0 && (
        <style>
          {`.design-system-grid-${Math.random().toString(36).substr(2, 9)} {
            ${responsiveStyles.join('')}
          }`}
        </style>
      )}
      <div
        ref={ref}
        style={gridStyles}
        className={`design-system-grid ${className}`}
        {...props}
      >
        {children}
      </div>
    </>
  );
});

Grid.displayName = 'Grid';

export default Grid;