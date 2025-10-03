import React, { useMemo, useState } from 'react';
import type { SimpleFixture } from '../types';
import FixtureCard from '../design-system/components/FixtureCard';
import { Card, CardHeader, CardContent, CardTitle } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';

interface MatchdaySectionProps {
  fixtures: SimpleFixture[];
  competitionName: string;
}

type TabType = 'upcoming' | 'latest';

/**
 * Component that displays upcoming and latest fixtures with tabs
 * Shows all fixtures from current matchday or date grouping
 */
const MatchdaySection: React.FC<MatchdaySectionProps> = ({ fixtures, competitionName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Helper function to format date range for the title
  const formatDateRange = (fixtures: SimpleFixture[]) => {
    if (fixtures.length === 0) return '';

    const dates = fixtures.map(f => new Date(f.kickoff_utc));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    // If all fixtures are on the same day
    if (minDate.toDateString() === maxDate.toDateString()) {
      return formatDate(minDate);
    }

    // If fixtures span multiple days
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

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

  // Generate title based on active tab
  const getTitle = () => {
    if (activeTab === 'upcoming' && upcomingFixtures.length > 0) {
      const matchweek = upcomingFixtures[0]?.matchweek;
      const dateRange = formatDateRange(upcomingFixtures);

      if (matchweek) {
        return `${competitionName} Matchday ${matchweek} Fixtures${dateRange ? ` - ${dateRange}` : ''}`;
      }
      return `Upcoming ${competitionName} Matches${dateRange ? ` - ${dateRange}` : ''}`;
    }

    if (activeTab === 'latest' && latestResults.length > 0) {
      const matchweek = latestResults[0]?.matchweek;
      const dateRange = formatDateRange(latestResults);

      if (matchweek) {
        return `${competitionName} Matchday ${matchweek} Results${dateRange ? ` - ${dateRange}` : ''}`;
      }
      return `Latest ${competitionName} Results${dateRange ? ` - ${dateRange}` : ''}`;
    }

    return `${competitionName} Fixtures`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={tabButtonStyle(activeTab === 'upcoming')}
          >
            Upcoming ({upcomingFixtures.length})
          </button>
          <button
            onClick={() => setActiveTab('latest')}
            style={tabButtonStyle(activeTab === 'latest')}
          >
            Results ({latestResults.length})
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Flex direction="column" gap="sm">
          {activeTab === 'upcoming' && upcomingFixtures.map((fixture) => (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              variant="withTimeNoCompetition"
              showMatchweek={true}
            />
          ))}
          {activeTab === 'latest' && latestResults.map((fixture) => (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              variant="withTimeNoCompetition"
              showMatchweek={true}
              hideBroadcaster={true}
            />
          ))}
        </Flex>
      </CardContent>
    </Card>
  );
};

export default MatchdaySection;
