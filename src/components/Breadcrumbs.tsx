import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  style?: React.CSSProperties;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  style
}) => {
  const canonicalBase = process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com';

  // Generate schema markup for SEO
  const generateSchemaMarkup = () => {
    const schemaItems = items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && { "item": `${canonicalBase}${item.href}` })
    }));

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": schemaItems
    };
  };

  if (items.length <= 1) {
    return null; // Don't show breadcrumbs if only one item (Home)
  }

  return (
    <>
      {/* Schema markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSchemaMarkup())
        }}
      />

      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className={className}
        style={{
          padding: '12px 0',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '24px',
          ...style
        }}
      >
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            fontSize: '14px',
            flexWrap: 'wrap',
            gap: '4px'
          }}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;
            const isMiddle = !isFirst && !isLast;

            return (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                className={isMiddle ? 'breadcrumb-middle' : ''}
              >
                {index > 0 && (
                  <span
                    style={{
                      color: 'var(--color-text-secondary)',
                      userSelect: 'none',
                      padding: '0 8px'
                    }}
                    aria-hidden="true"
                  >
                    &gt;
                  </span>
                )}


                {isLast || !item.href ? (
                  <span
                    style={{
                      color: isLast ? 'var(--color-text)' : 'var(--color-text-secondary)',
                      fontWeight: isLast ? '500' : '400'
                    }}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    style={{
                      color: 'var(--color-primary, #3b82f6)',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      margin: '-4px -6px',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-light, rgba(59, 130, 246, 0.1))';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-light, rgba(59, 130, 246, 0.1))';
                      e.currentTarget.style.outline = '2px solid var(--color-primary, #3b82f6)';
                      e.currentTarget.style.outlineOffset = '2px';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        {/* CSS for responsive behavior */}
        <style>{`
          @media (max-width: 640px) {
            .breadcrumb-middle {
              display: none !important;
            }
          }
        `}</style>
      </nav>
    </>
  );
};

export default Breadcrumbs;