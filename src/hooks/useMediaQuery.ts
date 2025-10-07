import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query changes
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean - true if media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDesktop = useMediaQuery('(min-width: 769px)');
 *
 * Usage in components:
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 *
 * return (
 *   <nav style={{ display: isMobile ? 'none' : 'flex' }}>
 *     Desktop Nav
 *   </nav>
 * );
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false to avoid hydration mismatch
  // Server-side rendering doesn't have access to window
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Handler for media query changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers use addEventListener
    // Older browsers use addListener (deprecated but still supported)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints for common use cases
 */
export const breakpoints = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  smallMobile: '(max-width: 375px)',
  largeMobile: '(min-width: 376px) and (max-width: 640px)',
} as const;

/**
 * Convenience hooks for common breakpoints
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
