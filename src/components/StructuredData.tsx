import React from 'react';
import type { Fixture, SimpleFixture } from '../types';

interface StructuredDataProps {
  type: 'match' | 'organization' | 'website';
  data?: Fixture | SimpleFixture;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getCompetitionName = (fixture: Fixture | SimpleFixture): string => {
    if ('competition' in fixture) {
      switch (fixture.competition) {
        case 'premier-league':
          return 'Premier League';
        case 'champions-league':
          return 'UEFA Champions League';
        case 'europa-league':
          return 'UEFA Europa League';
        case 'fa-cup':
          return 'FA Cup';
        case 'league-cup':
          return 'EFL Cup';
        default:
          return 'Football Competition';
      }
    }
    return 'Football Competition';
  };

  const getCompetitionUrl = (fixture: Fixture | SimpleFixture): string => {
    if ('competition' in fixture) {
      switch (fixture.competition) {
        case 'premier-league':
          return 'https://www.premierleague.com';
        case 'champions-league':
          return 'https://www.uefa.com/uefachampionsleague/';
        case 'europa-league':
          return 'https://www.uefa.com/uefaeuropaleague/';
        case 'fa-cup':
          return 'https://www.thefa.com/competitions/thefacup';
        case 'league-cup':
          return 'https://www.efl.com/carabao-cup/';
        default:
          return 'https://www.uefa.com';
      }
    }
    return 'https://www.uefa.com';
  };

  const generateMatchStructuredData = (fixture: Fixture | SimpleFixture) => {
    const isSimpleFixture = 'home_team' in fixture;
    
    const homeTeam = isSimpleFixture ? fixture.home_team : fixture.home.name;
    const awayTeam = isSimpleFixture ? fixture.away_team : fixture.away.name;
    const venue = !isSimpleFixture && fixture.venue ? fixture.venue : undefined;
    
    const kickoffDate = new Date(fixture.kickoff_utc).toISOString();
    
    // Generate SEO-friendly URL for the match
    const matchUrl = isSimpleFixture ? 
      `https://matchlocator.com/matches/${fixture.id}-${homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam.toLowerCase().replace(/\s+/g, '-')}-${kickoffDate.split('T')[0]}` :
      `https://matchlocator.com/matches/${fixture.id}-${fixture.home.name.toLowerCase().replace(/\s+/g, '-')}-vs-${fixture.away.name.toLowerCase().replace(/\s+/g, '-')}-${kickoffDate.split('T')[0]}`;
    
    return {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": `${homeTeam} vs ${awayTeam}`,
      "description": `Football match between ${homeTeam} and ${awayTeam}`,
      "startDate": kickoffDate,
      "sport": {
        "@type": "Sport",
        "name": "Football"
      },
      "homeTeam": {
        "@type": "SportsTeam",
        "name": homeTeam,
        "sport": "Football"
      },
      "awayTeam": {
        "@type": "SportsTeam", 
        "name": awayTeam,
        "sport": "Football"
      },
      "competitor": [
        {
          "@type": "SportsTeam",
          "name": homeTeam,
          "sport": "Football"
        },
        {
          "@type": "SportsTeam",
          "name": awayTeam,
          "sport": "Football"
        }
      ],
      "organizer": {
        "@type": "SportsOrganization",
        "name": getCompetitionName(fixture),
        "url": getCompetitionUrl(fixture)
      },
      ...(venue && {
        "location": {
          "@type": "Place",
          "name": venue
        }
      }),
      "url": matchUrl,
      "isAccessibleForFree": false,
      "eventStatus": "https://schema.org/EventScheduled"
    };
  };

  const generateOrganizationStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization", 
      "name": "fixtures.app",
      "description": "Football TV Schedule for UK - Premier League, Champions League and more. Sky Sports & TNT Sports fixtures",
      "url": "https://matchlocator.com",
      "logo": "https://matchlocator.com/favicon.png",
      "sameAs": [
        "https://matchlocator.com"
      ],
      "foundingDate": "2024",
      "knowsAbout": [
        "Premier League",
        "Champions League",
        "Europa League",
        "Football Television Broadcasting",
        "UK Sports TV Guide",
        "Sky Sports",
        "TNT Sports"
      ]
    };
  };

  const generateWebsiteStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "fixtures.app - Football TV Guide UK",
      "description": "Football TV Guide UK - Premier League, Champions League and more. Sky Sports & TNT Sports fixtures.",
      "url": "https://matchlocator.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://matchlocator.com/fixtures?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "about": {
        "@type": "Thing",
        "name": "Football TV Broadcasting"
      }
    };
  };

  let structuredData;
  
  switch (type) {
    case 'match':
      if (!data) return null;
      structuredData = generateMatchStructuredData(data);
      break;
    case 'organization':
      structuredData = generateOrganizationStructuredData();
      break;
    case 'website':
      structuredData = generateWebsiteStructuredData();
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

export default StructuredData;