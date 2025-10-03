// Responsive breakpoints following mobile-first approach
export const breakpoints = {
  // Mobile first breakpoints
  sm: '640px',   // Small tablets and large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large desktops
} as const;

// Media query helpers
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,

  // Max-width queries for mobile-first overrides
  smDown: `@media (max-width: ${parseInt(breakpoints.sm) - 1}px)`,
  mdDown: `@media (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  lgDown: `@media (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  xlDown: `@media (max-width: ${parseInt(breakpoints.xl) - 1}px)`,

  // Range queries
  smToMd: `@media (min-width: ${breakpoints.sm}) and (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  mdToLg: `@media (min-width: ${breakpoints.md}) and (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  lgToXl: `@media (min-width: ${breakpoints.lg}) and (max-width: ${parseInt(breakpoints.xl) - 1}px)`,

  // Touch and hover support
  hover: '@media (hover: hover) and (pointer: fine)',
  noHover: '@media (hover: none) or (pointer: coarse)'
} as const;

// Container sizes that work well with our breakpoints
export const containerSizes = {
  sm: '100%',
  md: '768px',
  lg: '1024px',
  xl: '1200px',
  '2xl': '1400px'
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type MediaQuery = keyof typeof mediaQueries;
export type ContainerSize = keyof typeof containerSizes;