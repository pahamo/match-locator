import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import AffiliateDisclosure, { withAffiliateAriaLabel } from '../components/legal/AffiliateDisclosure';
import { generateBreadcrumbs } from '../utils/breadcrumbs';

function humanize(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
}

function providerInfo(slug?: string) {
  const s = (slug || '').toLowerCase();
  if (s.includes('sky')) return { name: 'Sky Sports', url: 'https://www.skysports.com/football/fixtures-results' };
  if (s.includes('tnt')) return { name: 'TNT Sports', url: 'https://tntsports.co.uk/football' };
  return { name: slug ? humanize(slug) : 'Provider', url: undefined as string | undefined };
}

const ProviderPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const provider = providerInfo(slug);

  useEffect(() => {
    document.title = `${provider.name} | fixtures.app`;
  }, [provider.name]);

  return (
    <div className="provider-page">
      <Header />
      <main>
        <div className="wrap">
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname, {
            customTitle: provider.name
          })} />
          <h1 style={{ marginTop: 0 }}>{provider.name}</h1>

          <section className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,.06))', marginBottom: 24 }}>
            <h2 style={{ marginTop: 0 }}>Official website</h2>
            {provider.url ? (
              <a
                href={provider.url}
                target="_blank"
                rel="noreferrer noopener"
                {...withAffiliateAriaLabel(provider.name)}
                style={{ display: 'inline-block', padding: '10px 16px', background: '#6366f1', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}
              >
                Visit {provider.name} →
              </a>
            ) : (
              <p>No official link available.</p>
            )}
          </section>

          <AffiliateDisclosure position="footer" providerName={provider.name} />

          <div style={{ marginTop: 12 }}>
            <a href="/" style={{ color: '#6366f1', textDecoration: 'underline' }}>← Back to Schedule</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderPage;
