import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import Header from '../../components/Header';

interface FixtureDebugRow {
  id: number;
  utc_kickoff: string;
  home_team: string;
  away_team: string;
  competition_id: number;
  matchday: number | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  broadcaster: string | null;
  broadcaster_id: number | null;
}

interface BroadcastRecord {
  provider_id: number | null;
  channel_name: string;
  country_code: string | null;
  provider_name?: string;
}

const AdminPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<FixtureDebugRow[]>([]);
  const [broadcasts, setBroadcasts] = useState<Record<number, BroadcastRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [competitionFilter, setCompetitionFilter] = useState<string>('1'); // Default to Premier League
  const [matchweekFilter, setMatchweekFilter] = useState<string>('');
  const [broadcasterFilter, setBroadcasterFilter] = useState<string>('all'); // all | with | without
  const [dateFrom, setDateFrom] = useState<string>('2024-08-01');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    loadFixtures();
  }, [competitionFilter, matchweekFilter, broadcasterFilter, dateFrom, dateTo]);

  const loadFixtures = async () => {
    try {
      setLoading(true);

      // Build query
      let query = supabase
        .from('fixtures_with_teams')
        .select('id, utc_kickoff, home_team, away_team, competition_id, matchday, status, home_score, away_score, broadcaster, broadcaster_id')
        .order('utc_kickoff', { ascending: true });

      if (competitionFilter) {
        query = query.eq('competition_id', parseInt(competitionFilter));
      }

      if (matchweekFilter) {
        query = query.eq('matchday', parseInt(matchweekFilter));
      }

      if (dateFrom) {
        query = query.gte('utc_kickoff', `${dateFrom}T00:00:00Z`);
      }

      if (dateTo) {
        query = query.lte('utc_kickoff', `${dateTo}T23:59:59Z`);
      }

      const { data: fixturesData, error: fixturesError } = await query;

      if (fixturesError) throw fixturesError;

      let filteredFixtures: FixtureDebugRow[] = fixturesData || [];

      // Apply broadcaster filter
      if (broadcasterFilter === 'with') {
        filteredFixtures = filteredFixtures.filter((f: FixtureDebugRow) => f.broadcaster !== null);
      } else if (broadcasterFilter === 'without') {
        filteredFixtures = filteredFixtures.filter((f: FixtureDebugRow) => f.broadcaster === null);
      }

      setFixtures(filteredFixtures);

      // Load all broadcasts for these fixtures
      if (filteredFixtures.length > 0) {
        const fixtureIds = filteredFixtures.map((f: FixtureDebugRow) => f.id);
        const { data: broadcastsData } = await supabase
          .from('broadcasts')
          .select('fixture_id, provider_id, channel_name, country_code')
          .in('fixture_id', fixtureIds);

        // Get provider names
        const providerIds = Array.from(new Set(broadcastsData?.map((b: any) => b.provider_id).filter(Boolean) || []));
        const { data: providersData } = await supabase
          .from('providers')
          .select('id, name')
          .in('id', providerIds);

        const providerMap = new Map(providersData?.map((p: any) => [p.id, p.name]) || []);

        // Group broadcasts by fixture
        const broadcastsByFixture: Record<number, BroadcastRecord[]> = {};
        broadcastsData?.forEach((b: any) => {
          if (!broadcastsByFixture[b.fixture_id]) {
            broadcastsByFixture[b.fixture_id] = [];
          }
          broadcastsByFixture[b.fixture_id].push({
            provider_id: b.provider_id,
            channel_name: b.channel_name,
            country_code: b.country_code,
            provider_name: b.provider_id ? (providerMap.get(b.provider_id) as string | undefined) : undefined
          });
        });

        setBroadcasts(broadcastsByFixture);
      }

    } catch (err) {
      console.error('Failed to load fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompetitionName = (id: number) => {
    const comps: Record<number, string> = {
      1: 'Premier League',
      2: 'Champions League',
      3: 'FA Cup',
      4: 'EFL Cup',
      5: 'Europa League',
      6: 'Conference League',
    };
    return comps[id] || `Competition ${id}`;
  };

  const formatDate = (utc: string) => {
    return new Date(utc).toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <Header />
      <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
        <h1>Fixture Debug Admin</h1>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Competition</label>
            <select
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="">All Competitions</option>
              <option value="1">Premier League</option>
              <option value="2">Champions League</option>
              <option value="3">FA Cup</option>
              <option value="4">EFL Cup</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Matchweek</label>
            <input
              type="number"
              value={matchweekFilter}
              onChange={(e) => setMatchweekFilter(e.target.value)}
              placeholder="All matchweeks"
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Broadcaster Status</label>
            <select
              value={broadcasterFilter}
              onChange={(e) => setBroadcasterFilter(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="all">All</option>
              <option value="with">With Broadcaster</option>
              <option value="without">Without Broadcaster (TBD)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          <strong>Total: {fixtures.length} fixtures</strong>
          {' | '}
          With Broadcaster: {fixtures.filter(f => f.broadcaster).length}
          {' | '}
          TBD: {fixtures.filter(f => !f.broadcaster).length}
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Match</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Competition</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>MW</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>Score</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Broadcaster (View)</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>All Broadcasts (DB)</th>
                </tr>
              </thead>
              <tbody>
                {fixtures.map((fixture) => {
                  const fixturebroadcasts = broadcasts[fixture.id] || [];
                  const hasScore = fixture.home_score !== null && fixture.away_score !== null;

                  return (
                    <tr key={fixture.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 8px', color: '#666' }}>{fixture.id}</td>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                        {formatDate(fixture.utc_kickoff)}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                        {fixture.home_team} vs {fixture.away_team}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {getCompetitionName(fixture.competition_id)}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        {fixture.matchday || '-'}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        {hasScore ? `${fixture.home_score} - ${fixture.away_score}` : '-'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {fixture.broadcaster ? (
                          <span style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {fixture.broadcaster}
                          </span>
                        ) : (
                          <span style={{
                            background: '#f59e0b',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            TBD
                          </span>
                        )}
                        {fixture.broadcaster_id && (
                          <span style={{ marginLeft: '8px', color: '#666', fontSize: '11px' }}>
                            (ID: {fixture.broadcaster_id})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {fixturebroadcasts.length > 0 ? (
                          <div style={{ fontSize: '11px' }}>
                            {fixturebroadcasts.map((b, idx) => (
                              <div key={idx} style={{ marginBottom: '4px' }}>
                                <strong>{b.channel_name}</strong>
                                {b.provider_name && (
                                  <span style={{ color: '#666', marginLeft: '6px' }}>
                                    [{b.provider_name}]
                                  </span>
                                )}
                                {!b.provider_name && b.provider_id === null && (
                                  <span style={{ color: '#f59e0b', marginLeft: '6px' }}>
                                    [UNMAPPED]
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>No broadcasts</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
