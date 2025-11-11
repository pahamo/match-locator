import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Team } from '../types';
import { getTeams } from '../services/supabase';
import { formatTeamNameShort, getPopularTeamSlugs } from '../utils/seo';

/**
 * PopularTeamsGrid Component
 * Displays a grid of popular Premier League teams with large visual tiles
 * Used on homepage for team discovery
 */
export const PopularTeamsGrid: React.FC = () => {
  const [popularTeams, setPopularTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularTeams = async () => {
      setLoading(true);

      try {
        const popularSlugs = getPopularTeamSlugs();
        const allTeams = await getTeams();

        // Filter to popular teams and maintain the order from getPopularTeamSlugs
        const teamsMap = new Map(allTeams.map(t => [t.slug, t]));
        const orderedTeams = popularSlugs
          .map(slug => teamsMap.get(slug))
          .filter((t): t is Team => t !== undefined);

        setPopularTeams(orderedTeams);
      } catch (error) {
        console.error('Error fetching popular teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTeams();
  }, []);

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Popular Teams
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 animate-pulse"
              style={{ minHeight: '180px' }}
            >
              <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full mb-3" />
              <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (popularTeams.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Popular Teams
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {popularTeams.map((team) => (
          <Link
            key={team.id}
            to={`/clubs/${team.slug}`}
            className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800"
            style={{ minHeight: '180px' }}
          >
            {team.crest ? (
              <img
                src={team.crest}
                alt={`${team.name} crest`}
                className="w-24 h-24 object-contain mb-3 group-hover:scale-110 transition-transform duration-200"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center mb-3 text-4xl">
                ⚽
              </div>
            )}
            <span className="text-base font-semibold text-center text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {formatTeamNameShort(team.name)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
