import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | MatchLocator';
  }, []);

  const sections = [
    { id: 'who-we-are', label: 'Who we are' },
    { id: 'data-we-collect', label: 'What data we collect' },
    { id: 'lawful-bases', label: 'Lawful bases' },
    { id: 'retention', label: 'How long we retain data' },
    { id: 'processors', label: 'Processors and recipients' },
    { id: 'intl-transfers', label: 'International transfers' },
    { id: 'user-rights', label: 'Your rights' },
    { id: 'withdrawing-consent', label: 'Withdrawing consent' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'children', label: 'Children' },
    { id: 'updates', label: 'Updates to this notice' },
  ];

  return (
    <LegalLayout title="Privacy Policy" toc={sections} robotsNoIndex>
      <section id="who-we-are">
        <h2>Who we are</h2>
        <p>
          Match Locator (the “Site”) helps fans find TV broadcast information for football fixtures in the UK.
          The data controller is <strong>[TODO legal name]</strong>, based in <strong>[TODO city, country]</strong>.
        </p>
        <p>
          Privacy contact: <a href="mailto:privacy@matchlocator.com">privacy@matchlocator.com</a>. You can also use
          our request form at <a href="/privacy/request">/privacy/request</a>.
        </p>
      </section>

      <section id="data-we-collect">
        <h2>What data we collect</h2>
        <ul>
          <li>
            <strong>Server logs</strong>: IP address, user-agent, referrer, the URL requested and timestamp. These are
            used for security and troubleshooting.
          </li>
          <li>
            <strong>Analytics</strong>: privacy-friendly, self-hosted <em>Plausible</em> analytics. It is cookie-less and
            records aggregate page views and events without storing personal data.
          </li>
          <li>
            <strong>Forms and email</strong>: if you contact us, we will process the information you provide
            (e.g. your email address and message).
          </li>
          <li>
            <strong>Cookies</strong>: see our <a href="/legal/cookie-policy">Cookie Policy</a>.
          </li>
        </ul>
      </section>

      <section id="lawful-bases">
        <h2>Lawful bases</h2>
        <ul>
          <li>
            <strong>Legitimate interests</strong>: operating the Site, keeping it secure, detecting abuse, and
            understanding aggregate usage (basic server logs; cookie-less analytics).
          </li>
          <li>
            <strong>Consent</strong>: for any future marketing/advertising cookies or similar technologies (not used at
            present). You can withdraw consent at any time via “Cookie settings”.
          </li>
          <li>
            <strong>Contract / pre‑contract</strong>: if we introduce user accounts or paid features later, some
            processing will be necessary to provide those services. <em>[TODO confirm if accounts launch]</em>
          </li>
        </ul>
      </section>

      <section id="retention">
        <h2>How long we retain data</h2>
        <ul>
          <li>Server logs: <strong>[TODO retention period]</strong>.</li>
          <li>Analytics aggregates (Plausible): <strong>[TODO retention period]</strong>.</li>
          <li>Contact/support emails: <strong>[TODO retention period]</strong> or until the request is resolved.</li>
        </ul>
      </section>

      <section id="processors">
        <h2>Processors and recipients</h2>
        <ul>
          <li><strong>Netlify</strong> (hosting/CDN) – serves the Site globally via edge locations.</li>
          <li><strong>Supabase</strong> (database and backend) – stores fixtures and related content.</li>
          <li><strong>Plausible (self‑hosted)</strong> – privacy-friendly analytics without cookies.</li>
        </ul>
        <p>We do not sell personal data.</p>
      </section>

      <section id="intl-transfers">
        <h2>International transfers</h2>
        <p>
          Because CDNs and cloud services operate globally, your data may be processed outside the UK/EU. Where
          applicable, we rely on appropriate safeguards such as Standard Contractual Clauses or equivalent mechanisms
          offered by our providers.
        </p>
      </section>

      <section id="user-rights">
        <h2>Your rights</h2>
        <ul>
          <li>Access, rectification, erasure, restriction, portability, and objection (where applicable).</li>
          <li>
            To exercise your rights, email <a href="mailto:privacy@matchlocator.com">privacy@matchlocator.com</a> or
            use <a href="/privacy/request">/privacy/request</a>. We may need to verify your identity.
          </li>
        </ul>
      </section>

      <section id="withdrawing-consent">
        <h2>Withdrawing consent</h2>
        <p>You can withdraw analytics/marketing consent at any time via the “Cookie settings” link in the footer.</p>
      </section>

      <section id="complaints">
        <h2>Complaints</h2>
        <p>
          If you believe your rights have been infringed, you can complain to your local data protection authority. In
          the UK, this is the <a href="https://ico.org.uk/" target="_blank" rel="noreferrer">Information
          Commissioner’s Office (ICO)</a>. In the EU, you can contact your national authority via the
          <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noreferrer">EDPB members list</a>.
        </p>
      </section>

      <section id="children">
        <h2>Children</h2>
        <p>
          The Site is not directed at children under 16. If we learn that we have collected personal data from a child
          under 16, we will take steps to delete it. <em>[TODO remove or adapt if the service targets children]</em>
        </p>
      </section>

      <section id="updates">
        <h2>Updates to this notice</h2>
        <p>
          We may update this policy from time to time. We’ll post any changes on this page and update the “Last
          updated” date. Version: <strong>v1.0</strong>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
