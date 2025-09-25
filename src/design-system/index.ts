// Design System Main Export
export * from './tokens';
export * from './styles';
export * from './components';

// Initialize design system
export { injectDesignTokens } from './styles';

// Specific exports for common use cases
export { tokens, cssVariables, darkModeColors, darkModeCSSVariables } from './tokens';
export { styleUtils, getCSSVariable } from './styles';