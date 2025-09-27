/**
 * Test page to demonstrate SoccersAPI data for Danish fixtures
 * Shows what enhanced data is available vs Football-data.org
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { getCurrentAPISource, isTestMode } from '../config/featureFlags';

interface SoccersAPIFixture {
  id: string;
  date: string;
  time: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  league: {
    id: string;
    name: string;
    country: string;
  };
  venue?: {
    name: string;
    city: string;
    capacity?: number;
  };
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
  };
  broadcasts?: Array<{
    name: string;
    country: string;
    type: 'tv' | 'streaming' | 'radio';
    url?: string;
  }>;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
  status: string;
}

const TestSoccersAPIPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<SoccersAPIFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const apiSource = getCurrentAPISource();
  const testMode = isTestMode();

  // Test SoccersAPI directly
  const testSoccersAPI = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🧪 Testing SoccersAPI for Danish fixtures...');

      // Test the Danish Superliga (ID: 1609)
      const response = await fetch('/.netlify/functions/test-soccersapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_fixtures',
          league_id: '1609', // Danish Superliga
          date_from: '2025-09-01',
          date_to: '2025-12-31'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestResults(result);
        console.log('✅ SoccersAPI test successful:', result);
      } else {
        throw new Error(result.error || 'Test failed');
      }

    } catch (error) {
      console.error('❌ SoccersAPI test failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testSoccersAPI();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        paddingTop: '100px' // Account for fixed header
      }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0,
              marginRight: '16px'
            }}>
              🧪 SoccersAPI Test Page
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: apiSource === 'soccersapi' ? '#dcfdf4' : '#dbeafe',
              color: apiSource === 'soccersapi' ? '#059669' : '#2563eb'
            }}>
              {apiSource === 'soccersapi' ? '🆕 SoccersAPI' : '📊 Football-Data.org'}
              {testMode && <span style={{ color: '#d97706' }}>(Test Mode)</span>}
            </div>
          </div>

          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0,
            marginBottom: '8px'
          }}>
            Testing enhanced data from Danish Superliga fixtures
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '14px',
            color: '#374151'
          }}>
            <span>🇩🇰 League: Danish Superliga (ID: 1609)</span>
            <span>📅 Date Range: Sep-Dec 2025</span>
          </div>
        </div>

        {/* API Status */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            API Connection Status
          </h2>

          {loading && (
            <div style={{ color: '#6b7280' }}>
              🔄 Testing SoccersAPI connection...
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626'
            }}>
              ❌ Error: {error}
            </div>
          )}

          {testResults && (
            <div>
              <div style={{
                padding: '12px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                marginBottom: '16px'
              }}>
                <div style={{ color: '#16a34a', fontWeight: '600' }}>
                  ✅ Connected to SoccersAPI
                </div>
                <div style={{ fontSize: '14px', color: '#15803d', marginTop: '4px' }}>
                  {testResults.message}
                </div>
              </div>

              {/* Raw Data Display */}
              <details style={{ marginTop: '16px' }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  📋 Raw API Response
                </summary>
                <pre style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px',
                  marginTop: '8px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Feature Comparison */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Enhanced Features Available
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {[
              { feature: 'Enhanced Broadcasts', available: true, description: 'Multiple broadcasters per match' },
              { feature: 'Streaming Options', available: true, description: 'TV vs streaming distinction' },
              { feature: 'Broadcast Logos', available: true, description: 'Channel logos' },
              { feature: 'Venue Details', available: true, description: 'Stadium info and weather' },
              { feature: 'Kickoff Countdown', available: true, description: 'Enhanced timers' },
              { feature: 'Detailed Stats', available: false, description: 'Advanced statistics' },
              { feature: 'Live Odds', available: false, description: 'Betting odds' },
              { feature: 'Team Lineups', available: false, description: 'Starting lineups' }
            ].map((item, index) => (
              <div key={index} style={{
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: item.available ? '#f0fdf4' : '#f9fafb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{ marginRight: '8px' }}>
                    {item.available ? '✅' : '⚪'}
                  </span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {item.feature}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', margin: '0 0 12px 0' }}>
            💡 How to Test Enhanced Features
          </h3>
          <div style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              1. <strong>Look for Danish fixtures</strong> on your site (if any are scheduled)
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              2. <strong>Check fixture cards</strong> for enhanced broadcast information
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              3. <strong>Compare with Premier League fixtures</strong> (which use Football-data.org)
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              4. <strong>Contact SoccersAPI</strong> to upgrade plan for Premier League access
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link
            to="/admin"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              marginRight: '16px'
            }}
          >
            🎛️ Admin Panel
          </Link>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600'
            }}
          >
            🏠 Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestSoccersAPIPage;