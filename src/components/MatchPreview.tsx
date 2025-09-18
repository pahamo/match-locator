import React from 'react';
import type { Fixture } from '../types';
import { formatDetailedDate } from '../utils/dateFormat';

interface MatchPreviewProps {
  fixture: Fixture;
}

const MatchPreview: React.FC<MatchPreviewProps> = ({ fixture }) => {
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

  // Generate dynamic content based on fixture data
  const generateMatchPreview = () => {
    const homeTeam = fixture.home.name;
    const awayTeam = fixture.away.name;
    const competition = fixture.competition ? formatCompetitionName(fixture.competition) : 'League';
    const venue = fixture.venue;
    const matchweek = fixture.matchweek;

    const previews = [
      `This ${competition} encounter between ${homeTeam} and ${awayTeam} promises to be an exciting fixture. ${homeTeam} will be looking to make their home advantage count${venue ? ` at ${venue}` : ''}, while ${awayTeam} will be hoping to secure a positive result on their travels.`,

      `Both teams will be eager to claim all three points in this important ${competition} match${matchweek ? ` during matchweek ${matchweek}` : ''}. The tactical battle between the managers will be crucial, with team selection and in-game adjustments potentially deciding the outcome.`,

      `Form, fitness, and tactical setup will all play crucial roles in determining the winner of this contest. Football fans can expect an entertaining match as both sides look to implement their preferred style of play and exploit any weaknesses in their opponent's approach.`
    ];

    return previews;
  };

  const generateTeamForm = () => {
    const homeTeam = fixture.home.name;
    const awayTeam = fixture.away.name;

    return [
      `${homeTeam} will be looking to continue their recent performances and build momentum with a strong showing in front of their home supporters. Their recent form and home record will be key factors in their approach to this match.`,

      `${awayTeam} will be focused on their away form and tactical discipline to get a result on the road. Away victories in this competition require strong defensive organization and clinical finishing when opportunities arise.`
    ];
  };

  const previewParagraphs = generateMatchPreview();
  const teamFormContent = generateTeamForm();

  return (
    <div className="match-preview" style={{ marginBottom: '32px' }}>
      {/* Match Preview Section */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '16px',
          borderBottom: '2px solid #3b82f6',
          paddingBottom: '8px'
        }}>
          Match Preview
        </h2>
        <div style={{ lineHeight: '1.7', color: '#374151' }}>
          {previewParagraphs.map((paragraph, index) => (
            <p key={index} style={{
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Team Form Section */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '16px',
          borderBottom: '2px solid #059669',
          paddingBottom: '8px'
        }}>
          Team Form
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px'
        }}>
          {teamFormContent.map((content, index) => (
            <div key={index} style={{
              background: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              borderLeft: '4px solid #059669'
            }}>
              <p style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#374151'
              }}>
                {content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Information Section */}
      <section>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '16px',
          borderBottom: '2px solid #f59e0b',
          paddingBottom: '8px'
        }}>
          Key Information
        </h2>
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fed7aa',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}>
                Kick-off Time
              </h3>
              <p style={{
                margin: 0,
                fontSize: '15px',
                color: '#451a03',
                fontWeight: '500'
              }}>
                {formatDetailedDate(fixture.kickoff_utc)}
              </p>
            </div>

            {fixture.venue && (
              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  Venue
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#451a03',
                  fontWeight: '500'
                }}>
                  {fixture.venue}
                </p>
              </div>
            )}

            {fixture.competition && (
              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  Competition
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#451a03',
                  fontWeight: '500'
                }}>
                  {formatCompetitionName(fixture.competition)}
                </p>
              </div>
            )}

            {fixture.matchweek && (
              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  Matchweek
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#451a03',
                  fontWeight: '500'
                }}>
                  Week {fixture.matchweek}
                </p>
              </div>
            )}
          </div>

          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #fed7aa'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#92400e',
              fontStyle: 'italic'
            }}>
              All times shown are UK local time. Match details and broadcast information are subject to change.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MatchPreview;