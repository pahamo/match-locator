import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(20px, 5vw, 40px)',
          textAlign: 'center',
          background: 'var(--color-background)',
        }}>
          <div style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius)',
            padding: 'clamp(24px, 5vw, 32px)',
            maxWidth: '600px',
            width: '100%',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
              fontWeight: '600',
              color: 'var(--color-text)'
            }}>
              Something went wrong
            </h2>
            <p style={{
              margin: '0 0 24px 0',
              color: 'var(--color-muted)',
              fontSize: 'clamp(0.9rem, 3vw, 1rem)',
              lineHeight: '1.5'
            }}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--color-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '44px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5856eb'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;