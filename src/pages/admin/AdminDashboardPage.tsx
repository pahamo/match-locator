import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSimpleFixtures, getSimpleCompetitions } from '../../services/supabase-simple';
import { getTeams } from '../../services/supabase';
import { getMatchStatus } from '../../utils/matchStatus';
import AdminLayout from '../../components/AdminLayout';
import AdminAuth from '../../components/AdminAuth';
import FeatureFlagControls from '../../components/admin/FeatureFlagControls';

interface DashboardStats {
  teams: {
    total: number;
    eplCount: number;
    withCrests: number;
  };
  fixtures: {
    total: number;
    upcoming: number;
    live: number;
    finished: number;
    withBroadcaster: number;
    blackouts: number;
  };
  competitions: {
    total: number;
    visible: number;
  };
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [teams, fixtures, competitions] = await Promise.all([
        getTeams(),
        getSimpleFixtures(1), // Get Premier League fixtures for now
        getSimpleCompetitions(true) // Include hidden competitions
      ]);

      // Calculate team stats - use competition_id for accuracy
      const eplCount = teams.filter(team => team.competition_id === 1).length;

      const teamStats = {
        total: teams.length,
        eplCount,
        withCrests: teams.filter(team => team.crest).length
      };

      // Calculate fixture stats
      let upcoming = 0;
      let live = 0;
      let finished = 0;
      let withBroadcaster = 0;
      let blackouts = 0;

      fixtures.forEach(fixture => {
        const status = getMatchStatus(fixture.kickoff_utc);

        if (status.status === 'upcoming') upcoming++;
        else if (status.status === 'live' || status.status === 'upNext') live++;
        else if (status.status === 'finished') finished++;

        if (fixture.broadcaster) withBroadcaster++;
        if (fixture.isBlackout) blackouts++;
      });

      const fixtureStats = {
        total: fixtures.length,
        upcoming,
        live,
        finished,
        withBroadcaster,
        blackouts
      };

      // Calculate competition stats
      const competitionStats = {
        total: competitions.length,
        visible: competitions.filter(c => c.is_production_visible).length
      };

      setStats({
        teams: teamStats,
        fixtures: fixtureStats,
        competitions: competitionStats
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div>Loading dashboard...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="error">{error}</div>
        <button onClick={loadDashboardData} style={{ marginTop: '16px' }}>Retry</button>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  return (
    <AdminLayout title="Dashboard">
        {/* Quick Stats Overview */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            System Overview
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Teams Stats */}
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>⚽</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Teams</h3>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                {stats.teams.total}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total teams</div>
              <div style={{ fontSize: '12px', color: stats.teams.eplCount === 20 ? '#16a34a' : '#dc2626' }}>
                {stats.teams.eplCount}/20 EPL teams
              </div>
            </div>

            {/* Fixtures Stats */}
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>🏆</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Fixtures</h3>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                {stats.fixtures.total}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total fixtures</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {stats.fixtures.upcoming} upcoming, {stats.fixtures.live} live
              </div>
            </div>

            {/* Broadcaster Coverage */}
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>📺</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Broadcasters</h3>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                {Math.round((stats.fixtures.withBroadcaster / stats.fixtures.total) * 100)}%
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Coverage</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {stats.fixtures.blackouts} blackouts
              </div>
            </div>

            {/* Competitions */}
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>🏟️</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Competitions</h3>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                {stats.competitions.total}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total competitions</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {stats.competitions.visible} visible
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Quick Actions
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <Link
              to="/admin/teams"
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>⚽</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Manage Teams</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                View and manage all teams. Currently {stats.teams.eplCount < 20 ? 'missing' : 'have all'} EPL teams.
              </p>
            </Link>

            <Link
              to="/admin/matches"
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>🏆</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Manage Fixtures</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                Edit broadcaster assignments and manage fixture data.
              </p>
            </Link>

            <Link
              to="/admin/competitions"
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>🏟️</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Manage Competitions</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                Configure competition visibility and settings.
              </p>
            </Link>

            <Link
              to="/admin/fix-data"
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#dc2626';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>🔧</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Fix Data Issues</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                Fix team competition_id assignments and data inconsistencies.
              </p>
            </Link>

            <Link
              to="/database-analysis"
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#059669';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>📊</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>Database Analysis</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                Analyze database structure and identify data issues.
              </p>
            </Link>
          </div>
        </div>

        {/* System Health */}
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            System Health
          </h2>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>EPL Teams Coverage</span>
                <span style={{
                  color: stats.teams.eplCount === 20 ? '#16a34a' : '#dc2626',
                  fontWeight: '600'
                }}>
                  {stats.teams.eplCount === 20 ? '✓ Complete' : `⚠️ ${20 - stats.teams.eplCount} missing`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Broadcaster Coverage</span>
                <span style={{
                  color: stats.fixtures.withBroadcaster > (stats.fixtures.total * 0.8) ? '#16a34a' : '#f59e0b',
                  fontWeight: '600'
                }}>
                  {Math.round((stats.fixtures.withBroadcaster / stats.fixtures.total) * 100)}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Team Crests</span>
                <span style={{
                  color: stats.teams.withCrests > (stats.teams.total * 0.9) ? '#16a34a' : '#f59e0b',
                  fontWeight: '600'
                }}>
                  {Math.round((stats.teams.withCrests / stats.teams.total) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Flag Controls */}
        <div style={{ marginTop: '32px' }}>
          <FeatureFlagControls />
        </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;