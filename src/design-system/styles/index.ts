import { cssVariables } from '../tokens';

// Inject CSS variables into the document head
export function injectDesignTokens() {
  // Check if already injected
  if (document.getElementById('design-tokens')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'design-tokens';
  style.textContent = cssVariables;
  document.head.appendChild(style);
}

// Utility function to get CSS variable value
export function getCSSVariable(name: string): string {
  return `var(${name.startsWith('--') ? name : `--${name}`})`;
}

// Common style utilities using design tokens
export const styleUtils = {
  // Card styles
  card: {
    base: {
      background: getCSSVariable('--color-gray-50'),
      border: `1px solid ${getCSSVariable('--color-gray-200')}`,
      borderRadius: getCSSVariable('--border-radius-lg'),
      padding: getCSSVariable('--spacing-lg'),
      transition: getCSSVariable('--transition-base')
    },
    elevated: {
      background: 'white',
      border: `1px solid ${getCSSVariable('--color-gray-200')}`,
      borderRadius: getCSSVariable('--border-radius-lg'),
      padding: getCSSVariable('--spacing-lg'),
      boxShadow: getCSSVariable('--shadow-md'),
      transition: getCSSVariable('--transition-base')
    },
    live: {
      background: getCSSVariable('--color-live-bg'),
      border: `1px solid ${getCSSVariable('--color-live-border')}`,
      borderRadius: getCSSVariable('--border-radius-lg'),
      padding: getCSSVariable('--spacing-lg'),
      boxShadow: getCSSVariable('--shadow-live'),
      transition: getCSSVariable('--transition-base')
    }
  },
  
  // Button styles
  button: {
    primary: {
      background: getCSSVariable('--color-primary-500'),
      color: 'white',
      border: 'none',
      borderRadius: getCSSVariable('--border-radius-md'),
      padding: `${getCSSVariable('--spacing-sm')} ${getCSSVariable('--spacing-lg')}`,
      fontSize: getCSSVariable('--font-size-sm'),
      fontWeight: getCSSVariable('--font-weight-medium'),
      cursor: 'pointer',
      transition: getCSSVariable('--transition-base')
    },
    secondary: {
      background: 'transparent',
      color: getCSSVariable('--color-primary-500'),
      border: `1px solid ${getCSSVariable('--color-primary-500')}`,
      borderRadius: getCSSVariable('--border-radius-md'),
      padding: `${getCSSVariable('--spacing-sm')} ${getCSSVariable('--spacing-lg')}`,
      fontSize: getCSSVariable('--font-size-sm'),
      fontWeight: getCSSVariable('--font-weight-medium'),
      cursor: 'pointer',
      transition: getCSSVariable('--transition-base')
    }
  },
  
  // Badge styles
  badge: {
    success: {
      background: getCSSVariable('--color-success-50'),
      color: getCSSVariable('--color-success-500'),
      border: `1px solid ${getCSSVariable('--color-success-500')}`,
      borderRadius: getCSSVariable('--border-radius-full'),
      padding: `${getCSSVariable('--spacing-xs')} ${getCSSVariable('--spacing-sm')}`,
      fontSize: getCSSVariable('--font-size-xs'),
      fontWeight: getCSSVariable('--font-weight-medium')
    },
    warning: {
      background: getCSSVariable('--color-warning-50'),
      color: getCSSVariable('--color-warning-500'),
      border: `1px solid ${getCSSVariable('--color-warning-500')}`,
      borderRadius: getCSSVariable('--border-radius-full'),
      padding: `${getCSSVariable('--spacing-xs')} ${getCSSVariable('--spacing-sm')}`,
      fontSize: getCSSVariable('--font-size-xs'),
      fontWeight: getCSSVariable('--font-weight-medium')
    },
    live: {
      background: getCSSVariable('--color-live-bg'),
      color: getCSSVariable('--color-live-primary'),
      border: `1px solid ${getCSSVariable('--color-live-border')}`,
      borderRadius: getCSSVariable('--border-radius-full'),
      padding: `${getCSSVariable('--spacing-xs')} ${getCSSVariable('--spacing-sm')}`,
      fontSize: getCSSVariable('--font-size-xs'),
      fontWeight: getCSSVariable('--font-weight-bold')
    }
  },
  
  // Competition specific styles
  competition: {
    epl: {
      background: getCSSVariable('--color-epl-bg'),
      border: `2px solid ${getCSSVariable('--color-epl')}`,
      borderRadius: getCSSVariable('--border-radius-lg')
    },
    ucl: {
      background: getCSSVariable('--color-ucl-bg'),
      border: `2px solid ${getCSSVariable('--color-ucl')}`,
      borderRadius: getCSSVariable('--border-radius-lg')
    }
  }
};

export default styleUtils;