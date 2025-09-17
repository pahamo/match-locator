import React, { useEffect } from 'react';
import LegalLayout from './LegalLayout';
import { generatePageMeta, updateDocumentMeta } from '../../utils/seo';

const AffiliateDisclosure: React.FC = () => {
  useEffect(() => {
    const meta = generatePageMeta({
      title: 'Affiliate Disclosure | Football TV Schedule',
      description: 'Our affiliate disclosure explains how we earn commission from partner links while maintaining editorial independence.',
      path: '/affiliate-disclosure'
    });
    updateDocumentMeta(meta);
  }, []);

  return (
    <LegalLayout
      title="Affiliate Disclosure"
      lastUpdated="2025-09-17"
      robotsNoIndex={false}
    >
      <blockquote>
        <strong>🚨 Important Disclosure:</strong> Football TV Schedule participates in affiliate marketing programs. We may earn commission from purchases made through links on our website.
      </blockquote>

      <section>
        <h2>What Are Affiliate Links?</h2>
              <p>
                Affiliate links are special tracking links that allow us to earn a commission when you make a purchase
                through our recommendations. When you click on an affiliate link and make a purchase, the company pays
                us a small percentage of your purchase price at no extra cost to you.
              </p>
            </section>

      <section>
        <h2>Our Affiliate Partners</h2>
              <p>
                We partner with streaming services, sports broadcasters, and TV providers to help you find the best
                ways to watch football matches. Our current and potential affiliate partners include:
              </p>
              <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
                <li>Sky Sports and Sky TV packages</li>
                <li>TNT Sports subscriptions</li>
                <li>Amazon Prime Video</li>
                <li>Discovery+ and Eurosport</li>
                <li>Streaming device manufacturers</li>
                <li>VPN services for international viewing</li>
                <li>Sports betting platforms (where legally permitted)</li>
              </ul>
            </section>

      <section>
        <h2>How We Identify Affiliate Links</h2>
              <p>
                We clearly mark affiliate content in the following ways:
              </p>
              <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
                <li>Links marked with "affiliate link" or "sponsored link" labels</li>
                <li>Disclosure statements near affiliate content</li>
                <li>Clear identification of promotional content</li>
                <li>This dedicated affiliate disclosure page</li>
              </ul>
            </section>

      <section>
        <h2>Our Editorial Independence</h2>
              <p>
                <strong>Your trust is our priority.</strong> We maintain strict editorial independence and only
                recommend services we genuinely believe will benefit our users. Here's our commitment:
              </p>
              <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
                <li>We only promote services we've researched and believe in</li>
                <li>Affiliate partnerships do not influence our TV schedule information</li>
                <li>We provide honest reviews and comparisons</li>
                <li>We disclose all material connections with partners</li>
                <li>Our primary focus is accurate, helpful football TV listings</li>
              </ul>
            </section>

      <section>
        <h2>How Affiliate Revenue Supports Our Service</h2>
              <p>
                Revenue from affiliate partnerships helps us:
              </p>
              <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
                <li>Keep our football TV schedules free for all users</li>
                <li>Maintain and improve our website infrastructure</li>
                <li>Research and verify broadcast information</li>
                <li>Add new features and competitions</li>
                <li>Provide customer support</li>
              </ul>
            </section>

      <section>
        <h2>FTC Compliance</h2>
              <p>
                This disclosure complies with the Federal Trade Commission's (FTC) guidelines for affiliate marketing
                and endorsements. We follow international best practices for transparency in digital marketing.
              </p>
            </section>

      <section>
        <h2>Your Choices</h2>
              <p>
                You are never obligated to purchase anything through our affiliate links. You can:
              </p>
              <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
                <li>Visit partner websites directly</li>
                <li>Use our site purely for TV schedule information</li>
                <li>Compare prices across different providers</li>
                <li>Choose any provider that works best for you</li>
              </ul>
            </section>

      <section>
        <h2>Questions About Our Affiliate Program?</h2>
              <p>
                If you have questions about our affiliate partnerships or this disclosure, please contact us at{' '}
                <a href="/contact">our contact page</a>
                . We're committed to transparency and will gladly answer any questions.
              </p>
            </section>

      <hr />
      <p><em>We may update this disclosure from time to time. Check this page for the latest information.</em></p>
    </LegalLayout>
  );
};

export default AffiliateDisclosure;