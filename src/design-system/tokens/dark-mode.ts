// Dark mode token overrides
export const darkModeColors = {
  // Primary colors remain similar but adjusted for dark backgrounds
  primary: {
    50: '#1e1b4b',
    100: '#312e81',
    500: '#8b5cf6',  // Slightly lighter purple for better contrast
    600: '#7c3aed',
    700: '#6d28d9',
    900: '#ddd6fe'   // Light purple for text on dark
  },

  // Semantic colors adjusted for dark mode
  success: {
    500: '#22c55e',  // Brighter green
    50: '#052e16'    // Very dark green background
  },
  warning: {
    500: '#f59e0b',  // Brighter amber
    50: '#1c1917'    // Dark amber background
  },
  error: {
    500: '#ef4444',  // Slightly brighter red
    50: '#1f1212'    // Dark red background
  },

  // Broadcaster colors for dark mode
  broadcaster: {
    confirmed: {
      background: '#052e16', // Dark green
      text: '#22c55e'        // Bright green
    },
    blackout: {
      background: '#1f1212',  // Dark red
      text: '#ef4444'         // Bright red
    },
    tbd: {
      background: '#1c1917',  // Dark amber
      text: '#f59e0b'         // Bright amber
    }
  },

  // Gray scale for dark mode (inverted)
  gray: {
    50: '#1f2937',   // Very dark backgrounds
    100: '#374151',  // Dark surfaces
    200: '#4b5563',  // Borders and dividers
    300: '#6b7280',  // Disabled text
    400: '#9ca3af',  // Muted text
    500: '#d1d5db',  // Body text
    600: '#e5e7eb',  // Emphasized text
    700: '#f3f4f6',  // Headings
    800: '#f9fafb',  // High contrast text
    900: '#ffffff'   // Highest contrast (white)
  },

  // Competition colors for dark mode
  competition: {
    epl: '#8b5cf6',    // Lighter purple
    ucl: '#06b6d4',    // Brighter cyan
    background: {
      epl: '#1e1b4b',  // Dark purple background
      ucl: '#164e63'   // Dark cyan background
    }
  },

  // Live match colors for dark mode
  live: {
    primary: '#ef4444',    // Bright red
    background: '#1f1212', // Dark red background
    border: '#7f1d1d'      // Medium red border
  }
} as const;

// CSS variables for dark mode
export const darkModeCSSVariables = `
.dark {
  /* Base backgrounds and surfaces */
  --color-card: ${darkModeColors.gray[100]};
  --color-border: ${darkModeColors.gray[200]};
  --color-text: ${darkModeColors.gray[500]};
  --color-heading: ${darkModeColors.gray[700]};
  --color-muted: ${darkModeColors.gray[400]};
  --color-accent: ${darkModeColors.primary[500]};
  --color-accent-hover: ${darkModeColors.primary[600]};

  /* Primary colors */
  --color-primary-50: ${darkModeColors.primary[50]};
  --color-primary-100: ${darkModeColors.primary[100]};
  --color-primary-500: ${darkModeColors.primary[500]};
  --color-primary-600: ${darkModeColors.primary[600]};
  --color-primary-700: ${darkModeColors.primary[700]};
  --color-primary-900: ${darkModeColors.primary[900]};

  /* Semantic colors */
  --color-success-50: ${darkModeColors.success[50]};
  --color-success-500: ${darkModeColors.success[500]};
  --color-warning-50: ${darkModeColors.warning[50]};
  --color-warning-500: ${darkModeColors.warning[500]};
  --color-error-50: ${darkModeColors.error[50]};
  --color-error-500: ${darkModeColors.error[500]};

  /* Gray scale */
  --color-gray-50: ${darkModeColors.gray[50]};
  --color-gray-100: ${darkModeColors.gray[100]};
  --color-gray-200: ${darkModeColors.gray[200]};
  --color-gray-300: ${darkModeColors.gray[300]};
  --color-gray-400: ${darkModeColors.gray[400]};
  --color-gray-500: ${darkModeColors.gray[500]};
  --color-gray-600: ${darkModeColors.gray[600]};
  --color-gray-700: ${darkModeColors.gray[700]};
  --color-gray-800: ${darkModeColors.gray[800]};
  --color-gray-900: ${darkModeColors.gray[900]};

  /* Competition colors */
  --color-epl: ${darkModeColors.competition.epl};
  --color-ucl: ${darkModeColors.competition.ucl};
  --color-epl-bg: ${darkModeColors.competition.background.epl};
  --color-ucl-bg: ${darkModeColors.competition.background.ucl};

  /* Live colors */
  --color-live-primary: ${darkModeColors.live.primary};
  --color-live-bg: ${darkModeColors.live.background};
  --color-live-border: ${darkModeColors.live.border};

  /* Broadcaster colors */
  --broadcaster-confirmed-bg: ${darkModeColors.broadcaster.confirmed.background};
  --broadcaster-confirmed-text: ${darkModeColors.broadcaster.confirmed.text};
  --broadcaster-blackout-bg: ${darkModeColors.broadcaster.blackout.background};
  --broadcaster-blackout-text: ${darkModeColors.broadcaster.blackout.text};
  --broadcaster-tbd-bg: ${darkModeColors.broadcaster.tbd.background};
  --broadcaster-tbd-text: ${darkModeColors.broadcaster.tbd.text};

  /* Page background for dark mode */
  background-color: ${darkModeColors.gray[50]};
  color: ${darkModeColors.gray[500]};
}

/* Automatic dark mode based on system preference - DISABLED */
/*
 * Dark mode is not fully implemented across all components yet.
 * Automatic system preference detection causes dark-on-dark text issues.
 * To enable dark mode manually, add class="dark" to <html> element.
 */
/*
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --color-card: ${darkModeColors.gray[100]};
    --color-border: ${darkModeColors.gray[200]};
    --color-text: ${darkModeColors.gray[500]};
    --color-heading: ${darkModeColors.gray[700]};
    --color-muted: ${darkModeColors.gray[400]};
    --color-accent: ${darkModeColors.primary[500]};
    --color-accent-hover: ${darkModeColors.primary[600]};

    background-color: ${darkModeColors.gray[50]};
    color: ${darkModeColors.gray[500]};
  }
}
*/
`;

export type DarkModeColors = typeof darkModeColors;