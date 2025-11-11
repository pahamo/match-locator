import React from 'react';
import { Link } from 'react-router-dom';
import { COMPETITION_CONFIGS, CompetitionConfig } from '../config/competitions';

/**
 * PopularCompetitionsGrid Component
 * Displays a grid of major football competitions with large visual tiles
 * Used on homepage for competition discovery
 */
export const PopularCompetitionsGrid: React.FC = () => {
  // Define the popular competitions to display (in order)
  const popularCompetitionSlugs = [
    'premier-league',
    'champions-league',
    'europa-league',
    'la-liga',
    'bundesliga',
    'serie-a',
    'carabao-cup',
    'ligue-1'
  ];

  // Get competition configs in the specified order
  const popularCompetitions: CompetitionConfig[] = popularCompetitionSlugs
    .map(slug => COMPETITION_CONFIGS[slug])
    .filter((config): config is CompetitionConfig => config !== undefined);

  if (popularCompetitions.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Popular Competitions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {popularCompetitions.map((competition) => (
          <Link
            key={competition.slug}
            to={`/competitions/${competition.slug}`}
            className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800"
            style={{ minHeight: '160px' }}
          >
            {competition.logo ? (
              <img
                src={competition.logo}
                alt={`${competition.name} logo`}
                className="w-20 h-20 object-contain mb-3 group-hover:scale-110 transition-transform duration-200"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center mb-3 text-4xl">
                {competition.icon}
              </div>
            )}
            <span className="text-sm font-semibold text-center text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {competition.shortName}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
