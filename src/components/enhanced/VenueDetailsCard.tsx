/**
 * Venue Details Card
 *
 * Enhanced venue information from SoccersAPI including:
 * - Stadium details and capacity
 * - Weather conditions
 * - Location and travel info
 */

import React from 'react';
import { SmartFeatureFlag } from '../../config/featureFlags';

interface VenueInfo {
  name: string;
  city: string;
  capacity?: number;
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface WeatherInfo {
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  icon?: string;
}

interface VenueDetailsCardProps {
  venue?: VenueInfo;
  weather?: WeatherInfo;
  className?: string;
}

const VenueDetailsCard: React.FC<VenueDetailsCardProps> = ({
  venue,
  weather,
  className = ''
}) => {
  if (!venue) {
    return null;
  }

  return (
    <SmartFeatureFlag feature="soccersAPIFeatures.showVenueDetails">
      <div className={`venue-details-card ${className}`} style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden'
      }}>
        {/* Venue Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>🏟️</span>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: 0,
              color: 'var(--color-text)'
            }}>
              {venue.name}
            </h3>
          </div>

          <div style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span>📍 {venue.city}</span>
            {venue.capacity && (
              <span>👥 {venue.capacity.toLocaleString()} capacity</span>
            )}
          </div>
        </div>

        {/* Stadium Image */}
        {venue.image && (
          <div style={{
            height: '120px',
            backgroundImage: `url(${venue.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '12px'
            }}>
              {venue.name}
            </div>
          </div>
        )}

        {/* Weather Information */}
        {weather && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-background)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--color-text)'
              }}>
                Match Day Weather
              </span>
              {weather.icon && (
                <img
                  src={weather.icon}
                  alt={weather.condition}
                  style={{ width: '24px', height: '24px' }}
                />
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: '12px',
              fontSize: '12px'
            }}>
              {weather.temperature && (
                <div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Temperature</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                    {weather.temperature}°C
                  </div>
                </div>
              )}

              {weather.condition && (
                <div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Conditions</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                    {weather.condition}
                  </div>
                </div>
              )}

              {weather.humidity && (
                <div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Humidity</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                    {weather.humidity}%
                  </div>
                </div>
              )}

              {weather.windSpeed && (
                <div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Wind</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                    {weather.windSpeed} mph
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Travel Info */}
        {venue.coordinates && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-background)'
          }}>
            <button
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={() => {
                const mapsUrl = `https://maps.google.com/?q=${venue.coordinates!.lat},${venue.coordinates!.lng}`;
                window.open(mapsUrl, '_blank');
              }}
            >
              🗺️ Get Directions
            </button>
          </div>
        )}
      </div>
    </SmartFeatureFlag>
  );
};

export default VenueDetailsCard;