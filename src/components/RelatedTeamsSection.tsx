import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Team } from '../types';
import { getTeamsByCompetition, getTeams } from '../services/supabase';
import { formatTeamNameShort, getPopularTeamSlugs } from '../utils/seo';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';

interface RelatedTeamsSectionProps {
  currentTeam: Team;
  competitionName?: string;
}

export const RelatedTeamsSection: React.FC<RelatedTeamsSectionProps> = ({
  currentTeam,
  competitionName
}) => {
  const [relatedTeams, setRelatedTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedTeams = async () => {
      setLoading(true);

      let teams: Team[] = [];

      // Try to get teams from same competition
      if (currentTeam.competition_id) {
        teams = await getTeamsByCompetition(currentTeam.competition_id, 9);
        // Filter out current team
        teams = teams.filter(t => t.id !== currentTeam.id).slice(0, 8);
      }

      // Fallback to popular Premier League teams if we don't have enough teams
      if (teams.length < 6) {
        const popularSlugs = getPopularTeamSlugs();
        const allTeams = await getTeams();
        const popularTeams = allTeams.filter(t =>
          popularSlugs.includes(t.slug) && t.id !== currentTeam.id
        );
        teams = popularTeams.slice(0, 6);
      }

      setRelatedTeams(teams);
      setLoading(false);
    };

    fetchRelatedTeams();
  }, [currentTeam.id, currentTeam.competition_id]);

  if (loading || relatedTeams.length === 0) {
    return null;
  }

  const sectionTitle = competitionName
    ? `Teams in ${competitionName}`
    : 'Popular Premier League Teams';

  return (
    <Card variant="outline" className="mb-8">
      <CardHeader size="default">
        <CardTitle size="default" as="h2">
          {sectionTitle}
        </CardTitle>
      </CardHeader>

      <CardContent size="default">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {relatedTeams.map((team) => (
            <Link
              key={team.id}
              to={`/club/${team.slug}`}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
            >
              {team.crest && (
                <img
                  src={team.crest}
                  alt={`${team.name} crest`}
                  className="w-16 h-16 object-contain mb-2 group-hover:scale-110 transition-transform"
                />
              )}
              <span className="text-sm font-medium text-center text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {formatTeamNameShort(team.name)}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
