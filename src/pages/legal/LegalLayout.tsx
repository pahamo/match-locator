import React, { useEffect, useMemo, useRef } from 'react';

interface TocItem { id: string; label: string }

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string; // YYYY-MM-DD
  robotsNoIndex?: boolean;
  toc?: TocItem[];
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  lastUpdated,
  robotsNoIndex = true,
  toc = [],
  children,
}) => {
  const mainRef = useRef<HTMLElement>(null);
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  useEffect(() => { mainRef.current?.focus(); }, []);

  useEffect(() => {
    // Minimal robots control for legal pages
    const name = 'robots';
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', robotsNoIndex ? 'noindex,follow' : 'index,follow');
    return () => { meta?.setAttribute('content', 'index,follow'); };
  }, [robotsNoIndex]);

  return (
    <div className="legal-layout">
      <main ref={mainRef} tabIndex={-1} className="wrap" aria-labelledby="legal-title" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <header style={{ marginBottom: 16 }}>
          <h1 id="legal-title" style={{ margin: 0 }}>{title}</h1>
          <p className="muted" style={{ margin: '8px 0 0' }}>Last updated: {lastUpdated || today}</p>
        </header>

        {toc.length > 0 && (
          <nav aria-label="Table of contents" style={{ margin: '12px 0 20px' }}>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {toc.map(item => (
                <li key={item.id}><a href={`#${item.id}`} style={{ color: '#6366f1' }}>{item.label}</a></li>
              ))}
            </ul>
          </nav>
        )}

        <article>{children}</article>
      </main>
    </div>
  );
};

export default LegalLayout;

