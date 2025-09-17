import React, { useState, useEffect } from 'react';
import { getSimpleFixtures } from '../services/supabase-simple';
import type { SimpleFixture } from '../types';
import Header from '../components/Header';
import StructuredData from '../components/StructuredData';
import { FixtureCardSkeleton } from '../components/SkeletonLoader';
import DayGroupCard from '../components/DayGroupCard';
import { FixtureCard } from '../design-system';
import { generateHomeMeta, updateDocumentMeta } from '../utils/seo';
import { getMatchStatus } from '../utils/matchStatus';
import { formatDateOnly } from '../utils/dateFormat';
import { COMPETITION_CONFIGS } from '../config/competitions';

interface MatchWeek {
  matchweek: number;
  fixtures: SimpleFixture[];
  dateRange: string;
  hasToday: boolean;
  isUpcoming: boolean;
}

// Helper to get competition info from competition_id
const getCompetitionInfo = (competitionId?: number) => {
  if (!competitionId) return null;

  // Find competition by ID
  const competition = Object.values(COMPETITION_CONFIGS).find(c => c.id === competitionId);
  return competition || null;
};

// Competition pill component
const CompetitionPill: React.FC<{ competitionId?: number }> = ({ competitionId }) => {
  const competition = getCompetitionInfo(competitionId);

  if (!competition) return null;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      background: competition.colors.primary,
      color: competition.colors.secondary,
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      marginRight: '8px'
    }}>
      {competition.logo ? (
        <img
          src={competition.logo}
          alt={competition.name}
          style={{
            width: '14px',
            height: '14px',
            objectFit: 'contain',
            filter: competition.colors.secondary === '#ffffff' ? 'brightness(0) invert(1)' : 'none'
          }}
        />
      ) : (
        <span>{competition.icon}</span>
      )}
      <span>{competition.shortName}</span>
    </div>
  );
};



// Helper to group fixtures by date, then by time within each date for day card display
const groupFixturesByDate = (fixtures: SimpleFixture[]) => {
  const dateGroups: Record<string, Record<string, SimpleFixture[]>> = {};
  
  fixtures.forEach(fixture => {
    const date = new Date(fixture.kickoff_utc);
    const dateKey = formatDateOnly(fixture.kickoff_utc);
    const timeKey = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    if (!dateGroups[dateKey]) {
      dateGroups[dateKey] = {};
    }
    if (!dateGroups[dateKey][timeKey]) {
      dateGroups[dateKey][timeKey] = [];
    }
    dateGroups[dateKey][timeKey].push(fixture);
  });
  
  // Convert to array format for rendering
  return Object.entries(dateGroups).map(([date, timeGroups]) => {
    const timeSlots = Object.entries(timeGroups).map(([time, fixtures]) => ({
      time,
      fixtures
    })).sort((a, b) => {
      const aTime = new Date(`1970-01-01 ${a.time}`);
      const bTime = new Date(`1970-01-01 ${b.time}`);
      return aTime.getTime() - bTime.getTime();
    });

    return {
      date,
      timeSlots,
      // For sticky header - use most common time or first time
      commonTime: timeSlots.length === 1 ? timeSlots[0].time : 'Multiple times'
    };
  }).sort((a, b) => {
    const aDate = new Date(a.timeSlots[0].fixtures[0].kickoff_utc);
    const bDate = new Date(b.timeSlots[0].fixtures[0].kickoff_utc);
    return aDate.getTime() - bDate.getTime();
  });
};

const HomePage: React.FC = () => {
  const [matchWeek, setMatchWeek] = useState<MatchWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed selectedCompetitionId - now showing all competitions

    
  // Prepare data for hooks - call hooks unconditionally
  const dayGroups = matchWeek ? groupFixturesByDate(matchWeek.fixtures) : [];


  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load competitions
        // Competitions data no longer needed in state

        // Load fixtures from all competitions (no competition filter)
        const fixturesData = await getSimpleFixtures();
        const currentMatchWeek = getCurrentOrUpcomingMatchWeek(fixturesData);
        if (!isCancelled) {
          setMatchWeek(currentMatchWeek);
          // Update SEO meta tags for homepage
          const meta = generateHomeMeta();
          updateDocumentMeta(meta);
        }
        // Blackout IDs no longer needed in state
      } catch (err) {
        console.error('Failed to load fixtures:', err);
        if (!isCancelled) setError('Failed to load fixtures. Please try again later.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();
    return () => { isCancelled = true; };
  }, []); // No dependencies since we're loading all competitions

  const loadMatchWeek = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fixturesData = await getSimpleFixtures();
      const currentMatchWeek = getCurrentOrUpcomingMatchWeek(fixturesData);
      setMatchWeek(currentMatchWeek);

      // Load blackout flags from localStorage
      // Blackout IDs no longer needed in state
    } catch (err) {
      console.error('Failed to load fixtures:', err);
      setError('Failed to load fixtures. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentOrUpcomingMatchWeek = (fixtures: SimpleFixture[]): MatchWeek | null => {
    if (!fixtures.length) return null;

    const now = new Date();
    
    // Group fixtures by matchweek or create a single group for competitions without matchweeks
    const fixturesByMatchweek = new Map<number, SimpleFixture[]>();
    
    fixtures.forEach(fixture => {
      // Use matchweek for Premier League, or use 1 as default for Champions League (no matchweeks)
      const groupKey = fixture.matchweek || 1;
      if (!fixturesByMatchweek.has(groupKey)) {
        fixturesByMatchweek.set(groupKey, []);
      }
      fixturesByMatchweek.get(groupKey)!.push(fixture);
    });

    // Find current or upcoming matchweek
    const sortedMatchweeks = Array.from(fixturesByMatchweek.keys()).sort((a, b) => a - b);
    
    // First check if there's a matchweek with games that are live, upcoming, or today
    for (const matchweek of sortedMatchweeks) {
      const matchweekFixtures = fixturesByMatchweek.get(matchweek)!;
      const relevantFixtures = matchweekFixtures.filter(f => {
        const status = getMatchStatus(f.kickoff_utc);
        return status.status === 'live' || status.status === 'upNext' || new Date(f.kickoff_utc) >= now;
      });

      if (relevantFixtures.length > 0) {
        // Sort fixtures by kickoff time - live games first, then by kickoff time
        const sortedFixtures = relevantFixtures.sort((a, b) => {
          const statusA = getMatchStatus(a.kickoff_utc);
          const statusB = getMatchStatus(b.kickoff_utc);

          // Live games always come first
          if (statusA.status === 'live' && statusB.status !== 'live') return -1;
          if (statusB.status === 'live' && statusA.status !== 'live') return 1;

          // Then sort by kickoff time
          return new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime();
        });
        
        // Calculate date range
        const firstDate = new Date(sortedFixtures[0].kickoff_utc);
        const lastDate = new Date(sortedFixtures[sortedFixtures.length - 1].kickoff_utc);
        
        const dateRange = firstDate.toDateString() === lastDate.toDateString()
          ? formatDateOnly(sortedFixtures[0].kickoff_utc)
          : `${formatDateOnly(sortedFixtures[0].kickoff_utc)} - ${formatDateOnly(sortedFixtures[sortedFixtures.length - 1].kickoff_utc)}`;
        
        // Check if any fixtures are today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const hasToday = sortedFixtures.some(f => {
          const fixtureDate = new Date(f.kickoff_utc);
          fixtureDate.setHours(0, 0, 0, 0);
          return fixtureDate.getTime() === today.getTime();
        });
        
        return {
          matchweek,
          fixtures: sortedFixtures,
          dateRange,
          hasToday,
          isUpcoming: true
        };
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>
              Football TV Schedule (UK)
            </h1>
            <FixtureCardSkeleton />
            <FixtureCardSkeleton />
            <FixtureCardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
            <button onClick={loadMatchWeek}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  if (!matchWeek) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="no-fixtures">
              <p>No upcoming matches found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <StructuredData type="website" />
      <StructuredData type="organization" />

      {/* Live game animations */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% {
            border-color: #ef4444;
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            border-color: #dc2626;
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            background: #ef4444;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
          }
          50% {
            background: #dc2626;
            box-shadow: 0 0 25px rgba(239, 68, 68, 0.9);
          }
        }
      `}</style>

      <Header />
      
      <main>
        <div className="wrap" style={{ position: 'relative' }}>
          <h1 style={{ marginTop: '32px', marginBottom: '32px' }}>Football TV Schedule</h1>


          {/* Day Cards */}
          <div className="fixtures-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {dayGroups.map((dayGroup, dayIndex) => {
              // Find the earliest upcoming fixture in this day to show single UP NEXT badge
              const allDayFixtures = dayGroup.timeSlots.flatMap(slot => slot.fixtures);
              const upNextFixtures = allDayFixtures.filter(fixture => {
                const status = getMatchStatus(fixture.kickoff_utc);
                return status.status === 'upNext';
              });

              // Find the earliest UP NEXT fixture for this day
              const earliestUpNext = upNextFixtures.length > 0
                ? upNextFixtures.reduce((earliest, current) =>
                    new Date(current.kickoff_utc) < new Date(earliest.kickoff_utc) ? current : earliest
                  )
                : null;

              const upNextStatus = earliestUpNext ? getMatchStatus(earliestUpNext.kickoff_utc) : null;
              const upNextTimeSlotIndex = earliestUpNext
                ? dayGroup.timeSlots.findIndex(slot => slot.fixtures.includes(earliestUpNext))
                : -1;

              // Get unique competitions for this day
              const dayCompetitions = Array.from(
                new Set(allDayFixtures.map(f => f.competition_id).filter(Boolean))
              ).sort();

              return (
                <div key={dayIndex}>
                  {/* Competition pills for this day */}
                  {dayCompetitions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {dayCompetitions.map(competitionId => (
                        <CompetitionPill key={competitionId} competitionId={competitionId} />
                      ))}
                    </div>
                  )}

                  <DayGroupCard
                    id={`group-${dayIndex}`}
                    date={dayGroup.date}
                    matchweek={`Matchweek ${matchWeek?.matchweek || 1}`}
                    kickoffTime={dayGroup.commonTime}
                  >
                  {/* Time slots within the day */}
                  {dayGroup.timeSlots.map((timeSlot, timeIndex) => {
                    // Only show UP NEXT badge on the earliest time slot with UP NEXT fixture
                    const shouldShowUpNext = timeIndex === upNextTimeSlotIndex;

                    return (
                      <div key={timeIndex}>
                        {/* Show time header if multiple time slots in a day OR if we need to show UP NEXT pill */}
                        {(dayGroup.timeSlots.length > 1 || shouldShowUpNext) && (
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            margin: '8px 0 6px 0',
                            padding: '4px 8px',
                            background: '#f9fafb',
                            borderRadius: '4px',
                            width: 'fit-content',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{timeSlot.time}</span>
                            {/* UP NEXT pill - shown only once per day on earliest fixture */}
                            {shouldShowUpNext && upNextStatus && (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '2px 6px',
                                borderRadius: '12px',
                                background: '#3b82f6',
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em'
                              }}>
                                ⏰ UP NEXT {upNextStatus.timeUntil ? `IN ${upNextStatus.timeUntil}` : ''}
                              </span>
                            )}
                          </div>
                        )}

                      {/* Compact Match Cards with grouped styling */}
                      {(() => {
                        // Check if any fixtures in this time slot are live
                        const liveFixtures = timeSlot.fixtures.filter(fixture => {
                          const status = getMatchStatus(fixture.kickoff_utc);
                          return status.status === 'live';
                        });

                        const hasLiveGames = liveFixtures.length > 0;

                        // If there are live games, wrap them in a special container
                        if (hasLiveGames) {
                          return (
                            <div style={{
                              border: '3px solid #ef4444',
                              borderRadius: '12px',
                              padding: '8px',
                              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
                              boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                              animation: 'pulse-border 2s ease-in-out infinite',
                              position: 'relative'
                            }}>
                              {/* LIVE indicator */}
                              <div style={{
                                position: 'absolute',
                                top: '-8px',
                                left: '12px',
                                background: '#ef4444',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '8px',
                                fontSize: '10px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                animation: 'pulse-glow 1.5s ease-in-out infinite'
                              }}>
                                🔴 LIVE
                              </div>

                              {timeSlot.fixtures.map((fixture, fixtureIndex) => {
                                // Determine group position for styling
                                let groupPosition: 'single' | 'first' | 'middle' | 'last' = 'single';
                                if (timeSlot.fixtures.length > 1) {
                                  if (fixtureIndex === 0) {
                                    groupPosition = 'first';
                                  } else if (fixtureIndex === timeSlot.fixtures.length - 1) {
                                    groupPosition = 'last';
                                  } else {
                                    groupPosition = 'middle';
                                  }
                                }

                                return (
                                  <FixtureCard
                                    key={fixture.id}
                                    fixture={fixture}
                                    variant="compact"
                                    showViewButton={true}
                                    groupPosition={groupPosition}
                                    isInLiveGroup={true} // New prop to disable individual live styling
                                  />
                                );
                              })}
                            </div>
                          );
                        } else {
                          // Regular rendering for non-live games
                          return timeSlot.fixtures.map((fixture, fixtureIndex) => {
                            // Determine group position for styling
                            let groupPosition: 'single' | 'first' | 'middle' | 'last' = 'single';
                            if (timeSlot.fixtures.length > 1) {
                              if (fixtureIndex === 0) {
                                groupPosition = 'first';
                              } else if (fixtureIndex === timeSlot.fixtures.length - 1) {
                                groupPosition = 'last';
                              } else {
                                groupPosition = 'middle';
                              }
                            }

                            return (
                              <FixtureCard
                                key={fixture.id}
                                fixture={fixture}
                                variant="compact"
                                showViewButton={true}
                                groupPosition={groupPosition}
                              />
                            );
                          });
                        }
                      })()}
                    </div>
                  );
                  })}
                </DayGroupCard>
                </div>
              );
            })}
          </div>

          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            background: '#f9fafb', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
              Want to see all upcoming fixtures or manage broadcasts?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href="/fixtures" 
                style={{ 
                  color: '#6366f1', 
                  textDecoration: 'underline', 
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                📺 All Fixtures
              </a>
              <a
                href="/competitions"
                style={{
                  color: '#6366f1',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                🏆 Browse by Competition
              </a>
              <a
                href="/clubs"
                style={{
                  color: '#6366f1',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                🏟️ Browse by Club
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
