import React from 'react';
import type { Fixture } from '../types';

interface FixtureCardProps {
  fixture: Fixture;
}

const FixtureCard: React.FC<FixtureCardProps> = ({ fixture }) => {
  const kickoffDate = new Date(fixture.kickoff_utc);
  const isValidDate = !isNaN(kickoffDate.getTime());
  
  const formatDateTime = () => {
    if (!isValidDate) return 'TBD';
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    };
    
    return kickoffDate.toLocaleDateString('en-GB', options);
  };

  const getBroadcasterInfo = () => {
    if (fixture.blackout.is_blackout) {
      return (
        <div className="broadcaster-info blackout">
          <span className="blackout-text">Blackout</span>
          {fixture.blackout.reason && (
            <span className="blackout-reason">{fixture.blackout.reason}</span>
          )}
        </div>
      );
    }
    
    if (fixture.providers_uk.length === 0) {
      return (
        <div className="broadcaster-info tbd">
          <span className="tbd-text">TBC</span>
        </div>
      );
    }
    
    return (
      <div className="broadcaster-info confirmed">
        {fixture.providers_uk.map((provider, index) => (
          <span key={provider.id} className="provider">
            {provider.name}
            {index < fixture.providers_uk.length - 1 && ', '}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="fixture-card">
      <div className="fixture-datetime">
        {formatDateTime()}
      </div>
      
      <div className="fixture-teams">
        <div className="team home-team">
          {fixture.home.crest && (
            <img 
              src={fixture.home.crest} 
              alt={`${fixture.home.name} crest`}
              className="team-crest"
            />
          )}
          <span className="team-name">{fixture.home.name}</span>
        </div>
        
        <div className="vs">vs</div>
        
        <div className="team away-team">
          {fixture.away.crest && (
            <img 
              src={fixture.away.crest} 
              alt={`${fixture.away.name} crest`}
              className="team-crest"
            />
          )}
          <span className="team-name">{fixture.away.name}</span>
        </div>
      </div>
      
      {getBroadcasterInfo()}
      
      {fixture.venue && (
        <div className="fixture-venue">
          {fixture.venue}
        </div>
      )}
    </div>
  );
};

export default FixtureCard;