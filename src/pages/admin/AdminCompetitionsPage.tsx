import React, { useState, useEffect } from 'react';
import { getSimpleCompetitions } from '../../services/supabase-simple';
import type { Competition } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import AdminAuth from '../../components/AdminAuth';

type VisibilityFilter = '' | 'visible' | 'hidden';

const AdminCompetitionsPage: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filters
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('');
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
      loadCompetitions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterCompetitions();
  }, [competitions, visibilityFilter, searchTerm]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const competitionsData = await getSimpleCompetitions(true); // Include hidden competitions
      setCompetitions(competitionsData);
    } catch (err) {
      console.error('Failed to load competitions:', err);
      setError('Failed to load competitions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterCompetitions = () => {
    let filtered = [...competitions];

    // Text search filter
    if (searchTerm) {
      filtered = filtered.filter(competition =>
        competition.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Visibility filter
    if (visibilityFilter === 'visible') {
      filtered = filtered.filter(competition => competition.is_production_visible);
    } else if (visibilityFilter === 'hidden') {
      filtered = filtered.filter(competition => !competition.is_production_visible);
    }

    setFilteredCompetitions(filtered);
  };

  const getCompetitionStats = () => {
    const total = competitions.length;
    const visible = competitions.filter(c => c.is_production_visible).length;
    const hidden = total - visible;

    return { total, visible, hidden };
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout title="Competitions Management">
        <div>Loading competitions...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Competitions Management">
        <div className="error">{error}</div>
        <button onClick={loadCompetitions} style={{ marginTop: '16px' }}>Retry</button>
      </AdminLayout>
    );
  }

  const stats = getCompetitionStats();

  return (
    <AdminLayout title="Competitions Management">
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
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Competitions</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{stats.visible}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Visible to Public</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{stats.hidden}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Hidden</div>
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
            placeholder="Search competitions..."
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
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">All Competitions</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
          </select>

          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredCompetitions.length} of {competitions.length} competitions
          </div>
        </div>

        {/* Competitions List */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 120px 120px 120px 100px',
            gap: '16px',
            padding: '16px',
            background: '#f8fafc',
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div>Logo</div>
            <div>Name</div>
            <div>ID</div>
            <div>Slug</div>
            <div>Visibility</div>
            <div>Actions</div>
          </div>

          {filteredCompetitions.length === 0 ? (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              No competitions found matching your filters.
            </div>
          ) : (
            filteredCompetitions.map((competition) => (
              <div
                key={competition.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 120px 120px 100px',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid #e2e8f0',
                  alignItems: 'center'
                }}
              >
                <div>
                  {(competition as any).logo ? (
                    <img
                      src={(competition as any).logo}
                      alt={`${competition.name} logo`}
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
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{competition.name}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {competition.id}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {competition.slug}
                </div>
                <div>
                  <span style={{
                    background: competition.is_production_visible ? '#dcfce7' : '#fee2e2',
                    color: competition.is_production_visible ? '#166534' : '#dc2626',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {competition.is_production_visible ? 'Visible' : 'Hidden'}
                  </span>
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

        {/* Competition Details */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Competition Management
          </h2>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Visibility Management
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  Control which competitions are visible to users on the public website.
                </p>
                <ul style={{ fontSize: '14px', color: '#6b7280', paddingLeft: '20px' }}>
                  <li><strong>Visible:</strong> Competition appears in dropdowns and fixture listings</li>
                  <li><strong>Hidden:</strong> Competition exists in database but is not shown to users</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      border: '1px solid #16a34a',
                      borderRadius: '6px',
                      background: '#dcfce7',
                      color: '#166534',
                      cursor: 'pointer'
                    }}
                  >
                    Show All Competitions
                  </button>
                  <button
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      border: '1px solid #dc2626',
                      borderRadius: '6px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    Hide Non-Essential
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminCompetitionsPage;