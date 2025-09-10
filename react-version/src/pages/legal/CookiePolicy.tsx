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
          <li><strong>Necessary</strong>: enable core functionality (e.g., routing, security).</li>
          <li><strong>Analytics</strong>: help us understand usage and improve the site.</li>
          <li><strong>Marketing</strong>: personalize content and measure campaigns.</li>
        </ul>
      </section>

      <section id="purpose-examples">
        <h2>Purpose, examples, duration</h2>
        <ul>
          <li>Session cookies: expire when you close your browser; used for basic functionality.</li>
          <li>Preference cookies: remember choices (e.g., selected team); longer-lived.</li>
          <li>Analytics cookies: typically persist 14–26 months (provider dependent).</li>
        </ul>
      </section>

      <section id="third-parties">
        <h2>Third-party access</h2>
        <p>Some cookies may be set by third-party providers (e.g., analytics). Those providers can access the cookie values they set.</p>
      </section>

      <section id="change-choices">
        <h2>How to change your choices</h2>
        <p>Use the “Cookie settings” link in the site footer to review or change your preferences at any time.</p>
      </section>

      <section id="withdraw-consent">
        <h2>Withdraw consent</h2>
        <p>You can withdraw consent for analytics/marketing cookies via “Cookie settings”. You can also delete cookies in your browser settings.</p>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicy;

