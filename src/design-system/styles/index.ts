import { cssVariables } from '../tokens';

// Inject CSS variables into the document head
// This provides CSS custom properties for legacy components and app-specific tokens
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