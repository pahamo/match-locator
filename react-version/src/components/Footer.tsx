import React from 'react';

interface FooterProps {
  onOpenCookieSettings?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenCookieSettings }) => {
  const handleCookieClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onOpenCookieSettings?.();
  };

  return (
    <footer aria-label="Site footer" style={{
      borderTop: '1px solid #e5e7eb',
      background: '#ffffff',
      marginTop: '32px'
    }}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          © {new Date().getFullYear()} Match Locator
        </div>
        <nav aria-label="Legal and cookie links" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="/legal/privacy-policy" className="footer-link" style={{ color: '#6366f1' }}>Privacy Policy</a>
          <a href="/legal/cookie-policy" className="footer-link" style={{ color: '#6366f1' }}>Cookie Policy</a>
          <a href="/legal/terms" className="footer-link" style={{ color: '#6366f1' }}>Terms & Conditions</a>
          <button
            type="button"
            onClick={handleCookieClick}
            className="footer-link"
            style={{ color: '#6366f1', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Cookie settings
          </button>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

