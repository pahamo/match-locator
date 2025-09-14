import React, { useState, useEffect } from 'react';
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

    // Text search filter
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Competition filter (simplified - based on common knowledge)
    if (competitionFilter === 'epl') {
      const eplTeams = [
        'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
        'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town',
        'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
        'Nottingham Forest', 'Southampton', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'
      ];
      filtered = filtered.filter(team =>
        eplTeams.some(eplTeam => {
          const teamNameLower = team.name.toLowerCase();
          const eplTeamLower = eplTeam.toLowerCase();
          return teamNameLower.includes(eplTeamLower) ||
                 eplTeamLower.includes(teamNameLower) ||
                 (eplTeam === 'Brighton & Hove Albion' && teamNameLower.includes('brighton')) ||
                 (eplTeam === 'Wolverhampton Wanderers' && (teamNameLower.includes('wolves') || teamNameLower.includes('wolverhampton')));
        })
      );
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

    setFilteredTeams(filtered);
  };

  const getTeamStats = () => {
    const total = teams.length;
    const eplCount = teams.filter(team => {
      const eplTeams = ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich', 'Leicester', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle', 'Nottingham Forest', 'Southampton', 'Tottenham', 'West Ham', 'Wolverhampton'];
      return eplTeams.some(eplTeam => team.name.toLowerCase().includes(eplTeam.toLowerCase()));
    }).length;

    const withCrests = teams.filter(team => team.crest).length;

    return { total, eplCount, withCrests };
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

  const stats = getTeamStats();

  return (
    <AdminLayout title="Teams Management">
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{stats.eplCount}/20</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>EPL Teams</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{stats.withCrests}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>With Crests</div>
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

        {/* Teams List */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 120px 120px 100px',
            gap: '16px',
            padding: '16px',
            background: '#f8fafc',
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div>Crest</div>
            <div>Name</div>
            <div>Slug</div>
            <div>ID</div>
            <div>Actions</div>
          </div>

          {filteredTeams.length === 0 ? (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              No teams found matching your filters.
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 120px 100px',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid #e2e8f0',
                  alignItems: 'center'
                }}
              >
                <div>
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
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{team.name}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {team.slug}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {team.id}
                </div>
                <div>
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
                </div>
              </div>
            ))
          )}
        </div>
    </AdminLayout>
  );
};

export default AdminTeamsPage;