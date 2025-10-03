import React from 'react';
import { Link } from 'react-router-dom';
import { getAllCompetitionConfigs, CompetitionConfig } from '../config/competitions';

interface CompetitionBadgeProps {
  competitionId: number;
}

export const CompetitionBadge: React.FC<CompetitionBadgeProps> = ({ competitionId }) => {
  const allCompetitions = getAllCompetitionConfigs();
  const competition = allCompetitions.find((c: CompetitionConfig) => c.id === competitionId);

  if (!competition) {
    return null;
  }

  return (
    <Link
      to={`/matches?competition=${competition.slug}`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:shadow-md mb-4"
      style={{
        borderColor: competition.colors.primary,
        backgroundColor: `${competition.colors.primary}10`,
        color: competition.colors.primary
      }}
    >
      <span className="text-lg">{competition.icon}</span>
      <span className="font-semibold">{competition.name}</span>
    </Link>
  );
};
