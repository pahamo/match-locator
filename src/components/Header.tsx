import React from 'react';

interface HeaderProps {
  // Optional site/app title override
  title?: string;
  // Optional SEO-friendly tagline override
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Match Locator",
  subtitle = "UK football TV schedule — who shows every match"
}) => {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: 'clamp(12px, 4vw, 24px) clamp(16px, 4vw, 24px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 'clamp(12px, 3vw, 16px)',
      minHeight: 'clamp(56px, 8vh, 64px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a 
          href="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            color: 'inherit'
          }}
          aria-label="Match Locator home page"
        >
          <img src="/logo.svg" alt="Match Locator logo" style={{ height: '32px', width: '32px' }} />
        </a>
        <div>
          <a 
            href="/" 
            style={{ 
              textDecoration: 'none',
              color: 'inherit'
            }}
            aria-label="Match Locator home page"
          >
            <div style={{ 
              margin: 0, 
              fontSize: 'clamp(18px, 5vw, 24px)',
              fontWeight: '700',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>
              {title}
            </div>
          </a>
          <p style={{ margin: 0, fontSize: 'clamp(12px, 3vw, 14px)', color: '#6b7280', marginTop: '2px', lineHeight: '1.3' }}>
            {subtitle}
          </p>
        </div>
      </div>
      
      <nav style={{ 
        display: 'flex', 
        gap: 'clamp(12px, 3vw, 20px)',
        alignItems: 'center',
        flexShrink: 0,
        flexWrap: 'wrap'
      }}>
        <a 
          href="/" 
          style={{ 
            color: '#6366f1', 
            textDecoration: 'none', 
            fontSize: 'clamp(14px, 3.5vw, 15px)',
            fontWeight: '500',
            padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Home
        </a>
        <a 
          href="/fixtures" 
          style={{ 
            color: '#6366f1', 
            textDecoration: 'none', 
            fontSize: 'clamp(14px, 3.5vw, 15px)',
            fontWeight: '500',
            padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Fixtures
        </a>
        <a 
          href="/clubs" 
          style={{ 
            color: '#6366f1', 
            textDecoration: 'none', 
            fontSize: 'clamp(14px, 3.5vw, 15px)',
            fontWeight: '500',
            padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Clubs
        </a>
        <a 
          href="/about" 
          style={{ 
            color: '#6366f1', 
            textDecoration: 'none', 
            fontSize: 'clamp(14px, 3.5vw, 15px)',
            fontWeight: '500',
            padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          About
        </a>
      </nav>
    </header>
  );
};

export default Header;
