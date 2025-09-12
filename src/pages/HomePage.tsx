import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSimpleFixtures, getSimpleCompetitions, type SimpleFixture, type SimpleCompetition } from '../services/supabase-simple';
import Header from '../components/Header';
import StructuredData from '../components/StructuredData';
import { FixtureCardSkeleton } from '../components/SkeletonLoader';
import DayGroupCard from '../components/DayGroupCard';
import StickyHeader from '../components/StickyHeader';
import { generateHomeMeta, updateDocumentMeta, generateSimpleMatchUrl } from '../utils/seo';
import { getDisplayTeamName, shouldUseShortNames } from '../utils/teamNames';
import { useActiveGroup } from '../hooks/useActiveGroup';

interface MatchWeek {
  matchweek: number;
  fixtures: SimpleFixture[];
  dateRange: string;
  hasToday: boolean;
  isUpcoming: boolean;
}


// Helper to group fixtures by date, then by time within each date for day card display
const groupFixturesByDate = (fixtures: SimpleFixture[]) => {
  const dateGroups: Record<string, Record<string, SimpleFixture[]>> = {};
  
  fixtures.forEach(fixture => {
    const date = new Date(fixture.kickoff_utc);
    const dateKey = date.toLocaleDateString('en-GB', {
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      timeZone: 'Europe/London'
    });
    const timeKey = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
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
  const [competitions, setCompetitions] = useState<SimpleCompetition[]>([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number>(1); // Default to Premier League

  // Prepare data for hooks - call hooks unconditionally
  const dayGroups = matchWeek ? groupFixturesByDate(matchWeek.fixtures) : [];
  const { activeGroup, groupRefs } = useActiveGroup(
    dayGroups.map(group => ({ date: group.date, time: group.commonTime }))
  );

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load competitions first
        const competitionsData = await getSimpleCompetitions();
        if (!isCancelled) {
          setCompetitions(competitionsData);
          
          // Auto-select first available competition if current selection is not visible
          const isCurrentCompetitionVisible = competitionsData.some(c => c.id === selectedCompetitionId);
          if (!isCurrentCompetitionVisible && competitionsData.length > 0) {
            setSelectedCompetitionId(competitionsData[0].id);
          }
        }
        
        // Load fixtures for selected competition
        const fixturesData = await getSimpleFixtures(selectedCompetitionId);
        const currentMatchWeek = getCurrentOrUpcomingMatchWeek(fixturesData);
        if (!isCancelled) {
          setMatchWeek(currentMatchWeek);
          // Update SEO meta tags for homepage
          const meta = generateHomeMeta();
          updateDocumentMeta(meta);
        }
        try {
          const stored = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
          if (!isCancelled && Array.isArray(stored)) setBlackoutIds(stored);
        } catch { /* ignore */ }
      } catch (err) {
        console.error('Failed to load fixtures:', err);
        if (!isCancelled) setError('Failed to load fixtures. Please try again later.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();
    return () => { isCancelled = true; };
  }, [selectedCompetitionId]);

  const loadMatchWeek = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fixturesData = await getSimpleFixtures();
      const currentMatchWeek = getCurrentOrUpcomingMatchWeek(fixturesData);
      setMatchWeek(currentMatchWeek);

      // Load blackout flags from localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
        if (Array.isArray(stored)) setBlackoutIds(stored);
      } catch {
        // ignore
      }
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
    
    // First check if there's a matchweek with games today or in the future
    for (const matchweek of sortedMatchweeks) {
      const matchweekFixtures = fixturesByMatchweek.get(matchweek)!;
      const upcomingFixtures = matchweekFixtures.filter(f => new Date(f.kickoff_utc) >= now);
      
      if (upcomingFixtures.length > 0) {
        // Sort fixtures by kickoff time
        const sortedFixtures = matchweekFixtures.sort((a, b) => 
          new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
        );
        
        // Calculate date range
        const firstDate = new Date(sortedFixtures[0].kickoff_utc);
        const lastDate = new Date(sortedFixtures[sortedFixtures.length - 1].kickoff_utc);
        
        const dateRange = firstDate.toDateString() === lastDate.toDateString() 
          ? firstDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
          : `${firstDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${lastDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
        
        // Check if any fixtures are today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const hasToday = matchweekFixtures.some(f => {
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
              Upcoming Matches
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
      <Header />
      
      <main>
        <div className="wrap" style={{ position: 'relative' }}>
          <h1 style={{ marginTop: 0 }}>Premier League TV Schedule (UK)</h1>
          
          {/* Compact Matchweek Info */}
          <div 
            style={{ 
              background: matchWeek.hasToday ? '#f8fafc' : '#fafaf9', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px', 
              padding: '12px 16px', 
              marginBottom: '16px',
              fontSize: '14px'
            }}
          >
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span style={{ 
                color: '#64748b',
                fontWeight: '500'
              }}>
                Matchweek {matchWeek.matchweek} • {matchWeek.fixtures.length} match{matchWeek.fixtures.length === 1 ? '' : 'es'}
              </span>
              <span style={{ 
                color: '#94a3b8',
                fontSize: '12px'
              }}>
                {matchWeek.dateRange}
              </span>
            </div>
          </div>

          {/* Sticky Header for Mobile */}
          <StickyHeader 
            activeGroup={activeGroup} 
            show={typeof window !== 'undefined' && window.innerWidth < 768}
          />

          {/* Day Cards */}
          <div className="fixtures-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {dayGroups.map((dayGroup, dayIndex) => (
              <DayGroupCard
                key={dayIndex}
                id={`group-${dayIndex}`}
                date={dayGroup.date}
                time={dayGroup.commonTime}
                ref={(el) => { groupRefs.current[dayIndex] = el; }}
              >
                {/* Time slots within the day */}
                {dayGroup.timeSlots.map((timeSlot, timeIndex) => (
                  <div key={timeIndex}>
                    {/* Show time header if multiple time slots in a day */}
                    {dayGroup.timeSlots.length > 1 && (
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        margin: '8px 0 6px 0',
                        padding: '4px 8px',
                        background: '#f9fafb',
                        borderRadius: '4px',
                        width: 'fit-content'
                      }}>
                        {timeSlot.time}
                      </div>
                    )}
                    
                    {/* Compact Match Cards */}
                    {timeSlot.fixtures.map(fixture => (
                      <div key={fixture.id} className="fixture-card-compact" style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minHeight: 'auto'
                      }}>
                        {/* Teams Section - More Compact */}
                        <div className="fixture-teams-compact" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flex: '1',
                          minWidth: '0'
                        }}>
                          <div className="team" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flex: '1',
                            minWidth: '0'
                          }}>
                            {fixture.home_crest && (
                              <img 
                                src={fixture.home_crest} 
                                alt={`${fixture.home_team} crest`}
                                style={{ width: '18px', height: '18px', objectFit: 'contain', flexShrink: 0 }}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <span className="team-name" style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                              {getDisplayTeamName(fixture.home_team, shouldUseShortNames())}
                            </span>
                          </div>
                          
                          <div className="vs" style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            fontWeight: '500',
                            flexShrink: 0
                          }}>vs</div>
                          
                          <div className="team away-team" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flex: '1',
                            minWidth: '0',
                            justifyContent: 'flex-end'
                          }}>
                            <span className="team-name" style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                              {getDisplayTeamName(fixture.away_team, shouldUseShortNames())}
                            </span>
                            {fixture.away_crest && (
                              <img 
                                src={fixture.away_crest} 
                                alt={`${fixture.away_team} crest`}
                                style={{ width: '18px', height: '18px', objectFit: 'contain', flexShrink: 0 }}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        </div>
                        
                        {/* Broadcaster Info - Compact */}
                        <div className="broadcaster-info-compact" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexShrink: 0
                        }}>
                          {fixture.isBlackout ? (
                            <span className="provider blackout" style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#fee2e2',
                              color: '#dc2626'
                            }}>🚫 Blackout</span>
                          ) : fixture.broadcaster ? (
                            <span className="provider confirmed" style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#dcfce7',
                              color: '#16a34a',
                              fontWeight: '500'
                            }}>{fixture.broadcaster}</span>
                          ) : (
                            <span className="tbd-text" style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#fef3c7',
                              color: '#d97706'
                            }}>TBD</span>
                          )}
                          
                          <Link 
                            to={generateSimpleMatchUrl(fixture)} 
                            style={{ 
                              color: '#6366f1', 
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: '500',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #6366f1',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#6366f1';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#6366f1';
                            }}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </DayGroupCard>
            ))}
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
                href="/admin" 
                style={{ 
                  color: '#6366f1', 
                  textDecoration: 'underline', 
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                🔧 Admin
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
