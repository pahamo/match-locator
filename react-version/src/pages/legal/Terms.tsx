import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const Terms: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms & Conditions | MatchLocator';
  }, []);

  const sections = [
    { id: 'acceptable-use', label: 'Acceptable use' },
    { id: 'accuracy', label: 'Accuracy disclaimer' },
    { id: 'affiliates', label: 'Affiliate links/disclaimer' },
    { id: 'ip', label: 'Intellectual property' },
    { id: 'liability', label: 'Liability cap' },
    { id: 'law', label: 'Governing law' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <LegalLayout title="Terms & Conditions" toc={sections} robotsNoIndex>
      <section id="acceptable-use">
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not misuse the site, attempt to breach security, or disrupt other users.</li>
          <li>Automated scraping must respect robots and rate limits; do not overload our services.</li>
        </ul>
      </section>

      <section id="accuracy">
        <h2>Accuracy disclaimer</h2>
        <p>We aim to keep listings accurate, but we cannot guarantee correctness. Always verify with official broadcasters before making plans.</p>
      </section>

      <section id="affiliates">
        <h2>Affiliate links/disclaimer</h2>
        <p>Some outbound links may be affiliate links. If you use them, we may earn a commission at no extra cost to you.</p>
      </section>

      <section id="ip">
        <h2>Intellectual property</h2>
        <p>All content, branding, and code are owned by Match Locator or its licensors and protected by applicable laws.</p>
      </section>

      <section id="liability">
        <h2>Liability cap</h2>
        <p>To the maximum extent permitted by law, we exclude all implied warranties and limit liability to the amount you paid us in the last 12 months (typically £0 for free use).</p>
      </section>

      <section id="law">
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of the Netherlands or the United Kingdom (final jurisdiction TBD). Disputes will be subject to the exclusive jurisdiction of the courts there.</p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>Questions about these terms? Email us at hello@matchlocator.com (placeholder).</p>
      </section>
    </LegalLayout>
  );
};

export default Terms;

