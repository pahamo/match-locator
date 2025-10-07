import React from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

interface FooterProps {
  onOpenCookieSettings?: () => void;
}

const Footer: React.FC<FooterProps> = React.memo(({ onOpenCookieSettings }) => {
  const isMobile = useIsMobile();

  return (
    <footer
      aria-label="Site footer"
      style={{
        borderTop: '1px solid #e5e7eb',
        background: '#fff',
        marginTop: 32,
        minHeight: '64px', // Prevent layout shift
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
      <div className="wrap" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: isMobile ? 8 : 16,
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          © {new Date().getFullYear()} Match Locator
        </div>
        <nav
          aria-label="Footer navigation"
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 8 : 16,
            alignItems: isMobile ? 'flex-start' : 'center',
            flexWrap: 'wrap',
            width: isMobile ? '100%' : 'auto'
          }}>
          <a
            href="/"
            style={{
              color: '#6366f1',
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}>
            Home
          </a>
          <a
            href="/matches"
            style={{
              color: '#6366f1',
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}>
            Matches
          </a>
          <a
            href="/clubs"
            style={{
              color: '#6366f1',
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}>
            Clubs
          </a>
          <a
            href="/about"
            style={{
              color: '#6366f1',
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}>
            About
          </a>
          <a
            href="/contact"
            style={{
              color: '#6366f1',
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}>
            Contact
          </a>
          <a
            href="/support"
            style={{
              color: '#6366f1',
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}>
            How We Support This Site
          </a>
          <a
            href="/legal/privacy-policy"
            style={{
              color: '#6366f1',
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}>
            Privacy Policy
          </a>
          <a
            href="/legal/terms"
            style={{
              color: '#6366f1',
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}>
            Terms of Service
          </a>
          <a
            href="/admin"
            style={{
              color: '#64748b',
              fontSize: '13px',
              textDecoration: 'none',
              padding: isMobile ? '8px' : '4px 8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              transition: 'all 0.2s',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            Admin
          </a>
          <button
            type="button"
            onClick={onOpenCookieSettings}
            style={{
              color: '#6366f1',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
              minHeight: isMobile ? '44px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: isMobile ? '8px 0' : '0'
            }}
          >
            Cookie settings
          </button>
        </nav>
      </div>
    </footer>
  );
});

export default Footer;
