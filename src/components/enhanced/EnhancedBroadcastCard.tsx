/**
 * Enhanced Broadcast Card
 *
 * Displays rich broadcast information from SoccersAPI including:
 * - Multiple broadcasters per match
 * - Streaming vs TV distinction
 * - International broadcasts
 * - Channel logos
 */

import React from 'react';
import { SmartFeatureFlag } from '../../config/featureFlags';
import type { Fixture } from '../../types';

interface BroadcastProvider {
  id: number;
  name: string;
  logo?: string;
  type: 'tv' | 'streaming' | 'radio';
  country: string;
  isUK: boolean;
}

interface EnhancedBroadcastCardProps {
  fixture: Fixture;
  providers?: BroadcastProvider[];
  className?: string;
}

const EnhancedBroadcastCard: React.FC<EnhancedBroadcastCardProps> = ({
  fixture,
  providers = [],
  className = ''
}) => {
  const ukProviders = providers.filter(p => p.isUK);
  const internationalProviders = providers.filter(p => !p.isUK);
  const streamingProviders = ukProviders.filter(p => p.type === 'streaming');
  const tvProviders = ukProviders.filter(p => p.type === 'tv');

  const BroadcasterBadge: React.FC<{ provider: BroadcastProvider }> = ({ provider }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      backgroundColor: provider.type === 'streaming' ? 'var(--color-info-light)' : 'var(--color-primary-light)',
      border: `1px solid ${provider.type === 'streaming' ? 'var(--color-info)' : 'var(--color-primary)'}`,
      borderRadius: 'var(--border-radius-sm)',
      fontSize: '12px',
      fontWeight: '500'
    }}>
      <SmartFeatureFlag feature="soccersAPIFeatures.showBroadcastLogos">
        {provider.logo && (
          <img
            src={provider.logo}
            alt={provider.name}
            style={{ width: '16px', height: '16px', borderRadius: '2px' }}
          />
        )}
      </SmartFeatureFlag>
      <span>{provider.name}</span>
      {provider.type === 'streaming' && (
        <span style={{ fontSize: '10px', opacity: 0.8 }}>📱</span>
      )}
    </div>
  );

  // Fallback to basic broadcaster info if no enhanced data
  if (providers.length === 0) {
    return (
      <div className={`enhanced-broadcast-card basic ${className}`} style={{
        padding: '12px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-md)'
      }}>
        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          TV Coverage
        </div>
        <div style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
          {fixture.providers_uk?.[0]?.name || 'TBD'}
        </div>
      </div>
    );
  }

  return (
    <div className={`enhanced-broadcast-card ${className}`} style={{
      padding: '16px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--border-radius-lg)'
    }}>
      {/* TV Broadcasts */}
      {tvProviders.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--color-text)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            📺 TV Broadcast
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tvProviders.map(provider => (
              <BroadcasterBadge key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      )}

      {/* Streaming Options */}
      <SmartFeatureFlag feature="soccersAPIFeatures.showStreamingOptions">
        {streamingProviders.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--color-text)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📱 Streaming
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {streamingProviders.map(provider => (
                <BroadcasterBadge key={provider.id} provider={provider} />
              ))}
            </div>
          </div>
        )}
      </SmartFeatureFlag>

      {/* International Broadcasts */}
      <SmartFeatureFlag feature="soccersAPIFeatures.showInternationalBroadcasts">
        {internationalProviders.length > 0 && (
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🌍 International
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {internationalProviders.slice(0, 3).map(provider => (
                <div key={provider.id} style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {provider.name} ({provider.country})
                </div>
              ))}
              {internationalProviders.length > 3 && (
                <div style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  color: 'var(--color-text-secondary)'
                }}>
                  +{internationalProviders.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </SmartFeatureFlag>

      {/* No broadcasts available */}
      {ukProviders.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          backgroundColor: 'var(--color-warning-light)',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '14px',
          color: 'var(--color-warning-dark)'
        }}>
          🚫 No UK broadcast confirmed
        </div>
      )}
    </div>
  );
};

export default EnhancedBroadcastCard;