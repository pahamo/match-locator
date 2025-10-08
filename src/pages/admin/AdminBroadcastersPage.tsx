import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

interface Provider {
  id: number;
  name: string;
  slug: string;
  type: string;
}

interface TVStationMapping {
  sportmonks_tv_station_id: number;
  provider_id: number | null;
  channel_name: string;
  broadcast_count: number;
  provider_name: string | null;
}

const AdminBroadcastersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [tvStations, setTvStations] = useState<TVStationMapping[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get all providers
      const { data: providersData } = await supabase
        .from('providers')
        .select('id, name, slug, type')
        .order('name');

      setProviders(providersData || []);

      // Get TV station mappings with broadcast counts
      const { data: broadcastsData } = await supabase
        .from('broadcasts')
        .select('sportmonks_tv_station_id, channel_name, provider_id');

      // Group by TV station ID
      const tvStationMap = new Map<number, { channel_name: string; provider_id: number | null; count: number }>();

      broadcastsData?.forEach(b => {
        if (b.sportmonks_tv_station_id) {
          const existing = tvStationMap.get(b.sportmonks_tv_station_id);
          if (existing) {
            existing.count++;
          } else {
            tvStationMap.set(b.sportmonks_tv_station_id, {
              channel_name: b.channel_name || 'Unknown',
              provider_id: b.provider_id,
              count: 1
            });
          }
        }
      });

      // Convert to array with provider names
      const providerMap = new Map(providersData?.map(p => [p.id, p.name]) || []);

      const mappings: TVStationMapping[] = Array.from(tvStationMap.entries())
        .map(([sportmonks_id, data]) => ({
          sportmonks_tv_station_id: sportmonks_id,
          channel_name: data.channel_name,
          provider_id: data.provider_id,
          provider_name: data.provider_id ? providerMap.get(data.provider_id) || null : null,
          broadcast_count: data.count
        }))
        .sort((a, b) => b.broadcast_count - a.broadcast_count);

      setTvStations(mappings);

    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Broadcaster & Channel Mappings">
      <p style={{ color: '#666', marginBottom: '30px' }}>
        This page shows how Sports Monks TV Station IDs are mapped to our providers.
      </p>

        {/* Providers */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Our Providers (ID → Name)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Slug</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 8px' }}>{p.id}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{p.name}</td>
                    <td style={{ padding: '12px 8px', color: '#666' }}>{p.slug}</td>
                    <td style={{ padding: '12px 8px' }}>{p.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* TV Station Mappings */}
        <section>
          <h2>Sports Monks TV Stations → Provider Mappings</h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Showing {tvStations.length} unique TV stations from broadcasts table
          </p>

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
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>SportMonks TV Station ID</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Channel Name</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Mapped Provider</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Broadcast Count</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tvStations.map(ts => (
                    <tr key={ts.sportmonks_tv_station_id} style={{
                      borderBottom: '1px solid #eee',
                      background: !ts.provider_id ? '#fff3cd' : 'white'
                    }}>
                      <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>
                        {ts.sportmonks_tv_station_id}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                        {ts.channel_name}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {ts.provider_name ? (
                          <span style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {ts.provider_name} (ID {ts.provider_id})
                          </span>
                        ) : (
                          <span style={{
                            background: '#ef4444',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Not Mapped
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#666' }}>
                        {ts.broadcast_count}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        {ts.provider_name ? '✅' : '⚠️'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Summary */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <h3 style={{ marginTop: 0 }}>Summary</h3>
          <ul>
            <li><strong>{providers.length}</strong> providers in database</li>
            <li><strong>{tvStations.length}</strong> unique Sports Monks TV stations</li>
            <li><strong>{tvStations.filter(ts => ts.provider_name).length}</strong> mapped to providers</li>
            <li><strong>{tvStations.filter(ts => !ts.provider_name).length}</strong> unmapped (showing as red)</li>
          </ul>
        </div>
    </AdminLayout>
  );
};

export default AdminBroadcastersPage;
