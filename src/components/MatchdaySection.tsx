import React, { useMemo, useState } from 'react';
import type { SimpleFixture } from '../types';
import FixtureCard from '../design-system/components/FixtureCard';
import { Card, CardHeader, CardContent, CardTitle } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import { getMatchweek } from '../utils/fixtures';
import { getMatchStatus } from '../utils/matchStatus';

interface MatchdaySectionProps {
  fixtures: SimpleFixture[];
  competitionName: string;
}

type TabType = 'upcoming' | 'latest';

/**
 * Group fixtures by date for compact display
 */
const groupFixturesByDate = (fixtures: SimpleFixture[]) => {
  const groups = new Map<string, { label: string; fixtures: SimpleFixture[] }>();

  fixtures.forEach(fixture => {
    const date = new Date(fixture.kickoff_utc);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    const resetTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dateOnly = resetTime(date);
    const todayOnly = resetTime(today);
    const tomorrowOnly = resetTime(tomorrow);

    let dateKey: string;
    let dateLabel: string;

    if (dateOnly.getTime() === todayOnly.getTime()) {
      dateKey = 'today';
      dateLabel = 'Today';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      dateKey = 'tomorrow';
      dateLabel = 'Tomorrow';
    } else {
      dateKey = dateOnly.toISOString();
      // For other dates, show day name and date (e.g., "Wednesday, 23 Oct")
      dateLabel = date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      });
    }

    if (!groups.has(dateKey)) {
      groups.set(dateKey, { label: dateLabel, fixtures: [] });
    }
    groups.get(dateKey)!.fixtures.push(fixture);
  });

  // Sort fixtures within each group by time
  groups.forEach(group => {
    group.fixtures.sort((a, b) =>
      new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
    );
  });

  return Array.from(groups.values());
};

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

  const { liveFixtures, upcomingFixtures, latestResults } = useMemo(() => {
    // Classify fixtures by match status
    const liveList: SimpleFixture[] = [];
    const upcomingList: SimpleFixture[] = [];
    const finishedList: SimpleFixture[] = [];

    fixtures.forEach(f => {
      const status = getMatchStatus(f.kickoff_utc);
      if (status.status === 'live') {
        liveList.push(f);
      } else if (status.status === 'finished') {
        finishedList.push(f);
      } else {
        // 'upcoming' or 'upNext'
        upcomingList.push(f);
      }
    });

    // Sort each list
    liveList.sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());
    upcomingList.sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());
    finishedList.sort((a, b) => new Date(b.kickoff_utc).getTime() - new Date(a.kickoff_utc).getTime());

    // Get the current matchday from live or upcoming fixtures
    const currentMatchday = (liveList[0] ? getMatchweek(liveList[0]) : null)
                         || (upcomingList[0] ? getMatchweek(upcomingList[0]) : null);

    let live: SimpleFixture[];
    let upcoming: SimpleFixture[];
    let finished: SimpleFixture[];

    if (currentMatchday !== null) {
      // Show fixtures from ONLY the current matchweek (not multiple)
      live = liveList.filter(f => getMatchweek(f) === currentMatchday);
      upcoming = upcomingList.filter(f => getMatchweek(f) === currentMatchday);

      // For results, show the most recent completed matchweek
      const latestCompletedMatchweek = finishedList[0] ? getMatchweek(finishedList[0]) : null;

      if (latestCompletedMatchweek !== null) {
        // Show all fixtures from that matchweek
        finished = finishedList.filter(f => getMatchweek(f) === latestCompletedMatchweek);
      } else {
        finished = [];
      }
    } else {
      // No matchday data - show all live, next 15 upcoming, last 15 finished
      live = liveList;
      upcoming = upcomingList.slice(0, 15);
      finished = finishedList.slice(0, 15);
    }

    return {
      liveFixtures: live,
      upcomingFixtures: upcoming,
      latestResults: finished
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
    const totalLiveAndUpcoming = liveFixtures.length + upcomingFixtures.length;

    if (activeTab === 'upcoming' && totalLiveAndUpcoming > 0) {
      // Use matchweek from live or upcoming fixtures
      const firstFixture = liveFixtures[0] || upcomingFixtures[0];
      const matchweek = getMatchweek(firstFixture);
      const dateRange = formatDateRange([...liveFixtures, ...upcomingFixtures]);

      if (matchweek !== null) {
        return {
          title: `Matchday ${matchweek} Fixtures`,
          metadata: dateRange,
          description: liveFixtures.length > 0
            ? `${liveFixtures.length} live ${liveFixtures.length === 1 ? 'match' : 'matches'} and ${upcomingFixtures.length} upcoming ${competitionName} ${upcomingFixtures.length === 1 ? 'fixture' : 'fixtures'} for Matchday ${matchweek}. Check kick-off times, TV broadcast channels, and where to watch every match live in the UK.`
            : `View ${upcomingFixtures.length} upcoming ${competitionName} fixtures for Matchday ${matchweek}. Check kick-off times, TV broadcast channels, and where to watch every match live in the UK.`
        };
      }
      return {
        title: liveFixtures.length > 0 ? `Live & Upcoming Matches` : `Upcoming Matches`,
        metadata: dateRange,
        description: liveFixtures.length > 0
          ? `${liveFixtures.length} live ${liveFixtures.length === 1 ? 'match' : 'matches'} and ${upcomingFixtures.length} upcoming ${competitionName} ${upcomingFixtures.length === 1 ? 'fixture' : 'fixtures'}. Check kick-off times, TV broadcast channels, and where to watch every match live in the UK.`
          : `View ${upcomingFixtures.length} upcoming ${competitionName} fixtures. Check kick-off times, TV broadcast channels, and where to watch every match live in the UK.`
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
            {liveFixtures.length > 0 ? 'Live & Upcoming' : 'Upcoming'} ({liveFixtures.length + upcomingFixtures.length})
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
        {activeTab === 'upcoming' && (
          <div>
            {/* Live matches section */}
            {liveFixtures.length > 0 && (
              <>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#ef4444',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🔴 LIVE NOW ({liveFixtures.length})
                </div>

                {/* Group live fixtures by date */}
                {groupFixturesByDate(liveFixtures).map((group, groupIndex) => (
                  <div key={groupIndex} style={{ marginBottom: '1.5rem' }}>
                    {/* Date header */}
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem',
                      paddingLeft: '4px'
                    }}>
                      {group.label}
                    </div>

                    {/* Fixtures for this date */}
                    <Flex direction="column" gap="sm">
                      {group.fixtures.map((fixture) => (
                        <FixtureCard
                          key={fixture.id}
                          fixture={fixture}
                          variant="withTimeNoCompetition"
                          showMatchweek={false}
                          hideDayLabel={true}
                        />
                      ))}
                    </Flex>
                  </div>
                ))}

                {/* Divider between live and upcoming */}
                {upcomingFixtures.length > 0 && (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    margin: '1.5rem 0',
                    paddingTop: '1rem'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.75rem'
                    }}>
                      Upcoming ({upcomingFixtures.length})
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Upcoming matches grouped by date */}
            {upcomingFixtures.length > 0 && groupFixturesByDate(upcomingFixtures).map((group, groupIndex) => (
              <div key={groupIndex} style={{ marginBottom: '1.5rem' }}>
                {/* Date header */}
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem',
                  paddingLeft: '4px'
                }}>
                  {group.label}
                </div>

                {/* Fixtures for this date */}
                <Flex direction="column" gap="sm">
                  {group.fixtures.map((fixture) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      variant="withTimeNoCompetition"
                      showMatchweek={false}
                      hideDayLabel={true}
                    />
                  ))}
                </Flex>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'latest' && (
          <div>
            {/* Results grouped by date */}
            {groupFixturesByDate(latestResults).map((group, groupIndex) => (
              <div key={groupIndex} style={{ marginBottom: '1.5rem' }}>
                {/* Date header */}
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem',
                  paddingLeft: '4px'
                }}>
                  {group.label}
                </div>

                {/* Fixtures for this date */}
                <Flex direction="column" gap="sm">
                  {group.fixtures.map((fixture) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      variant="withTimeNoCompetition"
                      showMatchweek={false}
                      hideBroadcaster={true}
                      hideDayLabel={true}
                    />
                  ))}
                </Flex>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchdaySection;
