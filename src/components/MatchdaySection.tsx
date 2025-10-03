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

    // Get ALL upcoming fixtures from current matchday
    const upcomingList = fixtures
      .filter(f => new Date(f.kickoff_utc) >= now)
      .sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());

    // Get the current matchday from the first upcoming fixture
    const currentMatchday = upcomingList[0]?.matchweek;

    // Filter to show only fixtures from the current matchday
    const upcoming = currentMatchday
      ? upcomingList.filter(f => f.matchweek === currentMatchday)
      : upcomingList.slice(0, 10); // Fallback to first 10 if no matchday data

    // Get ALL completed fixtures from current matchday
    const pastList = fixtures
      .filter(f => new Date(f.kickoff_utc) < now)
      .sort((a, b) => new Date(b.kickoff_utc).getTime() - new Date(a.kickoff_utc).getTime());

    // Filter to show only completed fixtures from the current matchday
    const past = currentMatchday
      ? pastList.filter(f => f.matchweek === currentMatchday)
      : pastList.slice(0, 10); // Fallback to last 10 if no matchday data

    return {
      upcomingFixtures: upcoming,
      latestResults: past
    };
  }, [fixtures]);

  if (upcomingFixtures.length === 0 && latestResults.length === 0) {
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
