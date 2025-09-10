import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => { document.title = 'Privacy Policy | fixtures.app'; }, []);

  const toc = [
    { id: 'who-we-are', label: 'Who we are' },
    { id: 'data-we-collect', label: 'What data we collect' },
    { id: 'lawful-bases', label: 'Lawful bases' },
    { id: 'retention', label: 'How long we retain data' },
    { id: 'processors', label: 'Processors and recipients' },
    { id: 'intl-transfers', label: 'International transfers' },
    { id: 'user-rights', label: 'Your rights' },
    { id: 'withdraw', label: 'Withdrawing consent' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'children', label: 'Children' },
    { id: 'updates', label: 'Updates' },
  ];

  return (
    <LegalLayout title="Privacy Policy" toc={toc} robotsNoIndex>
      <section id="who-we-are">
        <h2>Who we are</h2>
        <p>fixtures.app (the “Site”). Data controller: <strong>[TODO legal name]</strong>, <strong>[TODO city, country]</strong>.</p>
        <p>Privacy contact: <a href="mailto:privacy@matchlocator.com">privacy@matchlocator.com</a> or <a href="/privacy/request">/privacy/request</a>.</p>
      </section>

      <section id="data-we-collect">
        <h2>What data we collect</h2>
        <ul>
          <li><strong>Server logs</strong>: IP, user‑agent, referrer, requested URL, timestamp (security/troubleshooting).</li>
          <li><strong>Analytics</strong>: privacy‑friendly, self‑hosted Plausible (cookie‑less, aggregate page views/events).</li>
          <li><strong>Contact</strong>: email + message content when you contact us.</li>
          <li><strong>Cookies</strong>: see <a href="/legal/cookie-policy">Cookie Policy</a>.</li>
        </ul>
      </section>

      <section id="lawful-bases">
        <h2>Lawful bases</h2>
        <ul>
          <li><strong>Legitimate interests</strong>: operate and secure the Site; aggregate analytics.</li>
          <li><strong>Consent</strong>: any future marketing/ads cookies (not used today).</li>
          <li><strong>Contract/pre‑contract</strong>: if accounts or paid features are introduced later. [TODO]</li>
        </ul>
      </section>

      <section id="retention">
        <h2>How long we retain data</h2>
        <ul>
          <li>Server logs: <strong>[TODO period]</strong>.</li>
          <li>Analytics aggregates: <strong>[TODO period]</strong>.</li>
          <li>Support emails: <strong>[TODO period]</strong> or until resolved.</li>
        </ul>
      </section>

      <section id="processors">
        <h2>Processors and recipients</h2>
        <ul>
          <li>Netlify (hosting/CDN)</li>
          <li>Supabase (database/backend)</li>
          <li>Plausible (self‑hosted analytics)</li>
        </ul>
        <p>We do not sell personal data.</p>
      </section>

      <section id="intl-transfers">
        <h2>International transfers</h2>
        <p>Global CDNs/cloud may process data outside the UK/EU. We rely on safeguards (e.g., SCCs) where required.</p>
      </section>

      <section id="user-rights">
        <h2>Your rights</h2>
        <p>Access, rectification, erasure, restriction, portability, objection (where applicable).</p>
        <p>Exercise rights: <a href="mailto:privacy@matchlocator.com">privacy@matchlocator.com</a> or <a href="/privacy/request">/privacy/request</a>.</p>
      </section>

      <section id="withdraw">
        <h2>Withdrawing consent</h2>
        <p>Use the “Cookie settings” link in the footer to withdraw consent for non‑essential cookies.</p>
      </section>

      <section id="complaints">
        <h2>Complaints</h2>
        <p>UK: <a href="https://ico.org.uk/" target="_blank" rel="noreferrer">ICO</a>. EU DPAs: <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noreferrer">EDPB members</a>.</p>
      </section>

      <section id="children">
        <h2>Children</h2>
        <p>Not directed at children under 16. [TODO adapt if targeting children]</p>
      </section>

      <section id="updates">
        <h2>Updates</h2>
        <p>We may update this notice. Version v1.0. “Last updated” date is shown above.</p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;

