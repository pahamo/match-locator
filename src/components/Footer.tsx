import React from 'react';

interface FooterProps {
  onOpenCookieSettings?: () => void;
}

const Footer: React.FC<FooterProps> = React.memo(({ onOpenCookieSettings }) => {
  return (
    <footer 
      aria-label="Site footer" 
      style={{ 
        borderTop: '1px solid #e5e7eb', 
        background: '#fff', 
        marginTop: 32,
        minHeight: '64px' // Prevent layout shift
      }}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          © {new Date().getFullYear()} Match Locator
        </div>
        <nav aria-label="Footer navigation" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>Home</a>
          <a href="/fixtures" style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>Fixtures</a>
          <a href="/clubs" style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>Clubs</a>
          <a href="/about" style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>About</a>
          <a href="/legal/privacy-policy" style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>Privacy</a>
          <a href="/legal/terms" style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>Terms</a>
          <a 
            href="/admin" 
            style={{ 
              color: '#64748b', 
              fontSize: '13px', 
              textDecoration: 'none',
              padding: '4px 8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              transition: 'all 0.2s'
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
              textDecoration: 'underline'
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
