import React from 'react';
import type { Fixture, SimpleFixture } from '../types';

interface StructuredDataProps {
  type: 'match' | 'organization' | 'website' | 'competition' | 'faq';
  data?: Fixture | SimpleFixture | any;
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

  const generateFAQStructuredData = (faqData?: Array<{question: string; answer: string}>) => {
    const defaultFAQs = [
      {
        question: "What TV channels show Premier League matches in the UK?",
        answer: "Premier League matches in the UK are primarily shown on Sky Sports, TNT Sports (formerly BT Sport), and Amazon Prime Video. BBC and ITV occasionally show selected matches. Sky Sports shows the majority of televised Premier League games."
      },
      {
        question: "How can I watch Champions League football on TV?",
        answer: "Champions League matches are exclusively shown on TNT Sports (formerly BT Sport) in the UK. You can watch via TNT Sports on Sky, Virgin Media, BT TV, or through the TNT Sports app with a subscription."
      },
      {
        question: "Are all Premier League matches shown on TV?",
        answer: "No, not all Premier League matches are televised. Due to the 3pm Saturday blackout rule in the UK, matches kicking off at 3pm on Saturday are not shown live on UK television. Only selected matches are chosen for broadcast."
      },
      {
        question: "What is the 3pm blackout rule?",
        answer: "The 3pm blackout is a UEFA rule that prevents live football broadcasts between 2:45pm and 5:15pm on Saturdays in the UK. This is designed to protect attendance at lower league matches by encouraging fans to attend local games instead of watching Premier League on TV."
      },
      {
        question: "How much does Sky Sports cost to watch football?",
        answer: "Sky Sports pricing varies depending on your package. Sky Sports typically costs around £25-30 per month when added to a Sky TV package. You can also access Sky Sports through streaming services like NOW TV with day, week, or month passes available."
      },
      {
        question: "Can I watch football matches for free on TV?",
        answer: "Some football matches are available free-to-air on BBC and ITV, particularly FA Cup matches, England international games, and selected Champions League matches. However, most Premier League games require a Sky Sports or TNT Sports subscription."
      }
    ];

    const faqsToUse = faqData || defaultFAQs;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqsToUse.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
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
    case 'competition':
      if (!data) return null;
      structuredData = data; // Use the passed data directly for competition
      break;
    case 'faq':
      structuredData = generateFAQStructuredData(data);
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