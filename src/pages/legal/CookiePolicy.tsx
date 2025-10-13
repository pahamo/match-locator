import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const CookiePolicy: React.FC = () => {
  useEffect(() => { document.title = 'Cookie Policy | fixtures.app'; }, []);

  const toc = [
    { id: 'what-are-cookies', label: 'What cookies are' },
    { id: 'categories', label: 'Cookie categories' },
    { id: 'purpose', label: 'Purpose, examples, duration' },
    { id: 'choices', label: 'How to change choices' },
    { id: 'withdraw', label: 'Withdraw consent' },
  ];

  return (
    <LegalLayout title="Cookie Policy" toc={toc} robotsNoIndex>
      <section id="what-are-cookies">
        <h2>What cookies are</h2>
        <p>Cookies are small text files placed on your device to help the site function and remember preferences.</p>
      </section>
      <section id="categories">
        <h2>Cookie categories</h2>
        <ul>
          <li><strong>Necessary</strong> (always on): core functionality (routing, security, load balancing).</li>
          <li><strong>Analytics</strong>: self‑hosted Plausible is cookie‑less and records aggregate metrics.</li>
          <li><strong>Marketing</strong>: not in use. Any future cookies will require opt‑in consent.</li>
        </ul>
      </section>
      <section id="purpose">
        <h2>Purpose, examples, duration</h2>
        <ul>
          <li>Session cookies (if used): expire when you close the browser; essential operation.</li>
          <li>Preference cookies (if used): remember choices (e.g., selected team).</li>
          <li>Plausible analytics: cookie‑less; only aggregate counters are retained. Retention: <strong>365 days</strong>.</li>
        </ul>
      </section>
      <section id="choices">
        <h2>How to change your choices</h2>
        <p>Use the “Cookie settings” link in the footer to review or change your preferences. You can also control cookies in your browser.</p>
      </section>
      <section id="withdraw">
        <h2>Withdraw consent</h2>
        <p>You can withdraw consent via “Cookie settings”. Future marketing cookies will require explicit opt‑in.</p>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicy;

