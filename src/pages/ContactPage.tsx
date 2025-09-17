import React, { useEffect } from 'react';
import Header from '../components/Header';
import { ContentCard, TextContainer } from '../design-system';
import { generatePageMeta, updateDocumentMeta } from '../utils/seo';

const ContactPage: React.FC = () => {
  useEffect(() => {
    const meta = generatePageMeta({
      title: 'Contact Us | Football TV Schedule',
      description: 'Get in touch with Football TV Schedule for support, feedback, or business inquiries. We respond within 24 hours.',
      path: '/contact'
    });
    updateDocumentMeta(meta);
  }, []);

  return (
    <div className="contact-page">
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <ContentCard>
          <TextContainer>
            <header>
              <h1>Contact Us</h1>
            </header>
            <blockquote>
              📧 We typically respond within 24 hours during weekdays.
              For urgent broadcast updates, we monitor messages throughout match days.
            </blockquote>

            <section>
              <h2>Get in Touch</h2>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{
                  padding: '24px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'var(--color-surface)'
                }}>
                  <h3>💌 General Inquiries</h3>
                  <p>
                    For general questions, feedback, or suggestions about our football TV schedules:
                  </p>
                  <code>hello@footballtvschedule.com</code>
                </div>

                <div style={{
                  padding: '24px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'var(--color-surface)'
                }}>
                  <h3>📺 Broadcast Updates & Corrections</h3>
                  <p>
                    Found an incorrect broadcast time or missing channel information? Let us know:
                  </p>
                  <code>updates@footballtvschedule.com</code>
                  <p><em>Please include: Match details, correct broadcast info, and your source if possible.</em></p>
                </div>

                <div style={{
                  padding: '24px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'var(--color-surface)'
                }}>
                  <h3>🤝 Business & Partnerships</h3>
                  <p>
                    For business inquiries, affiliate partnerships, or media requests:
                  </p>
                  <code>business@footballtvschedule.com</code>
                </div>

                <div style={{
                  padding: '24px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'var(--color-surface)'
                }}>
                  <h3>🛠️ Technical Support</h3>
                  <p>
                    Experiencing technical issues with our website? Report bugs or problems:
                  </p>
                  <code>support@footballtvschedule.com</code>
                  <p><em>Please include: Your browser, device, and steps to reproduce the issue.</em></p>
                </div>
              </div>
            </section>

            <section>
              <h2>Company Information</h2>
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <strong>Business Name:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>Football TV Schedule</p>
                  </div>
                  <div>
                    <strong>Location:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>United Kingdom</p>
                  </div>
                  <div>
                    <strong>Founded:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>2024</p>
                  </div>
                  <div>
                    <strong>Website:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>
                      <a href="https://footballtvschedule.com" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                        footballtvschedule.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2>Response Times</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span>General Inquiries</span>
                  <strong style={{ color: '#059669' }}>Within 24 hours</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span>Broadcast Corrections</span>
                  <strong style={{ color: '#059669' }}>Within 4 hours</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span>Technical Support</span>
                  <strong style={{ color: '#059669' }}>Within 12 hours</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <span>Business Inquiries</span>
                  <strong style={{ color: '#059669' }}>Within 48 hours</strong>
                </div>
              </div>
              <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                * Response times are for weekdays. Weekend messages are answered on Monday.
              </p>
            </section>

            <section>
              <h2>Frequently Asked Questions</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{
                  padding: '20px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b' }}>
                    How often do you update the TV schedules?
                  </h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                    We update schedules daily and monitor for changes throughout match days.
                    Major updates happen within hours of broadcaster announcements.
                  </p>
                </div>

                <div style={{
                  padding: '20px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b' }}>
                    Can you add more competitions or countries?
                  </h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                    We're always looking to expand! Send us an email with your suggestions
                    and we'll consider adding new competitions based on user demand.
                  </p>
                </div>

                <div style={{
                  padding: '20px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b' }}>
                    Do you offer an API for developers?
                  </h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                    We're working on an API for developers and businesses. Contact our business
                    email if you're interested in early access or partnerships.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2>Legal & Privacy</h2>
              <p style={{ marginBottom: '16px' }}>
                For legal matters, privacy concerns, or data protection questions:
              </p>
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
                <a
                  href="/affiliate-disclosure"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  Affiliate Disclosure
                </a>
              </div>
            </section>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #22c55e',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: '600', color: '#15803d' }}>
                We Value Your Feedback! 💚
              </h3>
              <p style={{ margin: '0', color: '#15803d' }}>
                Your suggestions help us improve Football TV Schedule for everyone.
                Whether it's a missing feature, incorrect information, or just a general comment,
                we'd love to hear from you.
              </p>
            </div>
          </TextContainer>
        </ContentCard>
      </main>
    </div>
  );
};

export default ContactPage;