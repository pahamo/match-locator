import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFixtureById, getFixtureByTeamsAndDate } from '../services/supabase';
import type { Fixture } from '../types';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import StructuredData from '../components/StructuredData';
import ContextCard from '../components/ContextCard';
import BroadcastCard from '../components/BroadcastCard';
import MatchPreview from '../components/MatchPreview';
import { parseMatchSlug, parseSeoMatchSlug, generateMatchMeta, generateSeoMatchUrl, updateDocumentMeta } from '../utils/seo';
import { formatDetailedDate } from '../utils/dateFormat';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import AffiliateDisclosure from '../components/legal/AffiliateDisclosure';

const MatchPage: React.FC = () => {
  const { matchSlug, matchId, id } = useParams<{ matchSlug?: string; matchId?: string; id?: string }>();
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFixture = async () => {
      try {
        setLoading(true);
        setError(null);

        let fixtureData: Fixture | undefined;

        if (matchSlug) {
          const currentPath = window.location.pathname;

          // Check if it's the new SEO-friendly format (/fixtures/team-vs-team-competition-date)
          if (currentPath.startsWith('/fixtures/')) {
            const seoData = parseSeoMatchSlug(matchSlug);
            if (seoData) {
              console.log('MatchPage: Loading fixture with SEO slug:', seoData);
              const startTime = performance.now();

              fixtureData = await getFixtureByTeamsAndDate(seoData.homeTeam, seoData.awayTeam, seoData.date);

              const endTime = performance.now();
              console.log(`MatchPage: Fixture loaded via SEO search in ${endTime - startTime}ms`);
            }
          } else {
            // Legacy format with ID (/matches/id-team-vs-team-date)
            const parsedId = parseMatchSlug(matchSlug);
            if (parsedId) {
              console.log('MatchPage: Loading fixture with legacy ID:', parsedId);
              const startTime = performance.now();

              fixtureData = await getFixtureById(parsedId);

              const endTime = performance.now();
              console.log(`MatchPage: Fixture loaded via ID in ${endTime - startTime}ms`);
            }
          }
        } else {
          // Handle pure legacy URLs with just IDs
          const raw = matchId ?? id;
          if (!raw) {
            setError('No match ID provided');
            setLoading(false);
            return;
          }

          const parsedId = parseInt(raw, 10);
          if (isNaN(parsedId)) {
            setError('Invalid match ID');
            setLoading(false);
            return;
          }

          console.log('MatchPage: Loading fixture with pure ID:', parsedId);
          fixtureData = await getFixtureById(parsedId);
        }

        if (!fixtureData) {
          setError('Match not found');
        } else {
          setFixture(fixtureData);

          // Update SEO meta tags
          const meta = generateMatchMeta(fixtureData);

          // If this is a legacy URL (/matches/), set canonical to new format (/fixtures/)
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/matches/') || currentPath.startsWith('/match/')) {
            const newCanonicalUrl = `${window.location.origin}${generateSeoMatchUrl(fixtureData)}`;
            meta.canonical = newCanonicalUrl;
            meta.ogUrl = newCanonicalUrl;
          }

          updateDocumentMeta(meta);
        }
      } catch (err) {
        console.error('Failed to load fixture:', err);
        setError('Failed to load match details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadFixture();
  }, [matchSlug, matchId, id]);

  const formatDateTime = (utcKickoff: string) => {
    return formatDetailedDate(utcKickoff);
  };

  const formatCompetitionName = (competition: string) => {
    // Convert slug-style names to proper format
    return competition
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/Uefa/g, 'UEFA')
      .replace(/Fa /g, 'FA ')
      .replace(/Pl /g, 'Premier League ');
  };


  if (loading) {
    return (
      <div className="match-page">
        <Header
          title="Match Details"
          subtitle="Loading match information..."
        />
        <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />
        
        <main>
          <div className="wrap">
            <div className="loading">Loading match details...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-page">
        <Header
          title="Match Details"
          subtitle="Error loading match information"
        />
        <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />
        
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="match-page">
        <Header
          title="Match Details"
          subtitle="Match not found"
        />
        <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />
        
        <main>
          <div className="wrap">
            <div className="no-fixtures">
              <p>Match not found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="match-page">
      <StructuredData type="match" data={fixture} />
      <Header
        title="Match Locator"
        subtitle="Football TV Schedule (UK)"
      />

      <main>
        <div className="wrap">
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname, { matchTitle: `${fixture.home.name} vs ${fixture.away.name}` })} />

          {/* Page Title */}
          <h1 style={{
            marginTop: 32,
            marginBottom: 24,
            fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: 1.2
          }}>
            {fixture.home.name} vs {fixture.away.name}
          </h1>

          {/* Match Header Card */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Kick-off Time */}
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>⏰</span>
              {formatDateTime(fixture.kickoff_utc)}
            </div>

            {/* Teams */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flex: '1',
                minWidth: '0'
              }}>
                {fixture.home.crest && (
                  <img
                    src={fixture.home.crest}
                    alt={`${fixture.home.name} crest`}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      flexShrink: 0
                    }}
                  />
                )}
                <span style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {fixture.home.name}
                </span>
              </div>

              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#6b7280',
                flexShrink: 0
              }}>
                vs
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flex: '1',
                minWidth: '0',
                justifyContent: 'flex-end'
              }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {fixture.away.name}
                </span>
                {fixture.away.crest && (
                  <img
                    src={fixture.away.crest}
                    alt={`${fixture.away.name} crest`}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      flexShrink: 0
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* How to Watch Section - Moved above for prominence */}
          <BroadcastCard fixture={fixture} />

          {/* Context Cards Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {/* Venue/Stadium - Replaces Match Status */}
            {fixture.venue && (
              <ContextCard
                icon="🏟️"
                label="Stadium"
                value={fixture.venue}
              />
            )}

            {/* Competition Round */}
            {fixture.competition && (
              <ContextCard
                icon="🏆"
                label="Competition"
                value={formatCompetitionName(fixture.competition)}
              />
            )}

            {/* Matchweek */}
            {fixture.matchweek && (
              <ContextCard
                icon="📅"
                label="Matchweek"
                value={`Week ${fixture.matchweek}`}
              />
            )}
          </div>

          {/* Match Preview Content */}
          <MatchPreview fixture={fixture} />

          {/* See More Section */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#374151'
            }}>
              Explore More
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {/* Home Team Button */}
              <Link
                to={`/clubs/${fixture.home.slug || fixture.home.name.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  padding: '12px 18px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#5b21b6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6366f1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🏟️ {fixture.home.name}
              </Link>

              {/* Away Team Button */}
              <Link
                to={`/clubs/${fixture.away.slug || fixture.away.name.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  padding: '12px 18px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#5b21b6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6366f1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🏟️ {fixture.away.name}
              </Link>

              {/* Competition Button */}
              {fixture.competition && (
                <Link
                  to={`/competitions/${fixture.competition.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    padding: '12px 18px',
                    backgroundColor: '#059669',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#047857';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🏆 {fixture.competition}
                </Link>
              )}
            </div>
          </div>

          {/* Footer disclosure */}
          <AffiliateDisclosure position="footer" />
        </div>
      </main>
    </div>
  );
};

export default MatchPage;
