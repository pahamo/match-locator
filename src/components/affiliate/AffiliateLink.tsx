import React from 'react';

interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  partner: string;
  trackingLabel?: 'fixture-card' | 'competition-hero' | 'match-detail' | 'header-nav' | 'footer' | 'sidebar' | 'content' | 'how-to-watch';
  pageType?: string;
  competition?: string;
  className?: string;
  style?: React.CSSProperties;
  showDisclosure?: boolean;
  disclosureText?: string;
  trackingId?: string;
  target?: '_blank' | '_self';
  ariaLabel?: string;
}

interface AffiliateClickData {
  partner: string;
  placement: string;
  pageType: string;
  competition?: string;
  timestamp: number;
  url: string;
}

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
    gtag?: (command: string, action: string, parameters: any) => void;
  }
}

/**
 * AffiliateLink component for FTC-compliant affiliate marketing
 * Automatically adds proper rel attributes and tracking
 */
export const AffiliateLink: React.FC<AffiliateLinkProps> = ({
  href,
  children,
  partner,
  trackingLabel = 'content',
  pageType = 'unknown',
  competition,
  className = '',
  style,
  showDisclosure = true,
  disclosureText,
  trackingId,
  target = '_blank',
  ariaLabel
}) => {
  // Track affiliate link clicks for analytics
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Defer tracking to prevent blocking main thread
    setTimeout(() => {
      try {
        // Track to Plausible Analytics
        if (window.plausible) {
          // Send general affiliate click event
          window.plausible('Affiliate Click', {
            props: {
              partner: partner,
              placement: trackingLabel,
              pageType: pageType,
              ...(competition && { competition })
            }
          });

          // Send partner-specific event
          window.plausible(`Click: ${partner}`, {
            props: {
              placement: trackingLabel,
              pageType: pageType,
              ...(competition && { competition })
            }
          });
        }

        // Store in localStorage for pre-approval analysis
        const clickData: AffiliateClickData = {
          partner: partner,
          placement: trackingLabel,
          pageType: pageType,
          competition: competition,
          timestamp: Date.now(),
          url: href
        };

        const existingData = localStorage.getItem('affiliate_clicks');
        const clicks: AffiliateClickData[] = existingData ? JSON.parse(existingData) : [];
        clicks.push(clickData);

        // Keep only last 100 clicks to prevent localStorage bloat
        if (clicks.length > 100) {
          clicks.splice(0, clicks.length - 100);
        }

        localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));

        // Legacy gtag tracking for backwards compatibility
        if (window.gtag) {
          window.gtag('event', 'affiliate_click', {
            partner: partner,
            url: href,
            tracking_id: trackingId || 'unknown'
          });
        }
      } catch (error) {
        console.warn('[Affiliate] Tracking failed:', error);
      }
    }, 0);
  };

  // Generate disclosure text
  const defaultDisclosureText = `Affiliate link to ${partner}`;
  const finalDisclosureText = disclosureText || defaultDisclosureText;

  // Enhanced aria-label for accessibility
  const enhancedAriaLabel = ariaLabel || `${children} (affiliate link to ${partner})`;

  return (
    <span className="affiliate-link-wrapper">
      <a
        href={href}
        target={target}
        rel="noopener noreferrer sponsored" // FTC-compliant attributes
        className={`affiliate-link ${className}`}
        style={style}
        onClick={handleClick}
        aria-label={enhancedAriaLabel}
        data-affiliate-partner={partner}
        data-tracking-id={trackingId}
      >
        {children}
      </a>

      {showDisclosure && (
        <span
          className="affiliate-disclosure-inline"
          style={{
            fontSize: '12px',
            opacity: 0.6,
            marginLeft: '4px',
            lineHeight: 1
          }}
          title={finalDisclosureText}
          aria-label="Affiliate link disclosure"
        >
          ℹ️
        </span>
      )}
    </span>
  );
};

/**
 * Provider-specific affiliate link components
 */

export const SkyAffiliateLink: React.FC<Omit<AffiliateLinkProps, 'partner'>> = (props) => (
  <AffiliateLink {...props} partner="Sky Sports" />
);

export const AmazonAffiliateLink: React.FC<Omit<AffiliateLinkProps, 'partner'>> = (props) => (
  <AffiliateLink {...props} partner="Amazon Prime Video" />
);

export const TNTAffiliateLink: React.FC<Omit<AffiliateLinkProps, 'partner'>> = (props) => (
  <AffiliateLink {...props} partner="TNT Sports" />
);

export const NOWTVAffiliateLink: React.FC<Omit<AffiliateLinkProps, 'partner'>> = (props) => (
  <AffiliateLink {...props} partner="NOW TV" />
);

/**
 * Affiliate button component for prominent CTAs
 */
interface AffiliateButtonProps extends AffiliateLinkProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const AffiliateButton: React.FC<AffiliateButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  style,
  children,
  showDisclosure = true,
  ...props
}) => {
  const buttonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
    borderRadius: '6px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
    ...(variant === 'primary' && {
      background: '#3b82f6',
      color: 'white',
      border: '2px solid #3b82f6'
    }),
    ...(variant === 'secondary' && {
      background: '#6b7280',
      color: 'white',
      border: '2px solid #6b7280'
    }),
    ...(variant === 'outline' && {
      background: 'transparent',
      color: '#3b82f6',
      border: '2px solid #3b82f6'
    }),
    ...style
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
      <AffiliateLink
        {...props}
        className={`affiliate-button ${className}`}
        style={buttonStyles}
        showDisclosure={false} // Show disclosure separately for buttons
      >
        {children}
      </AffiliateLink>

      {showDisclosure && (
        <span style={{
          fontSize: '11px',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          Affiliate partnership - we may earn commission
        </span>
      )}
    </div>
  );
};

/**
 * Inline disclosure component for content sections
 */
interface InlineDisclosureProps {
  style?: React.CSSProperties;
  className?: string;
}

export const InlineDisclosure: React.FC<InlineDisclosureProps> = ({
  style,
  className = ''
}) => (
  <div
    className={`inline-disclosure ${className}`}
    style={{
      fontSize: '13px',
      color: '#6b7280',
      fontStyle: 'italic',
      padding: '8px 12px',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
      marginTop: '12px',
      ...style
    }}
  >
    💡 <strong>Disclosure:</strong> Links marked "affiliate" earn us commission.
    <a
      href="/affiliate-disclosure"
      style={{ color: '#3b82f6', textDecoration: 'underline', marginLeft: '4px' }}
    >
      Learn more
    </a>
  </div>
);

// Type declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters: any) => void;
  }
}