import React, { useState } from 'react';
import { usePublicCompetitions } from '../hooks/useCompetitions';
import { useIsMobile } from '../hooks/useMediaQuery';
import { getCompetitionIcon, getCompetitionLogo } from '../config/competitions';
import OptimizedImage from './OptimizedImage';

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
  const [competitionsDropdownOpen, setCompetitionsDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentPath, setCurrentPath] = useState('');

  // Detect mobile viewport using custom hook (replaces window.innerWidth checks)
  const isMobile = useIsMobile();

  // Track current page for active indicators
  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Helper to determine if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  // Keyboard navigation for mobile menu
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Focus trap for mobile menu
  React.useEffect(() => {
    if (!mobileMenuOpen) return;

    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;

    const focusableElements = mobileMenu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: wrap from first to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Focus first element when menu opens
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [mobileMenuOpen]);

  // Load competitions dynamically from database
  const { competitions: competitionsData } = usePublicCompetitions();

  // Format competitions for display with icons and logos
  const competitions = competitionsData.map(comp => ({
    name: comp.name,
    slug: comp.slug,
    icon: getCompetitionIcon(comp.slug),
    logo: getCompetitionLogo(comp.slug) || undefined
  }));

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
      position: 'relative',
      zIndex: 100
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
          <OptimizedImage src="/logo.svg" alt="Match Locator logo" width={28} height={28} lazy={false} />
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
            display: isMobile ? 'none' : 'block'
          }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav style={{
        display: isMobile ? 'none' : 'flex',
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
            alignItems: 'center',
            backgroundColor: isActive('/') ? '#eef2ff' : 'transparent',
            borderBottom: isActive('/') ? '2px solid #6366f1' : '2px solid transparent'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = isActive('/') ? '#eef2ff' : '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive('/') ? '#eef2ff' : 'transparent'}
          aria-current={isActive('/') ? 'page' : undefined}
        >
          Home
        </a>
        <a
          href="/matches"
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
            alignItems: 'center',
            backgroundColor: isActive('/matches') ? '#eef2ff' : 'transparent',
            borderBottom: isActive('/matches') ? '2px solid #6366f1' : '2px solid transparent'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = isActive('/matches') ? '#eef2ff' : '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive('/matches') ? '#eef2ff' : 'transparent'}
          aria-current={isActive('/matches') ? 'page' : undefined}
        >
          Matches
        </a>

        {/* Competitions Dropdown */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => {
            if (dropdownTimeout) {
              clearTimeout(dropdownTimeout);
              setDropdownTimeout(null);
            }
            setCompetitionsDropdownOpen(true);
          }}
          onMouseLeave={() => {
            const timeout = setTimeout(() => {
              setCompetitionsDropdownOpen(false);
            }, 150);
            setDropdownTimeout(timeout);
          }}
        >
          <a
            href="/competitions"
            role="button"
            aria-haspopup="true"
            aria-expanded={competitionsDropdownOpen}
            aria-current={isActive('/competitions') ? 'page' : undefined}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCompetitionsDropdownOpen(!competitionsDropdownOpen);
              } else if (e.key === 'Escape') {
                setCompetitionsDropdownOpen(false);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setCompetitionsDropdownOpen(true);
              }
            }}
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
              alignItems: 'center',
              gap: '4px',
              backgroundColor: isActive('/competitions') ? '#eef2ff' : (competitionsDropdownOpen ? '#f8fafc' : 'transparent'),
              borderBottom: isActive('/competitions') ? '2px solid #6366f1' : '2px solid transparent'
            }}
          >
            Competitions
            <span style={{
              fontSize: '10px',
              transform: competitionsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>
              ▼
            </span>
          </a>

          {/* Dropdown Menu */}
          {competitionsDropdownOpen && (
            <div
              role="menu"
              aria-label="Competition list"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
                minWidth: '220px',
                zIndex: 1000,
                marginTop: '2px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setCompetitionsDropdownOpen(false);
                }
              }}
            >
              <div style={{ padding: '8px 0' }}>
                <a
                  href="/competitions"
                  role="menuitem"
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📊 All Competitions
                </a>
                {competitions.map((comp) => (
                  <a
                    key={comp.slug}
                    href={`/competitions/${comp.slug}`}
                    role="menuitem"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      color: '#6366f1',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: '500',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {comp.logo ? (
                      <OptimizedImage
                        src={comp.logo}
                        alt={`${comp.name} logo`}
                        width={16}
                        height={16}
                      />
                    ) : (
                      comp.icon
                    )}
                    {comp.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

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
            alignItems: 'center',
            backgroundColor: isActive('/clubs') ? '#eef2ff' : 'transparent',
            borderBottom: isActive('/clubs') ? '2px solid #6366f1' : '2px solid transparent'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = isActive('/clubs') ? '#eef2ff' : '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive('/clubs') ? '#eef2ff' : 'transparent'}
          aria-current={isActive('/clubs') ? 'page' : undefined}
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
            alignItems: 'center',
            backgroundColor: isActive('/about') ? '#eef2ff' : 'transparent',
            borderBottom: isActive('/about') ? '2px solid #6366f1' : '2px solid transparent'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = isActive('/about') ? '#eef2ff' : '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive('/about') ? '#eef2ff' : 'transparent'}
          aria-current={isActive('/about') ? 'page' : undefined}
        >
          About
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: isMobile ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          minWidth: '48px',
          minHeight: '48px',
          cursor: 'pointer',
          color: '#6366f1',
          padding: 0
        }}
        aria-label="Main navigation menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
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
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            minWidth: '200px',
            zIndex: 50,
            display: isMobile ? 'block' : 'none'
          }}
        >
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
                display: 'block',
                backgroundColor: isActive('/') ? '#eef2ff' : 'transparent',
                borderLeft: isActive('/') ? '3px solid #6366f1' : '3px solid transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = isActive('/') ? '#eef2ff' : '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive('/') ? '#eef2ff' : 'transparent'}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              Home
            </a>
            <a
              href="/matches"
              style={{
                color: '#6366f1',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                transition: 'background-color 0.2s',
                display: 'block',
                backgroundColor: isActive('/matches') ? '#eef2ff' : 'transparent',
                borderLeft: isActive('/matches') ? '3px solid #6366f1' : '3px solid transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = isActive('/matches') ? '#eef2ff' : '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive('/matches') ? '#eef2ff' : 'transparent'}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/matches') ? 'page' : undefined}
            >
              Matches
            </a>

            {/* Mobile Competitions Section */}
            <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '8px', paddingTop: '8px' }}>
              <div style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Competitions
              </div>
              <a
                href="/competitions"
                style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '10px 16px',
                  transition: 'background-color 0.2s',
                  display: 'block',
                  backgroundColor: isActive('/competitions') && currentPath === '/competitions' ? '#eef2ff' : 'transparent',
                  borderLeft: isActive('/competitions') && currentPath === '/competitions' ? '3px solid #6366f1' : '3px solid transparent'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = (isActive('/competitions') && currentPath === '/competitions') ? '#eef2ff' : '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = (isActive('/competitions') && currentPath === '/competitions') ? '#eef2ff' : 'transparent'}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={(isActive('/competitions') && currentPath === '/competitions') ? 'page' : undefined}
              >
                📊 All Competitions
              </a>
              {competitions.map((comp) => (
                <a
                  key={comp.slug}
                  href={`/competitions/${comp.slug}`}
                  style={{
                    color: '#6366f1',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    padding: '8px 16px 8px 32px',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: currentPath === `/competitions/${comp.slug}` ? '#eef2ff' : 'transparent',
                    borderLeft: currentPath === `/competitions/${comp.slug}` ? '3px solid #6366f1' : '3px solid transparent'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = currentPath === `/competitions/${comp.slug}` ? '#eef2ff' : '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = currentPath === `/competitions/${comp.slug}` ? '#eef2ff' : 'transparent'}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={currentPath === `/competitions/${comp.slug}` ? 'page' : undefined}
                >
                  {comp.logo ? (
                    <OptimizedImage
                      src={comp.logo}
                      alt={`${comp.name} logo`}
                      width={14}
                      height={14}
                    />
                  ) : (
                    comp.icon
                  )}
                  {comp.name}
                </a>
              ))}
            </div>

            <a
              href="/clubs"
              style={{
                color: '#6366f1',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                transition: 'background-color 0.2s',
                display: 'block',
                borderTop: '1px solid #f3f4f6',
                marginTop: '8px',
                backgroundColor: isActive('/clubs') ? '#eef2ff' : 'transparent',
                borderLeft: isActive('/clubs') ? '3px solid #6366f1' : '3px solid transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = isActive('/clubs') ? '#eef2ff' : '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive('/clubs') ? '#eef2ff' : 'transparent'}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/clubs') ? 'page' : undefined}
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
                display: 'block',
                backgroundColor: isActive('/about') ? '#eef2ff' : 'transparent',
                borderLeft: isActive('/about') ? '3px solid #6366f1' : '3px solid transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = isActive('/about') ? '#eef2ff' : '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = isActive('/about') ? '#eef2ff' : 'transparent'}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/about') ? 'page' : undefined}
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