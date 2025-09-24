import React, { useState, useEffect } from 'react';
import { getTeams } from '../../services/supabase';
import type { Team } from '../../types';

const AdminTeamsExportPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await getTeams();
        setTeams(teamsData);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const generateCSV = () => {
    let csv = 'id,name,current_slug,new_slug,competition_id\n';
    teams.forEach(team => {
      const escapedName = team.name.replace(/"/g, '""');
      const nameWithQuotes = escapedName.includes(',') ? `"${escapedName}"` : escapedName;
      csv += `${team.id},${nameWithQuotes},${team.slug},,${team.competition_id}\n`;
    });
    return csv;
  };

  const downloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teams-slugs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCSV = () => {
    const csvContent = generateCSV();
    navigator.clipboard.writeText(csvContent);
    alert('CSV content copied to clipboard!');
  };

  if (loading) return <div>Loading teams...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Teams Export</h1>
      <p>Found {teams.length} teams</p>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={downloadCSV} style={{ marginRight: '10px' }}>
          Download CSV
        </button>
        <button onClick={copyCSV}>
          Copy CSV to Clipboard
        </button>
      </div>

      <textarea
        value={generateCSV()}
        readOnly
        style={{
          width: '100%',
          height: '400px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}
      />

      <h2>Preview (first 20 teams):</h2>
      <table border={1} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Current Slug</th>
            <th>Competition ID</th>
          </tr>
        </thead>
        <tbody>
          {teams.slice(0, 20).map(team => (
            <tr key={team.id}>
              <td>{team.id}</td>
              <td>{team.name}</td>
              <td>{team.slug}</td>
              <td>{team.competition_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTeamsExportPage;