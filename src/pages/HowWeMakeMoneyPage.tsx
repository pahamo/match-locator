import React, { useEffect } from 'react';
import Header from '../components/Header';
import { ContentCard, TextContainer } from '../design-system';
import { generatePageMeta, updateDocumentMeta } from '../utils/seo';

const HowWeMakeMoneyPage: React.FC = () => {
  useEffect(() => {
    const meta = generatePageMeta({
      title: 'How We Make Money | Football TV Schedule',
      description: 'Learn about our transparent revenue model and how affiliate partnerships help keep our football TV schedules free.',
      path: '/how-we-make-money'
    });
    updateDocumentMeta(meta);
  }, []);

  return (
    <div className="how-we-make-money-page">
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <ContentCard>
          <TextContainer>
            <header>
              <h1>How We Make Money</h1>
            </header>
            <blockquote>
              <strong>🎯 Our Mission:</strong> To provide the most accurate, up-to-date football TV schedules completely free for all users. Our revenue model supports this mission while maintaining editorial independence.
            </blockquote>

            <section>
              <h2>Our Revenue Sources</h2>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                    💰 Affiliate Partnerships (Primary Revenue)
                  </h3>
                  <p style={{ marginBottom: '12px' }}>
                    We earn commission when users sign up for streaming services or TV packages through our
                    affiliate links. This includes:
                  </p>
                  <ul style={{ marginLeft: '20px' }}>
                    <li>Sky Sports and Sky TV subscriptions</li>
                    <li>TNT Sports packages</li>
                    <li>Amazon Prime Video subscriptions</li>
                    <li>Streaming device purchases</li>
                    <li>VPN services for international viewing</li>
                  </ul>
                  <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                    <strong>Cost to you:</strong> £0 - Prices are identical whether you use our links or not.
                  </p>
                </div>

                <div style={{
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                    📊 Potential Future Revenue
                  </h3>
                  <p style={{ marginBottom: '12px' }}>
                    As we grow, we may explore these additional revenue sources:
                  </p>
                  <ul style={{ marginLeft: '20px' }}>
                    <li>Premium features for power users</li>
                    <li>API access for businesses</li>
                    <li>Sponsored content (clearly marked)</li>
                    <li>Premium match alerts and notifications</li>
                  </ul>
                  <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                    <strong>Our commitment:</strong> Core TV schedules will always remain free.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2>What Your Support Funds</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>🖥️</span>
                  <div>
                    <strong>Infrastructure & Hosting</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      Database hosting, CDN, security, and performance optimization
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>🔍</span>
                  <div>
                    <strong>Data Research & Verification</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      Manually checking broadcast schedules, verifying fixture times
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <div>
                    <strong>Feature Development</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      New competitions, improved search, mobile apps, notifications
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>💬</span>
                  <div>
                    <strong>Customer Support</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      Responding to user feedback, fixing bugs, updating schedules
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2>Our Editorial Independence</h2>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>TV schedules are never influenced by partnerships</strong> -
                    We show accurate broadcast information regardless of affiliate relationships
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Honest recommendations only</strong> -
                    We only promote services we genuinely believe will benefit users
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Clear disclosure</strong> -
                    All affiliate content is clearly marked and explained
                  </li>
                  <li>
                    <strong>User-first approach</strong> -
                    Your experience and accurate information comes before revenue
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2>Supporting Us</h2>
              <p style={{ marginBottom: '16px' }}>
                The best way to support Football TV Schedule is to use our affiliate links when you're
                ready to sign up for streaming services or TV packages. Here's how:
              </p>

              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}>
                  <strong>✅ Helpful:</strong> Using our affiliate links when you're already planning to subscribe
                </div>
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}>
                  <strong>✅ Helpful:</strong> Sharing our site with fellow football fans
                </div>
                <div style={{
                  padding: '16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px'
                }}>
                  <strong>❌ Not helpful:</strong> Subscribing to services you don't need just to support us
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Remember: You're never obligated to use our links, and prices are the same either way.
              </p>
            </section>

            <section>
              <h2>Transparency Report</h2>
              <p>
                We believe in complete transparency about our business. Here are our key metrics:
              </p>
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Revenue from affiliate links:</span>
                    <strong>~95% of total revenue</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Percentage spent on infrastructure:</span>
                    <strong>~40%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Percentage spent on development:</span>
                    <strong>~60%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>User data sold:</span>
                    <strong>£0 (We don't sell data)</strong>
                  </div>
                </div>
                <p style={{ margin: '16px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  * Figures are estimates based on current business model
                </p>
              </div>
            </section>

            <div style={{
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: '600' }}>
                Questions About Our Revenue Model?
              </h3>
              <p style={{ margin: '0 0 16px 0' }}>
                We're committed to transparency. If you have questions about how we make money
                or our affiliate partnerships, we're happy to answer.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href="/contact"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  Contact Us
                </a>
                <a
                  href="/affiliate-disclosure"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  Full Affiliate Disclosure
                </a>
              </div>
            </div>
          </TextContainer>
        </ContentCard>
      </main>
    </div>
  );
};

export default HowWeMakeMoneyPage;