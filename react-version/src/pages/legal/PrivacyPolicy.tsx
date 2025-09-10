import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | MatchLocator';
  }, []);

  const sections = [
    { id: 'who-we-are', label: 'Who we are' },
    { id: 'data-we-collect', label: 'What data we collect' },
    { id: 'why-legal-basis', label: 'Why / legal basis' },
    { id: 'retention', label: 'How long we retain data' },
    { id: 'sharing', label: 'Who we share with' },
    { id: 'intl-transfers', label: 'International transfers' },
    { id: 'user-rights', label: 'Your rights' },
    { id: 'withdrawing-consent', label: 'Withdrawing consent' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'updates', label: 'Updates to this notice' },
  ];

  return (
    <LegalLayout title="Privacy Policy" toc={sections} robotsNoIndex>
      <section id="who-we-are">
        <h2>Who we are</h2>
        <p>Match Locator is an independent website helping users find TV broadcast information for football matches in the UK.</p>
        <p>Contact: hello@matchlocator.com (placeholder).</p>
      </section>

      <section id="data-we-collect">
        <h2>What data we collect</h2>
        <ul>
          <li>Usage data (pages visited, links clicked, basic device info).</li>
          <li>Cookies (see Cookie Policy).</li>
          <li>Optional contact messages (if you email us).</li>
        </ul>
      </section>

      <section id="why-legal-basis">
        <h2>Why / legal basis</h2>
        <ul>
          <li>Legitimate interests: run and improve the site, prevent abuse.</li>
          <li>Consent: analytics/marketing cookies where applicable.</li>
          <li>Contract/Pre-contract: respond to support or contact requests.</li>
        </ul>
      </section>

      <section id="retention">
        <h2>How long we retain data</h2>
        <ul>
          <li>Analytics data: typical retention 14–26 months (provider dependent).</li>
          <li>Server logs: short-term for security and debugging.</li>
          <li>Emails/support: as long as necessary to address the request.</li>
        </ul>
      </section>

      <section id="sharing">
        <h2>Who we share with</h2>
        <ul>
          <li>Hosting and analytics providers.</li>
          <li>Only where necessary to operate the service.</li>
          <li>No sale of personal data.</li>
        </ul>
      </section>

      <section id="intl-transfers">
        <h2>International transfers</h2>
        <p>Data may be processed outside your country. We rely on appropriate safeguards (e.g., SCCs or provider-specific mechanisms).</p>
      </section>

      <section id="user-rights">
        <h2>Your rights</h2>
        <ul>
          <li>Access, rectification, erasure, restriction, portability, and objection (where applicable).</li>
          <li>To exercise rights, contact us at the email above.</li>
        </ul>
      </section>

      <section id="withdrawing-consent">
        <h2>Withdrawing consent</h2>
        <p>You can withdraw analytics/marketing consent at any time via “Cookie settings”.</p>
      </section>

      <section id="complaints">
        <h2>Complaints</h2>
        <p>If you’re not satisfied, you can complain to your local data protection authority. In the UK, see the <a href="https://ico.org.uk/" target="_blank" rel="noreferrer">ICO</a>.</p>
      </section>

      <section id="updates">
        <h2>Updates to this notice</h2>
        <p>We may update this policy from time to time. We’ll post any changes on this page with an updated “Last updated” date.</p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;

