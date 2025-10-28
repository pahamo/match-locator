import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import { formatTeamNameShort } from '../utils/seo';
import type { Team } from '../types';

interface StandingDetail {
  type: {
    id: number;
    developer_name: string;
  };
  value: number;
}

interface StandingEntry {
  position: number;
  points: number;
  result: 'up' | 'down' | 'equal';
  participant: {
    id: number;
    name: string;
    short_code: string;
    image_path: string;
  };
  details: StandingDetail[];
  form: Array<{
    form: 'W' | 'L' | 'D';
    sort_order: number;
  }>;
  rule?: {
    type: {
      name: string;
      developer_name: string;
    };
  } | null;
}

interface LeagueStandingsProps {
  seasonId: number;
  competitionName?: string;
  compact?: boolean; // Compact mode hides some columns
  teams?: Team[]; // Optional teams for slug mapping
}

interface ParsedStanding {
  position: number;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
  qualification?: string;
  result: 'up' | 'down' | 'equal';
}

const parseStandingDetails = (details: StandingDetail[]) => {
  const stats: Record<string, number> = {};

  details.forEach(detail => {
    const key = detail.type.developer_name;
    stats[key] = detail.value;
  });

  return {
    played: stats.OVERALL_MATCHES || 0,
    won: stats.OVERALL_WINS || 0,
    drawn: stats.OVERALL_DRAWS || 0,
    lost: stats.OVERALL_LOST || 0,
    goalsFor: stats.OVERALL_SCORED || 0,
    goalsAgainst: stats.OVERALL_CONCEDED || 0,
    goalDifference: stats.OVERALL_GOAL_DIFFERENCE || 0,
  };
};

export const LeagueStandings: React.FC<LeagueStandingsProps> = ({
  seasonId,
  competitionName = 'League',
  compact = false,
  teams = []
}) => {
  const [standings, setStandings] = useState<ParsedStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a mapping from team short names to slugs for link generation
  const teamSlugMap = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach(team => {
      const shortName = formatTeamNameShort(team.name).toLowerCase();
      map.set(shortName, team.slug);
    });
    return map;
  }, [teams]);

  // Helper function to get team slug from team name
  const getTeamSlug = (teamName: string): string | null => {
    const shortName = teamName.toLowerCase();
    return teamSlugMap.get(shortName) || null;
  };

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        // Use Netlify function to avoid CORS issues
        const url = `/.netlify/functions/standings?seasonId=${seasonId}`;

        const response = await fetch(url);

        // Check if we got HTML instead of JSON (happens in dev mode without Netlify)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          // Running in dev mode without Netlify functions
          setError('Standings not available in development mode. Run `netlify dev` to enable.');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const standingsData: StandingEntry[] = data.data || [];

        // Parse and sort by position
        const parsed: ParsedStanding[] = standingsData
          .map((entry) => {
            const stats = parseStandingDetails(entry.details);

            // Get last 5-6 form results, sorted by sort_order
            const formResults = entry.form
              .sort((a, b) => b.sort_order - a.sort_order)
              .slice(0, 6)
              .map(f => f.form)
              .reverse();

            return {
              position: entry.position,
              teamName: formatTeamNameShort(entry.participant.name),
              teamLogo: entry.participant.image_path,
              played: stats.played,
              won: stats.won,
              drawn: stats.drawn,
              lost: stats.lost,
              goalsFor: stats.goalsFor,
              goalsAgainst: stats.goalsAgainst,
              goalDifference: stats.goalDifference,
              points: entry.points,
              form: formResults,
              qualification: entry.rule?.type?.name,
              result: entry.result,
            };
          })
          .sort((a, b) => a.position - b.position);

        setStandings(parsed);
        setError(null);
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load standings');
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [seasonId]);

  const getPositionColor = (qualification?: string) => {
    if (!qualification) return '';

    const name = qualification.toLowerCase();
    if (name.includes('champions league')) return 'bg-blue-500';
    if (name.includes('europa league')) return 'bg-orange-500';
    if (name.includes('relegation')) return 'bg-red-500';

    return '';
  };

  const getFormBadge = (result: 'W' | 'L' | 'D') => {
    const colors = {
      W: 'bg-green-600 text-white',
      D: 'bg-gray-500 text-white',
      L: 'bg-red-600 text-white',
    };

    return (
      <span
        className={`inline-block w-6 h-6 text-xs font-semibold rounded flex items-center justify-center ${colors[result]}`}
        title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
      >
        {result}
      </span>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading standings...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 font-semibold">Pos</th>
                <th className="text-left py-3 px-2 font-semibold">Team</th>
                <th className={`text-center py-3 px-2 font-semibold ${compact ? 'hidden' : ''}`}>P</th>
                <th className={`text-center py-3 px-2 font-semibold ${compact ? 'hidden' : 'hidden sm:table-cell'}`}>W</th>
                <th className={`text-center py-3 px-2 font-semibold ${compact ? 'hidden' : 'hidden sm:table-cell'}`}>D</th>
                <th className={`text-center py-3 px-2 font-semibold ${compact ? 'hidden' : 'hidden sm:table-cell'}`}>L</th>
                <th className={`text-center py-3 px-2 font-semibold ${compact ? 'hidden' : 'hidden md:table-cell'}`}>GF</th>
                <th className={`text-center py-3 px-2 font-semibold ${compact ? 'hidden' : 'hidden md:table-cell'}`}>GA</th>
                <th className="text-center py-3 px-2 font-semibold">GD</th>
                <th className="text-center py-3 px-2 font-semibold">Pts</th>
                <th className={`text-center py-3 px-2 font-semibold ${compact ? 'hidden' : 'hidden lg:table-cell'}`}>Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => (
                <tr
                  key={team.position}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1 h-8 rounded ${getPositionColor(team.qualification)}`}
                        title={team.qualification}
                      />
                      <span className="font-semibold">{team.position}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={team.teamLogo}
                        alt={team.teamName}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {getTeamSlug(team.teamName) ? (
                        <a
                          href={`/clubs/${getTeamSlug(team.teamName)}`}
                          className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {team.teamName}
                        </a>
                      ) : (
                        <span className="font-medium">{team.teamName}</span>
                      )}
                    </div>
                  </td>
                  <td className={`text-center py-3 px-2 ${compact ? 'hidden' : ''}`}>{team.played}</td>
                  <td className={`text-center py-3 px-2 ${compact ? 'hidden' : 'hidden sm:table-cell'}`}>{team.won}</td>
                  <td className={`text-center py-3 px-2 ${compact ? 'hidden' : 'hidden sm:table-cell'}`}>{team.drawn}</td>
                  <td className={`text-center py-3 px-2 ${compact ? 'hidden' : 'hidden sm:table-cell'}`}>{team.lost}</td>
                  <td className={`text-center py-3 px-2 ${compact ? 'hidden' : 'hidden md:table-cell'}`}>{team.goalsFor}</td>
                  <td className={`text-center py-3 px-2 ${compact ? 'hidden' : 'hidden md:table-cell'}`}>{team.goalsAgainst}</td>
                  <td className="text-center py-3 px-2">
                    <span className={team.goalDifference > 0 ? 'text-green-600 dark:text-green-400' : team.goalDifference < 0 ? 'text-red-600 dark:text-red-400' : ''}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className="font-bold text-base">{team.points}</span>
                  </td>
                  <td className={`text-center py-3 px-2 ${compact ? 'hidden' : 'hidden lg:table-cell'}`}>
                    <div className="flex gap-1 justify-center">
                      {team.form.map((result, idx) => (
                        <React.Fragment key={idx}>
                          {getFormBadge(result as 'W' | 'L' | 'D')}
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>UEFA Champions League</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span>UEFA Europa League</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>Relegation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeagueStandings;
