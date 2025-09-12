import React, { useState } from 'react';

interface HeaderProps {
  // Optional site/app title override
  title?: string;
  // Optional SEO-friendly tagline override
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = React.memo(({ 
  title = "Match Locator",
  subtitle = "UK football TV schedule — who shows every match"
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: 'clamp(8px, 2vw, 16px) clamp(16px, 4vw, 24px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: '12px',
      minHeight: 'clamp(48px, 6vh, 56px)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        <a 
          href="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            color: 'inherit',
            flexShrink: 0
          }}
          aria-label="Match Locator home page"
        >
          <img src="/logo.svg" alt="Match Locator logo" style={{ height: '28px', width: '28px' }} />
        </a>
        <div style={{ minWidth: 0, flex: 1 }}>
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
              fontSize: 'clamp(16px, 4vw, 20px)',
              fontWeight: '700',
              color: '#1f2937',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title}
            </div>
          </a>
          <p style={{ 
            margin: 0, 
            fontSize: 'clamp(11px, 2.5vw, 13px)', 
            color: '#6b7280', 
            marginTop: '1px', 
            lineHeight: '1.3',
            display: window.innerWidth <= 640 ? 'none' : 'block'
          }}>
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <nav style={{ 
        display: window.innerWidth <= 768 ? 'none' : 'flex',
        gap: 'clamp(8px, 2vw, 16px)',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <a 
          href="/" 
          style={{ 
            color: '#6366f1', 
            textDecoration: 'none', 
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            minHeight: '36px',
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
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            minHeight: '36px',
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
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            minHeight: '36px',
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
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            minHeight: '36px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          About
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: window.innerWidth <= 768 ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          color: '#6366f1',
          padding: 0
        }}
        aria-label="Toggle mobile menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          minWidth: '140px',
          zIndex: 50,
          display: window.innerWidth <= 768 ? 'block' : 'none'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
            <a 
              href="/" 
              style={{ 
                color: '#6366f1', 
                textDecoration: 'none', 
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                transition: 'background-color 0.2s',
                display: 'block'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="/fixtures" 
              style={{ 
                color: '#6366f1', 
                textDecoration: 'none', 
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                transition: 'background-color 0.2s',
                display: 'block'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Fixtures
            </a>
            <a 
              href="/clubs" 
              style={{ 
                color: '#6366f1', 
                textDecoration: 'none', 
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                transition: 'background-color 0.2s',
                display: 'block'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Clubs
            </a>
            <a 
              href="/about" 
              style={{ 
                color: '#6366f1', 
                textDecoration: 'none', 
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                transition: 'background-color 0.2s',
                display: 'block'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
          </nav>
        </div>
      )}
    </header>
  );
});

export default Header;
