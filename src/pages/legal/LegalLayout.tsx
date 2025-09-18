import React, { useEffect, useMemo, useRef } from 'react';
import { ContentCard, TextContainer } from '../../design-system';
import Header from '../../components/Header';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useBreadcrumbs } from '../../utils/breadcrumbs';

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
  const breadcrumbs = useBreadcrumbs();
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
      <Header />
      <main ref={mainRef} tabIndex={-1} className="wrap" aria-labelledby="legal-title" style={{ paddingTop: 'var(--layout-page-top-margin)', outline: 'none' }}>
        <Breadcrumbs items={breadcrumbs} style={{ paddingLeft: '24px', paddingRight: '24px' }} />
        <ContentCard>
          <TextContainer>
            <header>
              <h1 id="legal-title">{title}</h1>
              <p className="muted">Last updated: {lastUpdated || today}</p>
            </header>

            {toc.length > 0 && (
              <nav aria-label="Table of contents">
                <h2>Contents</h2>
                <ul>
                  {toc.map(item => (
                    <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
                  ))}
                </ul>
              </nav>
            )}

            <article>{children}</article>
          </TextContainer>
        </ContentCard>
      </main>
    </div>
  );
};

export default LegalLayout;

