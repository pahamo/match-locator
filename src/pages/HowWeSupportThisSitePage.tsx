import React, { useEffect } from 'react';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { ContentCard, TextContainer } from '../design-system';
import { generatePageMeta, updateDocumentMeta } from '../utils/seo';
import { useBreadcrumbs } from '../utils/breadcrumbs';

const HowWeSupportThisSitePage: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  useEffect(() => {
    const meta = generatePageMeta({
      title: 'How We Support This Site | Match Locator',
      description: 'Learn how Match Locator stays free and independent. Our transparent approach to potential future affiliate partnerships.',
      path: '/support'
    });
    updateDocumentMeta(meta);
  }, []);

  return (
    <div className="support-page">
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <Breadcrumbs items={breadcrumbs} />
        <ContentCard>
          <TextContainer>
            <header>
              <h1>How We Support Match Locator</h1>
            </header>

            <p style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '2rem' }}>
              Match Locator is currently a free resource for finding football on UK TV.<br />
              We're committed to keeping it that way.
            </p>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2>Keeping the Site Free</h2>
              <p>
                Our goal is to provide accurate, up-to-date TV schedules for all football
                fans in the UK at no cost.
              </p>
              <p>
                In the future, we may earn small commissions if you choose to sign up for
                streaming services through links on our site. If this happens:
              </p>
              <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                <li>It will never cost you extra</li>
                <li>It won't influence which broadcasters we show</li>
                <li>We'll always clearly mark any affiliate links</li>
              </ul>
              <p>
                Currently, we're focused solely on building the most comprehensive and
                accurate football TV schedule platform possible.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2>Our Commitment</h2>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>✓ Free access to all TV schedule information</li>
                  <li>✓ No registration or payment required</li>
                  <li>✓ Independent and unbiased broadcaster information</li>
                  <li>✓ Regular updates throughout match days</li>
                </ul>
              </div>
            </section>

            <div style={{
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0', fontSize: '1rem', color: '#374151' }}>
                Questions? Contact us at{' '}
                <a
                  href="mailto:hello@matchlocator.com"
                  style={{ color: '#3b82f6', textDecoration: 'underline' }}
                >
                  hello@matchlocator.com
                </a>
              </p>
            </div>
          </TextContainer>
        </ContentCard>
      </main>
    </div>
  );
};

export default HowWeSupportThisSitePage;