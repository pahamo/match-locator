import { breakpoints, mediaQueries, containerSizes } from './breakpoints';
import { darkModeColors, darkModeCSSVariables } from './dark-mode';

// Design Tokens - Central source of truth for design values
export const tokens = {
  // Responsive breakpoints
  breakpoints,
  mediaQueries,
  containerSizes,
  // Color Palette
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#6366f1',
      600: '#5856eb',
      700: '#4f46e5',
      900: '#1e1b4b'
    },
    
    // Semantic colors
    success: {
      500: '#16a34a',
      50: '#f0fdf4'
    },
    warning: {
      500: '#d97706',
      50: '#fffbeb'
    },
    error: {
      500: '#dc2626',
      50: '#fef2f2'
    },
    
    // Broadcaster specific colors (original design)
    broadcaster: {
      confirmed: {
        background: '#dcfce7',
        text: '#16a34a'
      },
      blackout: {
        background: '#fee2e2',
        text: '#dc2626'
      },
      tbd: {
        background: '#fef3c7',
        text: '#d97706'
      }
    },
    
    // Neutral colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    
    // Competition specific colors
    competition: {
      epl: '#6366f1',
      ucl: '#0ea5e9',
      background: {
        epl: '#f8fafc',
        ucl: '#e0f2fe'
      }
    },
    
    // Live match colors
    live: {
      primary: '#dc2626',
      background: '#fef2f2',
      border: '#fecaca'
    }
  },
  
  // Spacing scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px'
  },
  
  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px'
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  // Border radius
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '50%'
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06)',
    xl: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    live: '0 4px 12px rgba(220, 38, 38, 0.2)',
    primary: '0 2px 8px rgba(99, 102, 241, 0.1)',
    ucl: '0 4px 12px rgba(14, 165, 233, 0.2)'
  },
  
  // Transitions and animations
  transition: {
    fast: '0.15s ease',
    base: '0.2s ease',
    slow: '0.3s ease'
  },

  // Animation tokens
  animation: {
    spin: 'spin 1s linear infinite',
    ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    fadeIn: 'fadeIn 0.2s ease-in',
    fadeOut: 'fadeOut 0.2s ease-out',
    slideInUp: 'slideInUp 0.3s ease-out',
    slideInDown: 'slideInDown 0.3s ease-out'
  },
  
  // Z-index scale
  zIndex: {
    base: 1,
    dropdown: 10,
    sticky: 20,
    modal: 50
  },
  
  // Layout standards
  layout: {
    headerHeight: '64px',
    pageTopMargin: '32px',
    pageBottomMargin: '32px',
    sectionSpacing: '48px',
    contentMaxWidth: '1200px',
    headerClearance: '80px' // Header height + margin
  }
} as const;

// Dark mode support
export { darkModeColors, darkModeCSSVariables };

// CSS Custom Properties string for injection
export const cssVariables = `
:root {
  /* Card and UI colors */
  --color-card: white;
  --color-border: ${tokens.colors.gray[200]};
  --color-text: ${tokens.colors.gray[700]};
  --color-heading: ${tokens.colors.gray[900]};
  --color-muted: ${tokens.colors.gray[500]};
  --color-accent: ${tokens.colors.primary[600]};
  --color-accent-hover: ${tokens.colors.primary[700]};

  /* Design system tokens */
  --border-radius: ${tokens.borderRadius.lg};
  --shadow: ${tokens.boxShadow.sm};

  /* Colors */
  --color-primary-50: ${tokens.colors.primary[50]};
  --color-primary-100: ${tokens.colors.primary[100]};
  --color-primary-500: ${tokens.colors.primary[500]};
  --color-primary-600: ${tokens.colors.primary[600]};
  --color-primary-700: ${tokens.colors.primary[700]};
  --color-primary-900: ${tokens.colors.primary[900]};
  
  --color-success-50: ${tokens.colors.success[50]};
  --color-success-500: ${tokens.colors.success[500]};
  
  --color-warning-50: ${tokens.colors.warning[50]};
  --color-warning-500: ${tokens.colors.warning[500]};
  
  --color-error-50: ${tokens.colors.error[50]};
  --color-error-500: ${tokens.colors.error[500]};
  
  --color-gray-50: ${tokens.colors.gray[50]};
  --color-gray-100: ${tokens.colors.gray[100]};
  --color-gray-200: ${tokens.colors.gray[200]};
  --color-gray-300: ${tokens.colors.gray[300]};
  --color-gray-400: ${tokens.colors.gray[400]};
  --color-gray-500: ${tokens.colors.gray[500]};
  --color-gray-600: ${tokens.colors.gray[600]};
  --color-gray-700: ${tokens.colors.gray[700]};
  --color-gray-800: ${tokens.colors.gray[800]};
  --color-gray-900: ${tokens.colors.gray[900]};
  
  --color-epl: ${tokens.colors.competition.epl};
  --color-ucl: ${tokens.colors.competition.ucl};
  --color-epl-bg: ${tokens.colors.competition.background.epl};
  --color-ucl-bg: ${tokens.colors.competition.background.ucl};
  
  --color-live-primary: ${tokens.colors.live.primary};
  --color-live-bg: ${tokens.colors.live.background};
  --color-live-border: ${tokens.colors.live.border};
  
  /* Broadcaster colors */
  --broadcaster-confirmed-bg: ${tokens.colors.broadcaster.confirmed.background};
  --broadcaster-confirmed-text: ${tokens.colors.broadcaster.confirmed.text};
  --broadcaster-blackout-bg: ${tokens.colors.broadcaster.blackout.background};
  --broadcaster-blackout-text: ${tokens.colors.broadcaster.blackout.text};
  --broadcaster-tbd-bg: ${tokens.colors.broadcaster.tbd.background};
  --broadcaster-tbd-text: ${tokens.colors.broadcaster.tbd.text};
  
  /* Layout standards */
  --layout-header-height: ${tokens.layout.headerHeight};
  --layout-page-top-margin: ${tokens.layout.pageTopMargin};
  --layout-page-bottom-margin: ${tokens.layout.pageBottomMargin};
  --layout-section-spacing: ${tokens.layout.sectionSpacing};
  --layout-content-max-width: ${tokens.layout.contentMaxWidth};
  --layout-header-clearance: ${tokens.layout.headerClearance};
  
  /* Spacing */
  --spacing-xs: ${tokens.spacing.xs};
  --spacing-sm: ${tokens.spacing.sm};
  --spacing-md: ${tokens.spacing.md};
  --spacing-lg: ${tokens.spacing.lg};
  --spacing-xl: ${tokens.spacing.xl};
  --spacing-2xl: ${tokens.spacing['2xl']};
  --spacing-3xl: ${tokens.spacing['3xl']};
  --spacing-4xl: ${tokens.spacing['4xl']};
  
  /* Typography */
  --font-size-xs: ${tokens.fontSize.xs};
  --font-size-sm: ${tokens.fontSize.sm};
  --font-size-base: ${tokens.fontSize.base};
  --font-size-lg: ${tokens.fontSize.lg};
  --font-size-xl: ${tokens.fontSize.xl};
  --font-size-2xl: ${tokens.fontSize['2xl']};
  --font-size-3xl: ${tokens.fontSize['3xl']};
  
  --font-weight-normal: ${tokens.fontWeight.normal};
  --font-weight-medium: ${tokens.fontWeight.medium};
  --font-weight-semibold: ${tokens.fontWeight.semibold};
  --font-weight-bold: ${tokens.fontWeight.bold};
  
  /* Border radius */
  --border-radius-sm: ${tokens.borderRadius.sm};
  --border-radius-md: ${tokens.borderRadius.md};
  --border-radius-lg: ${tokens.borderRadius.lg};
  --border-radius-xl: ${tokens.borderRadius.xl};
  --border-radius-2xl: ${tokens.borderRadius['2xl']};
  --border-radius-full: ${tokens.borderRadius.full};
  
  /* Shadows */
  --shadow-sm: ${tokens.boxShadow.sm};
  --shadow-md: ${tokens.boxShadow.md};
  --shadow-lg: ${tokens.boxShadow.lg};
  --shadow-xl: ${tokens.boxShadow.xl};
  --shadow-live: ${tokens.boxShadow.live};
  --shadow-primary: ${tokens.boxShadow.primary};
  --shadow-ucl: ${tokens.boxShadow.ucl};
  
  /* Transitions */
  --transition-fast: ${tokens.transition.fast};
  --transition-base: ${tokens.transition.base};
  --transition-slow: ${tokens.transition.slow};

  /* Breakpoints */
  --breakpoint-sm: ${tokens.breakpoints.sm};
  --breakpoint-md: ${tokens.breakpoints.md};
  --breakpoint-lg: ${tokens.breakpoints.lg};
  --breakpoint-xl: ${tokens.breakpoints.xl};
  --breakpoint-2xl: ${tokens.breakpoints['2xl']};

  /* Container sizes */
  --container-sm: ${tokens.containerSizes.sm};
  --container-md: ${tokens.containerSizes.md};
  --container-lg: ${tokens.containerSizes.lg};
  --container-xl: ${tokens.containerSizes.xl};
  --container-2xl: ${tokens.containerSizes['2xl']};
}

/* CSS animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Live pulse animation for match cards */
.live-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Utility animation classes */
.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-in;
}

.animate-fade-out {
  animation: fadeOut 0.2s ease-out;
}

.animate-slide-in-up {
  animation: slideInUp 0.3s ease-out;
}

.animate-slide-in-down {
  animation: slideInDown 0.3s ease-out;
}

/* Include dark mode CSS */
${darkModeCSSVariables}
`;

export type Tokens = typeof tokens;