import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const CookiePolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Cookie Policy | MatchLocator';
  }, []);

  const sections = [
    { id: 'what-are-cookies', label: 'What cookies are' },
    { id: 'categories', label: 'Cookie categories' },
    { id: 'purpose-examples', label: 'Purpose, examples, duration' },
    { id: 'third-parties', label: 'Third-party access' },
    { id: 'change-choices', label: 'How to change choices' },
    { id: 'withdraw-consent', label: 'Withdraw consent' },
  ];

  return (
    <LegalLayout title="Cookie Policy" toc={sections} robotsNoIndex>
      <section id="what-are-cookies">
        <h2>What cookies are</h2>
        <p>Cookies are small text files placed on your device to help the site function and remember your preferences.</p>
      </section>

      <section id="categories">
        <h2>Cookie categories</h2>
        <ul>
          <li><strong>Necessary</strong> (always on): enable core functionality (routing, security, load balancing).</li>
          <li>
            <strong>Analytics</strong>: we use self‑hosted <em>Plausible</em>, which is cookie‑less and provides
            aggregate metrics. No personal data is stored, and consent is not required under current guidance.
          </li>
          <li>
            <strong>Marketing</strong>: not in use. If we add marketing/ads cookies in the future, we will request
            explicit opt‑in consent first.
          </li>
        </ul>
      </section>

      <section id="purpose-examples">
        <h2>Purpose, examples, duration</h2>
        <ul>
          <li>Session cookies (if used): expire when you close your browser; essential operation.</li>
          <li>Preference cookies (if used): remember choices (e.g., selected team).</li>
          <li>Plausible analytics: cookie‑less; only aggregate counters are retained. Retention: <strong>[TODO period]</strong>.</li>
        </ul>
      </section>

      <section id="third-parties">
        <h2>Third-party access</h2>
        <p>
          We do not use third‑party marketing pixels. Our analytics is self‑hosted Plausible. If we add third‑party
          tools in future, we will update this policy and, where required, request consent.
        </p>
      </section>

      <section id="change-choices">
        <h2>How to change your choices</h2>
        <p>Use the “Cookie settings” link in the site footer to review or change your preferences at any time.</p>
        <p>You can also control cookies in your browser settings (block, delete, or clear cookies and site data).</p>
      </section>

      <section id="withdraw-consent">
        <h2>Withdraw consent</h2>
        <p>
          You can withdraw any previously given consent via “Cookie settings”. You can also delete cookies in your
          browser. Any future marketing/advertising cookies will require your explicit opt‑in before they are set.
        </p>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicy;
