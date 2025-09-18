import React from 'react';
import { withAffiliateAriaLabel } from './legal/AffiliateDisclosure';
import type { Fixture } from '../types';

interface BroadcastCardProps {
  fixture: Fixture;
}

const BroadcastCard: React.FC<BroadcastCardProps> = ({ fixture }) => {
  const getBroadcasterLink = (providerName: string, href?: string) => {
    if (href) return href;

    // Enhanced fallback URLs with affiliate potential
    switch (providerName) {
      case 'Sky Sports':
        return 'https://www.skysports.com/football/fixtures-results';
      case 'TNT Sports':
        return 'https://tntsports.co.uk/football';
      case 'BBC iPlayer':
        return 'https://www.bbc.co.uk/iplayer/live/bbcone';
      case 'ITV':
        return 'https://www.itv.com/watch/itv';
      default:
        return undefined;
    }
  };

  const getProviderDetails = (providerName: string) => {
    switch (providerName) {
      case 'Sky Sports':
        return {
          quality: 'HD & 4K available',
          commentary: 'Expert commentary',
          extras: 'Pre & post-match analysis',
          description: 'Watch with Sky Sports comprehensive coverage'
        };
      case 'TNT Sports':
        return {
          quality: 'HD available',
          commentary: 'Live commentary',
          extras: 'Match highlights',
          description: 'Stream live on TNT Sports'
        };
      case 'BBC iPlayer':
        return {
          quality: 'HD available',
          commentary: 'BBC commentary',
          extras: 'Match highlights',
          description: 'Watch free on BBC'
        };
      case 'ITV':
        return {
          quality: 'HD available',
          commentary: 'ITV commentary',
          extras: 'Post-match highlights',
          description: 'Watch free on ITV'
        };
      default:
        return {
          quality: 'HD available',
          commentary: 'Live commentary',
          extras: 'Match coverage',
          description: `Watch on ${providerName}`
        };
    }
  };

  // Handle blackout scenario
  if (fixture.blackout?.is_blackout) {
    return (
      <div className="broadcast-card blackout" style={{
        background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
        border: '2px solid #fca5a5',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            fontSize: '24px',
            background: '#dc2626',
            color: 'white',
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            🚫
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
              Match Not Available
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '14px' }}>
              This match is subject to broadcast restrictions
            </p>
          </div>
        </div>
        {fixture.blackout.reason && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#7f1d1d'
          }}>
            {fixture.blackout.reason}
          </div>
        )}
      </div>
    );
  }

  // Handle TBD scenario
  if (!fixture.providers_uk || fixture.providers_uk.length === 0) {
    return (
      <div className="broadcast-card tbd" style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fefce8 100%)',
        border: '2px solid #fbbf24',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            fontSize: '24px',
            background: '#d97706',
            color: 'white',
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            📺
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#d97706' }}>
              Broadcaster To Be Confirmed
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#92400e', fontSize: '14px' }}>
              TV details will be announced closer to the match
            </p>
          </div>
        </div>
        <div style={{
          background: 'rgba(217, 119, 6, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#92400e'
        }}>
          Check back later for broadcast information, or visit the team pages for updates.
        </div>
      </div>
    );
  }

  // Main broadcast card for available providers
  const primaryProvider = fixture.providers_uk[0];
  const details = getProviderDetails(primaryProvider.name);
  const link = getBroadcasterLink(primaryProvider.name, primaryProvider.href);

  return (
    <div className="broadcast-card available" style={{
      background: 'linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%)',
      border: '2px solid #3b82f6',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          fontSize: '24px',
          background: '#3b82f6',
          color: 'white',
          borderRadius: '12px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          📺
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e40af' }}>
            How to Watch
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#1e3a8a', fontSize: '14px' }}>
            {details.description}
          </p>
        </div>
      </div>

      {/* Provider details */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>Quality</div>
            <div style={{ color: '#1e3a8a' }}>{details.quality}</div>
          </div>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>Commentary</div>
            <div style={{ color: '#1e3a8a' }}>{details.commentary}</div>
          </div>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>Extras</div>
            <div style={{ color: '#1e3a8a' }}>{details.extras}</div>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      {link && (
        <div style={{ marginBottom: '16px' }}>
          <a
            href={link}
            target="_blank"
            rel="noreferrer noopener"
            {...withAffiliateAriaLabel(primaryProvider.name)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease-in-out',
              width: '100%',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span style={{ fontSize: '18px' }}>🚀</span>
            Watch on {primaryProvider.name}
            <span style={{ fontSize: '14px', opacity: 0.9 }}>→</span>
          </a>
        </div>
      )}

      {/* Additional providers */}
      {fixture.providers_uk.length > 1 && (
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '8px'
          }}>
            Also available on:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {fixture.providers_uk.slice(1).map((provider) => {
              const altLink = getBroadcasterLink(provider.name, provider.href);
              return altLink ? (
                <a
                  key={provider.id}
                  href={altLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  {...withAffiliateAriaLabel(provider.name)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#1e40af',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  {provider.name}
                </a>
              ) : (
                <span
                  key={provider.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    color: '#6b7280',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  {provider.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastCard;