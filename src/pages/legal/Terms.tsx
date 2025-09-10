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
          <li>Do not use the Site for unlawful purposes or to infringe others’ rights.</li>
          <li>Do not attempt to breach security, reverse engineer, or disrupt our services.</li>
          <li>Automated access must respect robots.txt and reasonable rate limits; do not overload our servers.</li>
        </ul>
      </section>

      <section id="accuracy">
        <h2>Accuracy disclaimer</h2>
        <p>
          We aim to keep listings accurate and timely, but schedules can change at short notice. Always verify with the
          official broadcaster before making plans (“check provider listings”).
        </p>
      </section>

      <section id="affiliates">
        <h2>Affiliate links/disclaimer</h2>
        <p>
          Some outbound links may be affiliate links. If you use them, we may earn a commission at no extra cost to you.
          We label affiliate actions and include clear disclosures near relevant links.
        </p>
      </section>

      <section id="ip">
        <h2>Intellectual property</h2>
        <p>
          All content, branding, and code are owned by Match Locator or its licensors and are protected by applicable
          laws. You are granted a limited, revocable, non‑exclusive licence to access and use the Site for personal,
          non‑commercial purposes.
        </p>
      </section>

      <section id="liability">
        <h2>Liability cap</h2>
        <p>
          To the maximum extent permitted by law, the Site is provided “as is” and we exclude all implied warranties.
          Our aggregate liability arising out of or relating to the Site shall not exceed the greater of £0 or the
          amount you paid us in the last 12 months (typically £0 for free use).
        </p>
      </section>

      <section id="law">
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of <strong>[TODO United Kingdom or Netherlands]</strong>. Disputes will be
          subject to the exclusive jurisdiction of the courts of <strong>[TODO venue]</strong>.
        </p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          Questions about these terms? Email <a href="mailto:hello@matchlocator.com">hello@matchlocator.com</a>.
          Effective date: <strong>[TODO YYYY‑MM‑DD]</strong>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Terms;
