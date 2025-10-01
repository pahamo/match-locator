import React, { useEffect, useState } from 'react';
import { Fixture } from '../types';
import { getFixturesForDay } from '../services/supabase';
import { formatTeamNameShort } from '../utils/seo';
import { generateH2HUrl } from '../utils/headToHead';
import { Link } from 'react-router-dom';

interface LiveMatchesTickerProps {
  currentMatchDate: string; // ISO date string
  competitionIds?: number[];
}

export const LiveMatchesTicker: React.FC<LiveMatchesTickerProps> = ({
  currentMatchDate,
  competitionIds
}) => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const matches = await getFixturesForDay(currentMatchDate, competitionIds);
      setFixtures(matches);
      setLoading(false);
    };

    fetchMatches();
  }, [currentMatchDate, competitionIds]);

  if (loading || fixtures.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 py-3 mb-6 rounded-lg shadow-lg">
      <div className="relative flex overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...fixtures, ...fixtures].map((fixture, idx) => (
            <Link
              key={`${fixture.id}-${idx}`}
              to={generateH2HUrl(fixture.home.slug, fixture.away.slug)}
              className="inline-flex items-center px-6 hover:bg-white/10 transition-colors"
            >
              <span className="text-white font-semibold mr-2">
                {formatTeamNameShort(fixture.home.name)}
              </span>
              <span className="text-blue-200 mx-2">vs</span>
              <span className="text-white font-semibold">
                {formatTeamNameShort(fixture.away.name)}
              </span>
              <span className="text-blue-300 ml-3 text-sm">
                {new Date(fixture.kickoff_utc).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </span>
              {fixture.providers_uk?.[0] && (
                <span className="ml-3 text-xs bg-white/20 px-2 py-1 rounded text-white">
                  {fixture.providers_uk[0].name}
                </span>
              )}
              <span className="mx-6 text-blue-300">•</span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
