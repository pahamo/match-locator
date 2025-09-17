import React, { useEffect } from 'react';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { ContentCard, TextContainer } from '../design-system';
import { generatePageMeta, updateDocumentMeta } from '../utils/seo';
import { useBreadcrumbs } from '../utils/breadcrumbs';

const ContactPage: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  useEffect(() => {
    const meta = generatePageMeta({
      title: 'Contact | Match Locator',
      description: 'Get in touch with Match Locator for support, feedback, or general inquiries. We respond within 48 hours.',
      path: '/contact'
    });
    updateDocumentMeta(meta);
  }, []);

  return (
    <div className="contact-page">
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <Breadcrumbs items={breadcrumbs} />
        <ContentCard>
          <TextContainer>
            <header>
              <h1>Contact</h1>
            </header>

            <div style={{
              textAlign: 'center',
              padding: '32px 24px',
              background: '#f8fafc',
              borderRadius: '12px',
              marginBottom: '32px'
            }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: '#1f2937' }}>
                Email: hello@matchlocator.com
              </h2>
            </div>

            <section style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                We'd love to hear from you about:
              </p>
              <ul style={{ marginLeft: '20px', lineHeight: '1.8', fontSize: '1rem' }}>
                <li>Incorrect broadcast information</li>
                <li>Missing fixtures or channels</li>
                <li>Feature suggestions</li>
                <li>Technical issues</li>
                <li>General feedback</li>
              </ul>
              <p style={{ marginTop: '24px', color: '#6b7280' }}>
                We aim to respond within 48 hours during weekdays.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2>About Match Locator</h2>
              <p>
                Match Locator is an independent website dedicated to helping UK football
                fans find matches on TV.
              </p>
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <strong>Website:</strong> matchlocator.com
                  </div>
                  <div>
                    <strong>Operating as:</strong> Independent Publisher
                  </div>
                  <div>
                    <strong>Location:</strong> United Kingdom
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2>Legal</h2>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="/legal/privacy-policy"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  Privacy Policy
                </a>
                <a
                  href="/legal/terms"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  Terms of Service
                </a>
              </div>
            </section>
          </TextContainer>
        </ContentCard>
      </main>
    </div>
  );
};

export default ContactPage;