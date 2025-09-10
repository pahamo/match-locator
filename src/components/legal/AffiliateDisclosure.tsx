import React from 'react';

type Position = 'inline' | 'footer';

interface AffiliateDisclosureProps {
  providerName?: string;
  position?: Position;
}

const styles: Record<Position, React.CSSProperties> = {
  inline: {
    background: '#fffbeb',
    border: '1px solid #f59e0b',
    color: '#92400e',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: '0.85rem',
    margin: '8px 0',
  },
  footer: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#374151',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: '0.85rem',
    margin: '16px 0 0',
  }
};

const AffiliateDisclosure: React.FC<AffiliateDisclosureProps> = ({ providerName, position = 'inline' }) => {
  const text = providerName
    ? `We may earn a commission from qualifying purchases with ${providerName}.`
    : 'We may earn a commission from qualifying purchases with our affiliate partners.';

  return (
    <p role="note" aria-live="polite" style={styles[position]}>
      {text}
    </p>
  );
};

export function withAffiliateAriaLabel(name?: string): Record<string, string> {
  return {
    'aria-label': name ? `Affiliate link to ${name}` : 'Affiliate link',
    rel: 'noopener noreferrer sponsored'
  };
}

export default AffiliateDisclosure;

