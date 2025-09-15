import React, { useState, useEffect, useMemo } from 'react';
import { getTeams } from '../../services/supabase';
import type { Team } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import AdminAuth from '../../components/AdminAuth';

type CompetitionFilter = '' | 'epl' | 'ucl' | 'all';
type CountryFilter = '' | 'england' | 'spain' | 'germany' | 'italy' | 'france' | 'other';

const AdminTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filters
  const [competitionFilter, setCompetitionFilter] = useState<CompetitionFilter>('');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function - must be defined before useMemo
  const getTeamStats = () => {
    const total = teams.length;
    const eplCount = teams.filter(team => team.competition_id === 1).length;
    console.log(`[DEBUG] getTeamStats: ${total} total teams, ${eplCount} EPL teams (competition_id === 1)`);

    const withCrests = teams.filter(team => team.crest).length;
    const withShortNames = teams.filter(team => team.short_name).length;
    const withColors = teams.filter(team => team.club_colors).length;
    const withWebsites = teams.filter(team => team.website).length;
    const withVenues = teams.filter(team => team.venue).length;
    const withCities = teams.filter(team => team.city).length;
    const completeData = teams.filter(team =>
      team.crest && team.short_name && team.club_colors && team.website && team.venue
    ).length;

    return {
      total,
      eplCount,
      withCrests,
      withShortNames,
      withColors,
      withWebsites,
      withVenues,
      withCities,
      completeData
    };
  };

  // Derived state - must be before early returns
  const stats = useMemo(() => getTeamStats(), [teams]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const expiry = localStorage.getItem('adminTokenExpiry');
      if (token && expiry && new Date().getTime() < parseInt(expiry)) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTeams();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterTeams();
  }, [teams, competitionFilter, countryFilter, searchTerm]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await getTeams();
      setTeams(teamsData);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterTeams = () => {
    let filtered = [...teams];
    console.log(`[DEBUG] filterTeams called - starting with ${teams.length} teams`);
    console.log(`[DEBUG] Filters: competition="${competitionFilter}", country="${countryFilter}", search="${searchTerm}"`);

    // Text search filter - search by team name and short name if available
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.short_name && team.short_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        team.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Competition filter - now use proper database competition_id
    if (competitionFilter === 'epl') {
      console.log(`[DEBUG] EPL filter - checking ${filtered.length} teams for competition_id === 1`);
      const beforeFilter = filtered.length;
      filtered = filtered.filter(team => {
        const matches = team.competition_id === 1;
        if (!matches && (team.name.includes('Sunderland') || team.name.includes('Leeds') || team.name.includes('Burnley'))) {
          console.log(`[DEBUG] ${team.name} excluded: competition_id=${team.competition_id} (type: ${typeof team.competition_id})`);
        }
        return matches;
      });
      console.log(`[DEBUG] EPL filter result: ${beforeFilter} → ${filtered.length} teams`);
    } else if (competitionFilter === 'ucl') {
      const uclTeams = [
        'Manchester City', 'Arsenal', 'Liverpool', 'Aston Villa',
        'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Girona',
        'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen',
        'Inter Milan', 'AC Milan', 'Juventus', 'Atalanta',
        'Paris Saint-Germain', 'AS Monaco', 'Lille', 'Brest',
        'Sporting CP', 'Benfica', 'PSV Eindhoven', 'Feyenoord',
        'Celtic'
      ];
      filtered = filtered.filter(team =>
        uclTeams.some(uclTeam => {
          const teamNameLower = team.name.toLowerCase();
          const uclTeamLower = uclTeam.toLowerCase();
          return teamNameLower.includes(uclTeamLower) || uclTeamLower.includes(teamNameLower);
        })
      );
    }

    // Country filter (simplified - based on team names)
    if (countryFilter === 'england') {
      const englishIndicators = ['manchester', 'liverpool', 'arsenal', 'chelsea', 'tottenham', 'united', 'city', 'palace', 'ham', 'newcastle', 'brighton', 'everton', 'aston', 'fulham', 'brentford', 'forest', 'leicester', 'southampton', 'bournemouth', 'ipswich', 'wolves'];
      filtered = filtered.filter(team =>
        englishIndicators.some(indicator => team.name.toLowerCase().includes(indicator))
      );
    } else if (countryFilter === 'spain') {
      const spanishIndicators = ['real madrid', 'barcelona', 'atletico', 'valencia', 'sevilla', 'bilbao', 'betis', 'sociedad', 'girona', 'getafe', 'villarreal', 'espanyol'];
      filtered = filtered.filter(team =>
        spanishIndicators.some(indicator => team.name.toLowerCase().includes(indicator))
      );
    }
    // Add more country filters as needed

    console.log(`[DEBUG] filterTeams result: ${filtered.length} teams after filtering`);
    setFilteredTeams(filtered);
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout title="Teams Management">
        <div>Loading teams...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Teams Management">
        <div className="error">{error}</div>
        <button onClick={loadTeams} style={{ marginTop: '16px' }}>Retry</button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Teams Management">
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{stats.total}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Teams</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: stats.eplCount === 20 ? '#16a34a' : '#dc2626' }}>{stats.eplCount}/20</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>EPL Teams</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{Math.round((stats.withCrests / stats.total) * 100)}%</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>With Crests</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{Math.round((stats.withColors / stats.total) * 100)}%</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>With Colors</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{Math.round((stats.withVenues / stats.total) * 100)}%</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>With Venues</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{Math.round((stats.completeData / stats.total) * 100)}%</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Complete Data</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          />

          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value as CompetitionFilter)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">All Competitions</option>
            <option value="epl">Premier League</option>
            <option value="ucl">Champions League</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value as CountryFilter)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">All Countries</option>
            <option value="england">England</option>
            <option value="spain">Spain</option>
            <option value="germany">Germany</option>
            <option value="italy">Italy</option>
            <option value="france">France</option>
            <option value="other">Other</option>
          </select>

          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredTeams.length} of {teams.length} teams
          </div>
        </div>

        {/* Teams List - Full Width */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'auto',
          width: '100%',
          maxHeight: '70vh'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1400px' }}>
            <thead style={{
              position: 'sticky',
              top: 0,
              background: '#f8fafc',
              zIndex: 10
            }}>
              <tr>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '60px'
                }}>Crest</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: 'auto'
                }}>Team Name</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '120px'
                }}>Short Name</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '120px'
                }}>Slug</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '80px'
                }}>Competition</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '120px'
                }}>Colors</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '120px'
                }}>Website</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '120px'
                }}>Venue</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '120px'
                }}>Home Venue</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '120px'
                }}>City</th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '1px solid #e2e8f0',
                  width: '100px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    No teams found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id} style={{
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <td style={{ padding: '16px 12px' }}>
                      {team.crest ? (
                        <img
                          src={team.crest}
                          alt={`${team.name} crest`}
                          style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          ?
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 12px', fontWeight: '600', fontSize: '14px' }}>{team.name}</td>
                    <td style={{ padding: '16px 12px', fontSize: '13px', color: team.short_name ? '#1f2937' : '#9ca3af' }}>
                      {team.short_name || 'None'}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                      {team.slug}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: team.competition_id === 1 ? '#059669' : team.competition_id === 2 ? '#dc2626' : '#6b7280',
                        textAlign: 'center',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        background: team.competition_id === 1 ? '#f0fdf4' : team.competition_id === 2 ? '#fef2f2' : '#f9fafb'
                      }}>
                        {team.competition_id === 1 ? 'EPL' :
                         team.competition_id === 2 ? 'UCL' :
                         team.competition_id ? `C${team.competition_id}` : 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '12px', color: team.club_colors ? '#1f2937' : '#9ca3af' }}>
                      {team.club_colors ? (
                        <span style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {team.club_colors.length > 20 ? team.club_colors.substring(0, 20) + '...' : team.club_colors}
                        </span>
                      ) : 'None'}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '12px' }}>
                    {team.website ? (
                      <a
                        href={team.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2563eb', textDecoration: 'none' }}
                      >
                          {team.website.replace(/^https?:\/\//, '').split('/')[0]}
                        </a>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '12px', color: team.venue ? '#1f2937' : '#9ca3af' }}>
                      {team.venue || 'None'}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '12px', color: team.home_venue ? '#1f2937' : '#9ca3af' }}>
                      {team.home_venue || 'None'}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '12px', color: team.city ? '#1f2937' : '#9ca3af' }}>
                      {team.city || 'None'}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <button
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Data Enrichment Info */}
        <div style={{ marginTop: '24px' }}>
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
              💡 Need more team data?
            </h3>
            <p style={{ fontSize: '14px', color: '#0f172a', margin: '0 0 8px 0' }}>
              Use the team backfill script to enrich missing data from Football-Data.org:
            </p>
            <code style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}>
              npm run teams:backfill:dry
            </code>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminTeamsPage;