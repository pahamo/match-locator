import React from 'react';

interface FooterProps {
  onOpenCookieSettings?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenCookieSettings }) => {
  return (
    <footer aria-label="Site footer" style={{ borderTop: '1px solid #e5e7eb', background: '#fff', marginTop: 32 }}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          © {new Date().getFullYear()} fixtures.app
        </div>
        <nav aria-label="Footer navigation" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="/" style={{ color: '#6366f1' }}>Home</a>
          <a href="/fixtures" style={{ color: '#6366f1' }}>Fixtures</a>
          <a href="/clubs" style={{ color: '#6366f1' }}>Clubs</a>
          <a href="/about" style={{ color: '#6366f1' }}>About</a>
          <button type="button" onClick={onOpenCookieSettings} style={{ color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Cookie settings
          </button>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

