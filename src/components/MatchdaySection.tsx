import React, { useMemo, useState } from 'react';
import type { SimpleFixture } from '../types';
import FixtureCard from '../design-system/components/FixtureCard';
import { Card, CardHeader, CardContent } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';

interface MatchdaySectionProps {
  fixtures: SimpleFixture[];
  competitionName: string;
}

type TabType = 'upcoming' | 'latest';

/**
 * Component that displays upcoming and latest fixtures side-by-side
 * Shows all fixtures from current matchday or date grouping
 */
const MatchdaySection: React.FC<MatchdaySectionProps> = ({ fixtures, competitionName }) => {

  const { upcomingFixtures, latestResults } = useMemo(() => {
    const now = new Date();

    // Get ALL upcoming fixtures sorted by date
    const upcomingList = fixtures
      .filter(f => new Date(f.kickoff_utc) >= now)
      .sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());

    // Get ALL completed fixtures sorted by date (most recent first)
    const pastList = fixtures
      .filter(f => new Date(f.kickoff_utc) < now)
      .sort((a, b) => new Date(b.kickoff_utc).getTime() - new Date(a.kickoff_utc).getTime());

    // Get the current matchday from the first upcoming fixture
    const currentMatchday = upcomingList[0]?.matchweek;

    let upcoming: SimpleFixture[];
    let past: SimpleFixture[];

    if (currentMatchday) {
      // If we have matchday data, show ALL fixtures from that matchday
      upcoming = upcomingList.filter(f => f.matchweek === currentMatchday);
      past = pastList.filter(f => f.matchweek === currentMatchday);
    } else {
      // No matchday data - group by date instead
      // Get the date of the next upcoming fixture
      const nextFixtureDate = upcomingList[0] ? new Date(upcomingList[0].kickoff_utc).toDateString() : null;

      // Get the date of the most recent completed fixture
      const lastFixtureDate = pastList[0] ? new Date(pastList[0].kickoff_utc).toDateString() : null;

      // Filter to show only fixtures from those specific dates
      upcoming = nextFixtureDate
        ? upcomingList.filter(f => new Date(f.kickoff_utc).toDateString() === nextFixtureDate)
        : [];

      past = lastFixtureDate
        ? pastList.filter(f => new Date(f.kickoff_utc).toDateString() === lastFixtureDate)
        : [];
    }

    return {
      upcomingFixtures: upcoming,
      latestResults: past
    };
  }, [fixtures]);

  // Don't show if there are no fixtures at all
  if (fixtures.length === 0) {
    return null;
  }

  return (
    <div className="matchday-section-grid">
      {/* Upcoming Fixtures Column */}
      <Card>
        <CardHeader>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            Upcoming Fixtures ({upcomingFixtures.length})
          </h2>
        </CardHeader>
        <CardContent>
          <Flex direction="column" gap="sm">
            {upcomingFixtures.map((fixture) => (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                variant="withTime"
                showMatchweek={true}
              />
            ))}
          </Flex>
        </CardContent>
      </Card>

      {/* Latest Results Column */}
      <Card>
        <CardHeader>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            Latest Results ({latestResults.length})
          </h2>
        </CardHeader>
        <CardContent>
          <Flex direction="column" gap="sm">
            {latestResults.map((fixture) => (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                variant="withTime"
                showMatchweek={true}
                hideBroadcaster={true}
              />
            ))}
          </Flex>
        </CardContent>
      </Card>
    </div>
  );
};

// Inject responsive styles
if (typeof document !== 'undefined' && !document.getElementById('matchday-section-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'matchday-section-styles';
  styleSheet.textContent = `
    .matchday-section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .matchday-section-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default MatchdaySection;
