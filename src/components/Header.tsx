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
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: '16px',
      minHeight: '64px'
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
          >
            <div style={{ 
              margin: 0, 
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              {title}
            </div>
          </a>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
            {subtitle}
          </p>
        </div>
      </div>
      
      <nav style={{ 
        display: 'flex', 
        gap: '20px',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <a 
          href="/" 
          style={{ 
            color: '#6366f1', 
            textDecoration: 'none', 
            fontSize: '15px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
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
            fontSize: '15px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
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
            fontSize: '15px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
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
            fontSize: '15px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          About
        </a>
        <a 
          href="/admin" 
          style={{ 
            color: '#64748b', 
            textDecoration: 'none', 
            fontSize: '14px',
            fontWeight: '400',
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
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
      </nav>
    </header>
  );
};

export default Header;
