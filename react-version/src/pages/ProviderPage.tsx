import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import AffiliateDisclosure, { withAffiliateAriaLabel } from '../components/legal/AffiliateDisclosure';
import { updateDocumentMeta } from '../utils/seo';

function humanizeSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function getProviderInfo(slug?: string) {
  const normalized = (slug || '').toLowerCase();
  if (normalized.includes('sky')) {
    return { name: 'Sky Sports', url: 'https://www.skysports.com/football/fixtures-results' };
  }
  if (normalized.includes('tnt')) {
    return { name: 'TNT Sports', url: 'https://tntsports.co.uk/football' };
  }
  return { name: slug ? humanizeSlug(slug) : 'Provider', url: undefined as string | undefined };
}

const ProviderPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const provider = getProviderInfo(slug);

  useEffect(() => {
    const title = `${provider.name} | Match Locator`;
    updateDocumentMeta({ title, description: `${provider.name} viewing options and links.`, canonical: typeof window !== 'undefined' ? window.location.href : undefined });
  }, [provider.name]);

  return (
    <div className="provider-page">
      <Header title={provider.name} subtitle="Official links and viewing options" />
      <main>
        <div className="wrap">
          {/* Inline disclosure immediately above any affiliate CTAs */}
          <AffiliateDisclosure position="inline" providerName={provider.name} />

          <section className="card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ marginTop: 0 }}>Official website</h2>
            {provider.url ? (
              <a
                href={provider.url}
                target="_blank"
                {...withAffiliateAriaLabel(provider.name)}
                style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  background: '#6366f1',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Visit {provider.name} →
              </a>
            ) : (
              <p>No official link available.</p>
            )}
          </section>

          {/* Footer disclosure near end of page content */}
          <AffiliateDisclosure position="footer" providerName={provider.name} />

          <div style={{ marginTop: '12px' }}>
            <a href="/" style={{ color: '#6366f1', textDecoration: 'underline' }}>← Back to Schedule</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderPage;

