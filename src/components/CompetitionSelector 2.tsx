import React from 'react';
import type { SimpleCompetition } from '../services/supabase-simple';

interface CompetitionSelectorProps {
  competitions: SimpleCompetition[];
  selectedCompetitionId: number;
  onCompetitionChange: (competitionId: number) => void;
  loading?: boolean;
}

const CompetitionSelector: React.FC<CompetitionSelectorProps> = ({
  competitions,
  selectedCompetitionId,
  onCompetitionChange,
  loading = false
}) => {
  return (
    <div className="competition-selector" style={{ marginBottom: '1.5rem' }}>
      <label 
        htmlFor="competition-select"
        style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontSize: '0.875rem', 
          fontWeight: 600,
          color: '#374151'
        }}
      >
        Competition
      </label>
      <select
        id="competition-select"
        value={selectedCompetitionId}
        onChange={(e) => onCompetitionChange(Number(e.target.value))}
        disabled={loading || competitions.length === 0}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          backgroundColor: '#ffffff',
          fontSize: '0.875rem',
          color: '#374151',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
        aria-label="Select competition"
      >
        {competitions.map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name}
            {competition.short_name && ` (${competition.short_name})`}
          </option>
        ))}
      </select>
      {loading && (
        <p style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280', 
          marginTop: '0.25rem' 
        }}>
          Loading competitions...
        </p>
      )}
    </div>
  );
};

export default CompetitionSelector;