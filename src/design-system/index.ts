// Design System Main Export
export * from './tokens';
export * from './components';

// Initialize design system - provides CSS variables for legacy components and app-specific styling
export { injectDesignTokens } from './styles';

// Token exports for direct access
export { tokens, cssVariables, darkModeColors, darkModeCSSVariables } from './tokens';