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
 * Component that displays upcoming and latest fixtures with tabs
 * Shows next 5 upcoming fixtures and last 5 results
 */
const MatchdaySection: React.FC<MatchdaySectionProps> = ({ fixtures, competitionName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const { upcomingFixtures, latestResults } = useMemo(() => {
    const now = new Date();

    // Get ALL upcoming fixtures
    const upcomingList = fixtures
      .filter(f => new Date(f.kickoff_utc) >= now)
      .sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());

    // Get ALL completed fixtures
    const pastList = fixtures
      .filter(f => new Date(f.kickoff_utc) < now)
      .sort((a, b) => new Date(b.kickoff_utc).getTime() - new Date(a.kickoff_utc).getTime());

    // Get the current matchday from the first upcoming fixture
    const currentMatchday = upcomingList[0]?.matchweek;

    // If we have matchday data, filter by it. Otherwise show all (up to reasonable limit)
    let upcoming: SimpleFixture[];
    let past: SimpleFixture[];

    if (currentMatchday) {
      // Filter to show ALL fixtures from the current matchday
      upcoming = upcomingList.filter(f => f.matchweek === currentMatchday);
      past = pastList.filter(f => f.matchweek === currentMatchday);
    } else {
      // No matchday data - show all fixtures (limited to prevent page overload)
      upcoming = upcomingList.slice(0, 50);
      past = pastList.slice(0, 50);
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

  const tabButtonStyle = (isActive: boolean) => ({
    flex: 1,
    padding: '12px 24px',
    backgroundColor: isActive ? '#6366f1' : '#f3f4f6',
    color: isActive ? 'white' : '#6b7280',
    border: 'none',
    cursor: 'pointer',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  });

  return (
    <Card>
      <CardHeader style={{ paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={tabButtonStyle(activeTab === 'upcoming')}
          >
            Upcoming Fixtures ({upcomingFixtures.length})
          </button>
          <button
            onClick={() => setActiveTab('latest')}
            style={tabButtonStyle(activeTab === 'latest')}
          >
            Latest Results ({latestResults.length})
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Flex direction="column" gap="sm">
          {activeTab === 'upcoming' && upcomingFixtures.map((fixture) => (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              variant="compact"
              showMatchweek={true}
            />
          ))}
          {activeTab === 'latest' && latestResults.map((fixture) => (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              variant="compact"
              showMatchweek={true}
            />
          ))}
        </Flex>
      </CardContent>
    </Card>
  );
};

export default MatchdaySection;
