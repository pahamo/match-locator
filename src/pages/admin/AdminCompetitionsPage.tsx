import React, { useState, useEffect } from 'react';
import { getSimpleCompetitions } from '../../services/supabase-simple';
import { getCompetitionConfig } from '../../config/competitions';
import { supabase } from '../../services/supabase';
import type { Competition } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import AdminAuth from '../../components/AdminAuth';

type VisibilityFilter = '' | 'visible' | 'hidden';

interface CompetitionWithStats extends Competition {
  fixtureCount?: number;
  config?: {
    logo?: string;
    shortName: string;
    icon: string;
  };
}

const AdminCompetitionsPage: React.FC = () => {
  const [competitions, setCompetitions] = useState<CompetitionWithStats[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<CompetitionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionWithStats | null>(null);

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

      // Load competitions
      const competitionsData = await getSimpleCompetitions(true); // Include hidden competitions

      // Get fixture counts for each competition
      const competitionsWithStats: CompetitionWithStats[] = await Promise.all(
        competitionsData.map(async (competition) => {
          // Get fixture count for current season
          const now = new Date();
          const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
          const seasonStartIso = `${seasonYear}-08-01T00:00:00.000Z`;

          try {
            const { count } = await supabase
              .from('fixtures')
              .select('*', { count: 'exact', head: true })
              .eq('competition_id', competition.id)
              .gte('utc_kickoff', seasonStartIso);

            // Get centralized competition config
            const config = getCompetitionConfig(competition.slug);

            return {
              ...competition,
              fixtureCount: count || 0,
              config: config ? {
                logo: config.logo,
                shortName: config.shortName,
                icon: config.icon,
              } : {
                shortName: competition.short_name || competition.name.substring(0, 3).toUpperCase(),
                icon: '🏁'
              }
            };
          } catch (countError) {
            console.warn(`Failed to get fixture count for ${competition.name}:`, countError);
            const config = getCompetitionConfig(competition.slug);

            return {
              ...competition,
              fixtureCount: 0,
              config: config ? {
                logo: config.logo,
                shortName: config.shortName,
                icon: config.icon,
              } : {
                shortName: competition.short_name || competition.name.substring(0, 3).toUpperCase(),
                icon: '🏁'
              }
            };
          }
        })
      );

      setCompetitions(competitionsWithStats);
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

  const handleEditClick = (competition: CompetitionWithStats) => {
    setSelectedCompetition(competition);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedCompetition(null);
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
            gridTemplateColumns: '60px 1fr 80px 140px 80px 90px 120px 100px',
            gap: '12px',
            padding: '16px',
            background: '#f8fafc',
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div>Logo</div>
            <div>Name</div>
            <div>Short</div>
            <div>Slug</div>
            <div>ID</div>
            <div>Fixtures</div>
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
                  gridTemplateColumns: '60px 1fr 80px 140px 80px 90px 120px 100px',
                  gap: '12px',
                  padding: '16px',
                  borderBottom: '1px solid #e2e8f0',
                  alignItems: 'center'
                }}
              >
                {/* Logo */}
                <div>
                  {competition.config?.logo ? (
                    <img
                      src={competition.config.logo}
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
                      fontSize: '16px',
                      color: '#6b7280'
                    }}>
                      {competition.config?.icon || '🏁'}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{competition.name}</div>
                </div>

                {/* Short Name */}
                <div>
                  <span style={{
                    background: '#f0f9ff',
                    color: '#0369a1',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {competition.config?.shortName || competition.short_name || 'N/A'}
                  </span>
                </div>

                {/* Slug */}
                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {competition.slug}
                </div>

                {/* ID */}
                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {competition.id}
                </div>

                {/* Fixtures Count */}
                <div>
                  <span style={{
                    background: competition.fixtureCount && competition.fixtureCount > 0 ? '#f0fdf4' : '#fef3c7',
                    color: competition.fixtureCount && competition.fixtureCount > 0 ? '#166534' : '#92400e',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {competition.fixtureCount ?? '?'}
                  </span>
                </div>

                {/* Visibility */}
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

                {/* Actions */}
                <div>
                  <button
                    onClick={() => handleEditClick(competition)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
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

        {/* Edit Dialog */}
        {editDialogOpen && selectedCompetition && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {selectedCompetition.config?.logo ? (
                  <img
                    src={selectedCompetition.config.logo}
                    alt={`${selectedCompetition.name} logo`}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {selectedCompetition.config?.icon || '🏁'}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {selectedCompetition.name}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                    {selectedCompetition.config?.shortName || selectedCompetition.short_name} • {selectedCompetition.fixtureCount || 0} fixtures
                  </p>
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                    No Edit Actions Available
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                  Competition editing functionality is not yet implemented. Currently, competition data
                  is managed through the centralized configuration file at{' '}
                  <code style={{ background: '#fed7aa', padding: '2px 4px', borderRadius: '2px' }}>
                    src/config/competitions.ts
                  </code>
                </p>
              </div>

              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                  Current Configuration
                </h4>
                <div style={{ fontSize: '13px', color: '#0c4a6e', fontFamily: 'monospace' }}>
                  <div><strong>ID:</strong> {selectedCompetition.id}</div>
                  <div><strong>Slug:</strong> {selectedCompetition.slug}</div>
                  <div><strong>Short Name:</strong> {selectedCompetition.config?.shortName || 'Not set'}</div>
                  <div><strong>Logo:</strong> {selectedCompetition.config?.logo ? 'Configured' : 'Not set'}</div>
                  <div><strong>Fixtures:</strong> {selectedCompetition.fixtureCount || 0}</div>
                  <div><strong>Visible:</strong> {selectedCompetition.is_production_visible ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCloseEditDialog}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default AdminCompetitionsPage;