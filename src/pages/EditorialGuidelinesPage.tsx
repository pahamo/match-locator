import React, { useEffect } from 'react';
import Header from '../components/Header';
import { generatePageMeta, updateDocumentMeta } from '../utils/seo';

const EditorialGuidelinesPage: React.FC = () => {
  useEffect(() => {
    const meta = generatePageMeta({
      title: 'Editorial Guidelines | Football TV Schedule',
      description: 'Our editorial guidelines ensure accurate, unbiased football TV listings while maintaining transparency about affiliate partnerships.',
      path: '/editorial-guidelines'
    });
    updateDocumentMeta(meta);
  }, []);

  return (
    <div className="editorial-guidelines-page">
      <Header />
      <main>
        <div className="wrap" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
          <h1 style={{ marginBottom: '32px', fontSize: '2rem', fontWeight: '700' }}>
            Editorial Guidelines
          </h1>

          <div style={{ fontSize: '16px', lineHeight: '1.7', color: '#374151' }}>
            <div style={{
              background: '#e0f2fe',
              border: '1px solid #0284c7',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '32px'
            }}>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: '600', color: '#0c4a6e' }}>
                🎯 Our Editorial Mission
              </h2>
              <p style={{ margin: '0', color: '#0c4a6e' }}>
                To provide the most accurate, timely, and comprehensive football TV schedules in the UK
                while maintaining complete editorial independence from our commercial partnerships.
              </p>
            </div>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                Core Editorial Principles
              </h2>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎯 Accuracy First
                  </h3>
                  <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6' }}>
                    All broadcast information is verified through multiple sources before publication.
                    We prioritize accuracy over speed and correct errors immediately upon discovery.
                  </p>
                </div>

                <div style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔒 Editorial Independence
                  </h3>
                  <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6' }}>
                    Our TV schedules and fixture information are never influenced by affiliate partnerships
                    or commercial relationships. Editorial content is separate from business operations.
                  </p>
                </div>

                <div style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🌟 User-Centric Approach
                  </h3>
                  <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6' }}>
                    Every decision is made with our users' best interests in mind. We provide clear,
                    helpful information that serves football fans seeking TV coverage.
                  </p>
                </div>

                <div style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📢 Transparency
                  </h3>
                  <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6' }}>
                    We clearly disclose all commercial relationships and are transparent about
                    how we operate, make money, and maintain our service.
                  </p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                Content Standards
              </h2>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                  TV Schedule Information
                </h3>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>All broadcast times verified through official broadcaster sources</li>
                  <li>Multiple source verification for fixture scheduling</li>
                  <li>Real-time updates during match days</li>
                  <li>Clear indication when information is preliminary or unconfirmed</li>
                  <li>Immediate correction of any errors discovered</li>
                </ul>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                  Affiliate Content
                </h3>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>All affiliate relationships clearly disclosed</li>
                  <li>Honest recommendations based on genuine user value</li>
                  <li>No false claims about services or pricing</li>
                  <li>Editorial content separate from promotional content</li>
                  <li>Regular review of affiliate partner quality</li>
                </ul>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                  User Experience
                </h3>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>Clean, accessible design prioritizing information clarity</li>
                  <li>Fast loading times and mobile optimization</li>
                  <li>Minimal advertising that doesn't interfere with content</li>
                  <li>Clear navigation and search functionality</li>
                  <li>Responsive customer support</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                Source Verification Process
              </h2>

              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>1️⃣</span>
                    <div>
                      <strong>Primary Sources:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                        Official broadcaster websites, press releases, and verified social media accounts
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>2️⃣</span>
                    <div>
                      <strong>Cross-Verification:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                        Information confirmed across multiple reliable sources before publication
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>3️⃣</span>
                    <div>
                      <strong>Real-Time Monitoring:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                        Continuous monitoring for schedule changes, especially during match days
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>4️⃣</span>
                    <div>
                      <strong>User Feedback Integration:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                        User reports of errors investigated and corrected within 4 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                Conflict of Interest Policy
              </h2>

              <div style={{
                background: '#fefce8',
                border: '1px solid #eab308',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#a16207', fontWeight: '600' }}>
                  ⚠️ Potential Conflicts
                </h3>
                <p style={{ margin: '0', color: '#a16207' }}>
                  We maintain awareness of situations that could compromise our editorial independence
                  and have policies to address them transparently.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Financial Relationships</h4>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>All affiliate partnerships disclosed prominently</li>
                  <li>Editorial content decisions made independently of revenue considerations</li>
                  <li>No payment accepted for preferential treatment in TV schedules</li>
                  <li>Regular review of partner relationships for continued alignment with user value</li>
                </ul>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Personal Interests</h4>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>Team allegiances do not influence coverage decisions</li>
                  <li>Equal treatment of all competitions and broadcasters</li>
                  <li>Objective presentation of broadcast availability</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                Error Correction Policy
              </h2>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{
                  padding: '16px',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px'
                }}>
                  <strong style={{ color: '#991b1b' }}>High Priority Errors (Fixed within 1 hour):</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#7f1d1d' }}>
                    Incorrect match times, wrong broadcast channels, missing live coverage
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '6px'
                }}>
                  <strong style={{ color: '#92400e' }}>Medium Priority Errors (Fixed within 4 hours):</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#78350f' }}>
                    Minor schedule details, venue information, team name spellings
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px'
                }}>
                  <strong style={{ color: '#166534' }}>Low Priority Errors (Fixed within 24 hours):</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#14532d' }}>
                    Historical data corrections, formatting issues, non-critical information
                  </p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                User Privacy & Data Protection
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Data Collection</h4>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>Minimal data collection focused on improving user experience</li>
                  <li>Clear explanation of what data is collected and why</li>
                  <li>No selling of user data to third parties</li>
                  <li>Secure handling of any personal information</li>
                </ul>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Analytics & Tracking</h4>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>Anonymous usage analytics to improve site performance</li>
                  <li>Affiliate link tracking for commission purposes only</li>
                  <li>Cookie usage clearly explained and controlled by users</li>
                  <li>Opt-out options available for all non-essential tracking</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                Community Standards
              </h2>

              <p style={{ marginBottom: '16px' }}>
                While our primary focus is providing TV schedules, we maintain high standards
                for any community interactions:
              </p>

              <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                <li>Respectful treatment of all users and feedback</li>
                <li>No tolerance for discrimination or harassment</li>
                <li>Professional responses to complaints and suggestions</li>
                <li>Regular engagement with user feedback to improve services</li>
                <li>Clear communication about service changes or issues</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                Continuous Improvement
              </h2>

              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <p style={{ margin: '0 0 12px 0', color: '#0c4a6e' }}>
                  These guidelines are regularly reviewed and updated based on:
                </p>
                <ul style={{ margin: '0', paddingLeft: '20px', color: '#0c4a6e', lineHeight: '1.8' }}>
                  <li>User feedback and suggestions</li>
                  <li>Industry best practices evolution</li>
                  <li>Regulatory changes and requirements</li>
                  <li>Technology improvements and capabilities</li>
                  <li>Lessons learned from operational experience</li>
                </ul>
              </div>
            </section>

            <div style={{
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: '600' }}>
                Questions About Our Editorial Standards?
              </h3>
              <p style={{ margin: '0 0 16px 0' }}>
                We're committed to transparency in all aspects of our editorial process.
                If you have questions or concerns about our guidelines, please get in touch.
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
                  href="/how-we-make-money"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  How We Make Money
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
            </div>

            <div style={{
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '32px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                These guidelines are reviewed quarterly and updated as needed to maintain the highest standards.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorialGuidelinesPage;