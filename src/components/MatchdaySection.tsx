import React, { useMemo, useState } from 'react';
import type { SimpleFixture } from '../types';
import FixtureCard from '../design-system/components/FixtureCard';
import { Card, CardHeader, CardContent, CardTitle } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import { getMatchweek } from '../utils/fixtures';

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
    const currentMatchday = upcomingList[0] ? getMatchweek(upcomingList[0]) : null;

    let upcoming: SimpleFixture[];
    let past: SimpleFixture[];

    if (currentMatchday !== null) {
      // Show fixtures from ONLY the current matchweek (not multiple)
      upcoming = upcomingList.filter(f => getMatchweek(f) === currentMatchday);

      // For results, show the most recent completed matchweek
      // Find the most recent matchweek that has at least 1 completed game
      const latestCompletedMatchweek = pastList[0] ? getMatchweek(pastList[0]) : null;

      if (latestCompletedMatchweek !== null) {
        // Show all fixtures from that matchweek
        past = pastList.filter(f => getMatchweek(f) === latestCompletedMatchweek);
      } else {
        past = [];
      }
    } else {
      // No matchday data - show next 15 upcoming and last 15 past
      upcoming = upcomingList.slice(0, 15);
      past = pastList.slice(0, 15);
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
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: isActive ? '#1f2937' : '#9ca3af',
    border: 'none',
    borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
    cursor: 'pointer',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  });

  // Generate title, metadata, and description based on active tab
  const getTitleData = () => {
    if (activeTab === 'upcoming' && upcomingFixtures.length > 0) {
      const matchweek = getMatchweek(upcomingFixtures[0]);
      const dateRange = formatDateRange(upcomingFixtures);

      if (matchweek !== null) {
        return {
          title: `Matchday ${matchweek} Fixtures`,
          metadata: dateRange,
          description: `View ${upcomingFixtures.length} upcoming ${competitionName} fixtures for Matchday ${matchweek}. Check kick-off times, TV broadcast channels, and where to watch every match live in the UK.`
        };
      }
      return {
        title: `Upcoming Matches`,
        metadata: dateRange,
        description: `View ${upcomingFixtures.length} upcoming ${competitionName} fixtures. Check kick-off times, TV broadcast channels, and where to watch every match live in the UK.`
      };
    }

    if (activeTab === 'latest' && latestResults.length > 0) {
      const matchweek = latestResults[0] ? getMatchweek(latestResults[0]) : null;
      const dateRange = formatDateRange(latestResults);

      if (matchweek !== null) {
        return {
          title: `Matchday ${matchweek} Results`,
          metadata: dateRange,
          description: `View all ${latestResults.length} completed ${competitionName} fixtures for Matchday ${matchweek}. See final scores and match results from the latest round of matches.`
        };
      }
      return {
        title: `Latest Results`,
        metadata: dateRange,
        description: `View ${latestResults.length} recent ${competitionName} results. See final scores and match outcomes from the latest matches.`
      };
    }

    return {
      title: `Fixtures & Results`,
      metadata: null,
      description: `View upcoming fixtures and recent results for ${competitionName}.`
    };
  };

  const titleData = getTitleData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titleData.title}</CardTitle>

        {/* Date metadata */}
        {titleData.metadata && (
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginTop: '0.25rem',
            fontWeight: '500'
          }}>
            {titleData.metadata}
          </div>
        )}

        {/* SEO description */}
        <p style={{
          fontSize: '0.875rem',
          color: '#4b5563',
          lineHeight: '1.5',
          marginTop: '0.75rem',
          marginBottom: '0'
        }}>
          {titleData.description}
        </p>

        {/* Tab buttons */}
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
              showMatchweek={false}
            />
          ))}
          {activeTab === 'latest' && latestResults.map((fixture) => (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              variant="withTimeNoCompetition"
              showMatchweek={false}
              hideBroadcaster={true}
            />
          ))}
        </Flex>
      </CardContent>
    </Card>
  );
};

export default MatchdaySection;
