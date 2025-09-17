import React, { useState } from 'react';

interface AffiliateDisclosureBannerProps {
  variant?: 'compact' | 'full';
  style?: React.CSSProperties;
  className?: string;
  dismissible?: boolean;
}

/**
 * Small affiliate disclosure banner for pages with affiliate links
 */
export const AffiliateDisclosureBanner: React.FC<AffiliateDisclosureBannerProps> = ({
  variant = 'compact',
  style,
  className = '',
  dismissible = true
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const baseStyle: React.CSSProperties = {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    padding: variant === 'compact' ? '8px 12px' : '12px 16px',
    fontSize: variant === 'compact' ? '12px' : '13px',
    color: '#92400e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '16px',
    ...style
  };

  return (
    <div className={`affiliate-disclosure-banner ${className}`} style={baseStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <span>💰</span>
        <span>
          {variant === 'compact' ? (
            <>
              This page contains affiliate links.{' '}
              <a
                href="/affiliate-disclosure"
                style={{ color: '#92400e', textDecoration: 'underline', fontWeight: '600' }}
              >
                Learn more
              </a>
            </>
          ) : (
            <>
              <strong>Affiliate Notice:</strong> We may earn commission from links on this page.
              This helps support our free football TV schedules.{' '}
              <a
                href="/affiliate-disclosure"
                style={{ color: '#92400e', textDecoration: 'underline', fontWeight: '600' }}
              >
                Full disclosure
              </a>
            </>
          )}
        </span>
      </div>

      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#92400e',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            lineHeight: '1',
            flexShrink: 0
          }}
          aria-label="Dismiss affiliate disclosure notice"
          title="Dismiss notice"
        >
          ×
        </button>
      )}
    </div>
  );
};

/**
 * Sticky affiliate disclosure for pages with heavy affiliate content
 */
export const StickyAffiliateDisclosure: React.FC = () => {
  const [dismissed, setDismissed] = useState(() => {
    // Check if user has dismissed this before (localStorage)
    try {
      return localStorage.getItem('affiliate-disclosure-dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('affiliate-disclosure-dismissed', 'true');
    } catch {
      // Ignore localStorage errors
    }
  };

  if (dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#92400e',
        maxWidth: '320px',
        boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>💰</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            Affiliate Links Notice
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            We earn commission from some links to help keep our football schedules free.
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#92400e',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            lineHeight: '1',
            flexShrink: 0
          }}
          aria-label="Dismiss affiliate notice"
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
        <a
          href="/affiliate-disclosure"
          style={{
            color: '#92400e',
            textDecoration: 'underline',
            fontWeight: '600'
          }}
        >
          Full Disclosure
        </a>
        <a
          href="/how-we-make-money"
          style={{
            color: '#92400e',
            textDecoration: 'underline',
            fontWeight: '600'
          }}
        >
          How We Make Money
        </a>
      </div>
    </div>
  );
};