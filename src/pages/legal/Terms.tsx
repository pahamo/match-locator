import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const Terms: React.FC = () => {
  useEffect(() => { document.title = 'Terms & Conditions | fixtures.app'; }, []);

  const toc = [
    { id: 'acceptable-use', label: 'Acceptable use' },
    { id: 'accuracy', label: 'Accuracy disclaimer' },
    { id: 'affiliates', label: 'Affiliate disclosure' },
    { id: 'ip', label: 'Intellectual property' },
    { id: 'liability', label: 'Liability cap' },
    { id: 'law', label: 'Governing law' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <LegalLayout title="Terms & Conditions" toc={toc} robotsNoIndex>
      <section id="acceptable-use">
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not use the Site for unlawful purposes or to infringe others’ rights.</li>
          <li>Do not attempt to breach security or disrupt services; automated access must respect robots.txt and rate limits.</li>
        </ul>
      </section>
      <section id="accuracy">
        <h2>Accuracy disclaimer</h2>
        <p>Listings can change at short notice. Always verify with the official broadcaster.</p>
      </section>
      <section id="affiliates">
        <h2>Affiliate disclosure</h2>
        <p>Some outbound links may be affiliate links. We may earn a commission at no extra cost to you. We label these clearly.</p>
      </section>
      <section id="ip">
        <h2>Intellectual property</h2>
        <p>All content, branding, and code are owned by fixtures.app or its licensors. You are granted a limited, revocable, non‑exclusive licence for personal use.</p>
      </section>
      <section id="liability">
        <h2>Liability cap</h2>
        <p>To the maximum extent permitted by law, the Site is provided “as is”. Aggregate liability shall not exceed £0 or the amount paid in the last 12 months.</p>
      </section>
      <section id="law">
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of <strong>[TODO UK or Netherlands]</strong>. Venue: <strong>[TODO]</strong>.</p>
      </section>
      <section id="contact">
        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:hello@matchlocator.com">hello@matchlocator.com</a>. Effective date: <strong>[TODO]</strong>.</p>
      </section>
    </LegalLayout>
  );
};

export default Terms;

