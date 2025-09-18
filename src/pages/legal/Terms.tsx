import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';

const Terms: React.FC = () => {
  useEffect(() => { document.title = 'Terms & Conditions | MatchLocator'; }, []);

  const toc = [
    { id: 'acceptable-use', label: 'Acceptable use' },
    { id: 'accuracy', label: 'Accuracy disclaimer' },
    { id: 'affiliates', label: 'Affiliate disclosure' },
    { id: 'ip', label: 'Intellectual property' },
    { id: 'liability', label: 'Liability limitation' },
    { id: 'law', label: 'Governing law' },
    { id: 'changes', label: 'Changes to terms' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <LegalLayout title="Terms & Conditions" toc={toc} robotsNoIndex lastUpdated="2025-09-17">
      <section id="acceptable-use">
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not use the Site for unlawful purposes or to infringe others' rights</li>
          <li>Do not attempt to breach security or disrupt services</li>
          <li>Automated access must respect robots.txt and rate limits</li>
        </ul>
      </section>

      <section id="accuracy">
        <h2>Accuracy disclaimer</h2>
        <p><strong>Fixture times and broadcasters can change at short notice.</strong> We update information as quickly as possible, but always verify with the official broadcaster before purchasing subscriptions or making plans.</p>
      </section>

      <section id="affiliates">
        <h2>Affiliate disclosure</h2>
        <p>We participate in affiliate programs with broadcasters and betting operators. Links to Sky Sports, TNT Sports, Amazon Prime, and others may earn us commission at no extra cost to you. This helps keep MatchLocator free to use.</p>
      </section>

      <section id="ip">
        <h2>Intellectual property</h2>
        <p>All content, branding, and code are owned by Patrick Hallett-Morley or licensors. Team names and broadcaster logos are property of their respective owners. You are granted a limited, revocable, non-exclusive licence for personal use.</p>
      </section>

      <section id="liability">
        <h2>Liability limitation</h2>
        <p>THE SITE IS PROVIDED "AS IS" WITHOUT WARRANTIES. We are not liable for:</p>
        <ul>
          <li>Incorrect fixture or broadcaster information</li>
          <li>Missed matches due to schedule changes</li>
          <li>Any losses from use of affiliate links</li>
          <li>Service interruptions</li>
        </ul>
        <p>Maximum liability: €50 or amount paid to us in the last 12 months (whichever is greater).</p>
      </section>

      <section id="law">
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of the Netherlands.</p>
        <p>Disputes shall be resolved in Amsterdam courts.</p>
      </section>

      <section id="changes">
        <h2>Changes to terms</h2>
        <p>We may update these terms. Continued use after changes constitutes acceptance.</p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:hello@matchlocator.com">hello@matchlocator.com</a></p>
        <p>Operated by: Patrick Hallett-Morley, Amsterdam, Netherlands</p>
      </section>
    </LegalLayout>
  );
};

export default Terms;

