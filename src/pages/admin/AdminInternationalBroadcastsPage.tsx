import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

interface Fixture {
  id: number;
  kickoff_utc: string;
  home_team_name: string;
  away_team_name: string;
  competition_name: string;
}

interface Broadcast {
  id: number;
  fixture_id: number;
  channel_name: string;
  country_code: string | null;
  broadcaster_type: string | null;
  requires_subscription: boolean;
}

interface CountryStats {
  code: string;
  name: string;
  broadcastCount: number;
  fixtureCount: number;
  channels: Set<string>;
}

const COUNTRY_NAMES: Record<string, string> = {
  'GB': 'United Kingdom',
  'GBR': 'United Kingdom (alt)',
  'EN': 'England',
  'US': 'United States',
  'CA': 'Canada',
  'AU': 'Australia',
  'IE': 'Ireland',
  'DE': 'Germany',
  'FR': 'France',
  'ES': 'Spain',
  'IT': 'Italy',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'PT': 'Portugal',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'MX': 'Mexico',
  'JP': 'Japan',
  'IN': 'India',
  'CN': 'China',
  'ZA': 'South Africa'
};

const AdminInternationalBroadcastsPage: React.FC = () => {
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('GB');
  const [fixtures, setFixtures] = useState<(Fixture & { broadcasts: Broadcast[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCountryStats();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      loadFixturesForCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const loadCountryStats = async () => {
    try {
      setLoading(true);

      // Get all broadcasts with country codes
      const { data: broadcasts } = await supabase
        .from('broadcasts')
        .select('country_code, fixture_id, channel_name');

      if (!broadcasts) return;

      // Group by country
      const countryMap = new Map<string, { fixtures: Set<number>; channels: Set<string>; count: number }>();

      broadcasts.forEach(b => {
        if (b.country_code) {
          if (!countryMap.has(b.country_code)) {
            countryMap.set(b.country_code, {
              fixtures: new Set(),
              channels: new Set(),
              count: 0
            });
          }
          const stats = countryMap.get(b.country_code)!;
          stats.fixtures.add(b.fixture_id);
          stats.channels.add(b.channel_name);
          stats.count++;
        }
      });

      // Convert to array
      const countriesArray: CountryStats[] = Array.from(countryMap.entries())
        .map(([code, data]) => ({
          code,
          name: COUNTRY_NAMES[code] || code,
          broadcastCount: data.count,
          fixtureCount: data.fixtures.size,
          channels: data.channels
        }))
        .sort((a, b) => b.broadcastCount - a.broadcastCount);

      setCountries(countriesArray);

    } catch (err) {
      console.error('Failed to load country stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFixturesForCountry = async (countryCode: string) => {
    try {
      setFixturesLoading(true);

      // Get all broadcasts for this country
      const { data: broadcasts } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('country_code', countryCode)
        .order('fixture_id');

      if (!broadcasts) return;

      // Get unique fixture IDs
      const fixtureIds = Array.from(new Set(broadcasts.map(b => b.fixture_id)));

      // Get fixture details
      const { data: fixturesData } = await supabase
        .from('fixtures_with_teams')
        .select('id, kickoff_utc, home_team_name, away_team_name, competition_name')
        .in('id', fixtureIds)
        .order('kickoff_utc', { ascending: false })
        .limit(50);

      if (!fixturesData) return;

      // Group broadcasts by fixture
      const broadcastsByFixture = broadcasts.reduce((acc, b) => {
        if (!acc[b.fixture_id]) {
          acc[b.fixture_id] = [];
        }
        acc[b.fixture_id].push(b);
        return acc;
      }, {} as Record<number, Broadcast[]>);

      // Combine fixtures with their broadcasts
      const fixturesWithBroadcasts = fixturesData.map(f => ({
        ...f,
        broadcasts: broadcastsByFixture[f.id] || []
      }));

      setFixtures(fixturesWithBroadcasts);

    } catch (err) {
      console.error('Failed to load fixtures:', err);
    } finally {
      setFixturesLoading(false);
    }
  };

  const filteredFixtures = fixtures.filter(f => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.home_team_name.toLowerCase().includes(term) ||
      f.away_team_name.toLowerCase().includes(term) ||
      f.competition_name.toLowerCase().includes(term) ||
      f.broadcasts.some(b => b.channel_name.toLowerCase().includes(term))
    );
  });

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  if (loading) {
    return (
      <AdminLayout title="International Broadcasts">
        <div style={{ padding: '20px' }}>
          <p>Loading country statistics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="International Broadcasts">
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px' }}>International Broadcast Rights Testing</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Test broadcast availability across different countries before making frontend changes
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
          {/* Country Selector */}
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Countries ({countries.length})</h2>

            <div style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              {countries.map(country => (
                <div
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  style={{
                    padding: '12px 15px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: selectedCountry === country.code ? '#f0f7ff' : 'white',
                    borderLeft: selectedCountry === country.code ? '3px solid #2563eb' : '3px solid transparent'
                  }}
                >
                  <div style={{ fontWeight: selectedCountry === country.code ? 'bold' : 'normal', marginBottom: '4px' }}>
                    {country.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {country.code} • {country.fixtureCount} fixtures • {country.broadcastCount} broadcasts
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                    {country.channels.size} channels
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fixtures List */}
          <div>
            {selectedCountryData && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>
                    {selectedCountryData.name} Broadcast Rights
                  </h2>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Fixtures</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedCountryData.fixtureCount}</div>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Broadcasts</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedCountryData.broadcastCount}</div>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Channels</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedCountryData.channels.size}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                      Channels ({selectedCountryData.channels.size}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {Array.from(selectedCountryData.channels).sort().map(channel => (
                        <span
                          key={channel}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#e0e7ff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#3730a3'
                          }}
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Search fixtures or channels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {fixturesLoading ? (
                  <p>Loading fixtures...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {filteredFixtures.map(fixture => (
                      <div
                        key={fixture.id}
                        style={{
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '15px',
                          backgroundColor: 'white'
                        }}
                      >
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                            {fixture.home_team_name} vs {fixture.away_team_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {fixture.competition_name} • {new Date(fixture.kickoff_utc).toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>
                            Broadcasts ({fixture.broadcasts.length}):
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {fixture.broadcasts.map(broadcast => (
                              <div
                                key={broadcast.id}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#f3f4f6',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <span>{broadcast.channel_name}</span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {broadcast.broadcaster_type && (
                                    <span style={{
                                      padding: '2px 6px',
                                      backgroundColor: broadcast.broadcaster_type === 'tv' ? '#dbeafe' : '#fef3c7',
                                      borderRadius: '3px',
                                      fontSize: '11px',
                                      color: broadcast.broadcaster_type === 'tv' ? '#1e40af' : '#92400e'
                                    }}>
                                      {broadcast.broadcaster_type}
                                    </span>
                                  )}
                                  {broadcast.requires_subscription && (
                                    <span style={{
                                      padding: '2px 6px',
                                      backgroundColor: '#fee2e2',
                                      borderRadius: '3px',
                                      fontSize: '11px',
                                      color: '#991b1b'
                                    }}>
                                      subscription
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredFixtures.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No fixtures found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInternationalBroadcastsPage;
