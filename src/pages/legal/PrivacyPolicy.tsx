import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => { document.title = 'Privacy Policy | MatchLocator'; }, []);

  const toc = [
    { id: 'who-we-are', label: 'Who we are' },
    { id: 'data-we-collect', label: 'What data we collect' },
    { id: 'why-we-collect', label: 'Why we collect it' },
    { id: 'who-we-share-with', label: 'Who we share with' },
    { id: 'your-rights', label: 'Your rights' },
    { id: 'data-retention', label: 'Data retention' },
    { id: 'intl-transfers', label: 'International transfers' },
    { id: 'updates', label: 'Updates' },
    { id: 'complaints', label: 'Complaints' },
  ];

  return (
    <LegalLayout title="Privacy Policy" toc={toc} robotsNoIndex lastUpdated="2025-01-01">
      <section id="who-we-are">
        <h2>Who we are</h2>
        <p>MatchLocator (the "Site") is accessible at matchlocator.com.</p>
        <p>Data controller: Patrick Hallett-Morley, Amsterdam, Netherlands.</p>
        <p>Contact: <a href="mailto:privacy@matchlocator.com">privacy@matchlocator.com</a></p>
      </section>

      <section id="data-we-collect">
        <h2>What data we collect</h2>
        <ul>
          <li><strong>Analytics</strong>: We use Plausible Analytics (privacy-friendly, no cookies, no personal data)</li>
          <li><strong>Server logs</strong>: Basic access logs (IP address, pages visited, timestamp) kept by our hosting provider for security</li>
        </ul>
      </section>

      <section id="why-we-collect">
        <h2>Why we collect it</h2>
        <ul>
          <li><strong>Legitimate interests</strong>: To understand site usage and ensure security/performance</li>
        </ul>
      </section>

      <section id="who-we-share-with">
        <h2>Who we share with</h2>
        <ul>
          <li>Netlify (hosting)</li>
          <li>Supabase (database)</li>
          <li>Plausible (analytics - self-hosted, privacy-first)</li>
        </ul>
        <p>We do not sell or share personal data.</p>
      </section>

      <section id="your-rights">
        <h2>Your rights</h2>
        <p>Under GDPR, you have rights to access, correct, delete, restrict, and port your data. Contact <a href="mailto:privacy@matchlocator.com">privacy@matchlocator.com</a> to exercise these rights.</p>
      </section>

      <section id="data-retention">
        <h2>Data retention</h2>
        <ul>
          <li>Server logs: 30 days</li>
          <li>Analytics: Aggregated data only (no personal data stored)</li>
        </ul>
      </section>

      <section id="intl-transfers">
        <h2>International transfers</h2>
        <p>Our providers may process data outside the EEA with appropriate safeguards (Standard Contractual Clauses).</p>
      </section>

      <section id="updates">
        <h2>Updates</h2>
        <p>We may update this policy. Check the "Last updated" date above.</p>
      </section>

      <section id="complaints">
        <h2>Complaints</h2>
        <p>Netherlands: Autoriteit Persoonsgegevens (Dutch DPA)</p>
        <p>EU residents: Your national data protection authority</p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;

