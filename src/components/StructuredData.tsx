import React from 'react';
import type { Fixture, SimpleFixture } from '../types';

interface StructuredDataProps {
  type: 'match' | 'organization' | 'website' | 'competition' | 'faq' | 'team';
  data?: Fixture | SimpleFixture | any;
  dateModified?: string; // ISO date string for content freshness
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data, dateModified }) => {
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

  // Map venue names to proper address data for rich results
  const getVenueAddressData = (venueName: string): { city: string; address: string } => {
    const venueMap: Record<string, { city: string; address: string }> = {
      // Premier League venues
      'Emirates Stadium': { city: 'London', address: 'Ashburton Grove, London N5 1BU' },
      'Stamford Bridge': { city: 'London', address: 'Fulham Rd, London SW6 1HS' },
      'Anfield': { city: 'Liverpool', address: 'Anfield Rd, Liverpool L4 0TH' },
      'Old Trafford': { city: 'Manchester', address: 'Sir Matt Busby Way, Manchester M16 0RA' },
      'Etihad Stadium': { city: 'Manchester', address: 'Ashton New Rd, Manchester M11 3FF' },
      'Tottenham Hotspur Stadium': { city: 'London', address: '782 High Rd, London N17 0BX' },
      'London Stadium': { city: 'London', address: 'Queen Elizabeth Olympic Park, London E20 2ST' },
      'Craven Cottage': { city: 'London', address: 'Stevenage Rd, London SW6 6HH' },
      'Goodison Park': { city: 'Liverpool', address: 'Goodison Rd, Liverpool L4 4EL' },
      'Villa Park': { city: 'Birmingham', address: 'Trinity Rd, Birmingham B6 6HE' },
      'St. James\' Park': { city: 'Newcastle', address: 'Barrack Rd, Newcastle upon Tyne NE1 4ST' },
      'Selhurst Park': { city: 'London', address: 'Holmesdale Rd, London SE25 6PU' },
      'Molineux Stadium': { city: 'Wolverhampton', address: 'Waterloo Rd, Wolverhampton WV1 4QR' },
      'The Amex Stadium': { city: 'Brighton', address: 'Village Way, Brighton BN1 9BL' },
      'Turf Moor': { city: 'Burnley', address: 'Harry Potts Way, Burnley BB10 4BX' },
      'Bramall Lane': { city: 'Sheffield', address: 'Bramall Ln, Sheffield S2 4SU' },
      'Elland Road': { city: 'Leeds', address: 'Elland Rd, Leeds LS11 0ES' },
      'Carrow Road': { city: 'Norwich', address: 'Carrow Rd, Norwich NR1 1JE' },
      'Vicarage Road': { city: 'Watford', address: 'Vicarage Rd, Watford WD18 0ER' },
      'Brentford Community Stadium': { city: 'London', address: 'Lionel Rd S, Brentford TW8 0RU' },

      // Champions League venues
      'Wembley Stadium': { city: 'London', address: 'Wembley, London HA9 0WS' },
      'Santiago Bernabéu': { city: 'Madrid', address: 'Av. de Concha Espina, 1, 28036 Madrid, Spain' },
      'Camp Nou': { city: 'Barcelona', address: 'C. d\'Arístides Maillol, 12, 08028 Barcelona, Spain' },
      'Allianz Arena': { city: 'Munich', address: 'Werner-Heisenberg-Allee 25, 80939 München, Germany' },
      'San Siro': { city: 'Milan', address: 'Piazzale Angelo Moratti, 20151 Milano MI, Italy' },
      'Parc des Princes': { city: 'Paris', address: '24 Rue du Commandant Guilbaud, 75016 Paris, France' }
    };

    return venueMap[venueName] || { city: 'United Kingdom', address: 'Football Stadium, United Kingdom' };
  };

  const generateMatchStructuredData = (fixture: Fixture | SimpleFixture) => {
    const isSimpleFixture = 'home_team' in fixture;

    const homeTeam = isSimpleFixture ? fixture.home_team : fixture.home.name;
    const awayTeam = isSimpleFixture ? fixture.away_team : fixture.away.name;
    const venue = !isSimpleFixture && fixture.venue ? fixture.venue : undefined;

    const kickoffDate = new Date(fixture.kickoff_utc).toISOString();
    // Calculate endDate as kickoff + 2 hours (typical match duration)
    const endDate = new Date(new Date(fixture.kickoff_utc).getTime() + 2 * 60 * 60 * 1000).toISOString();

    // Generate SEO-friendly URL for the match
    const matchUrl = isSimpleFixture ?
      `https://matchlocator.com/matches/${fixture.id}-${homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam.toLowerCase().replace(/\s+/g, '-')}-${kickoffDate.split('T')[0]}` :
      `https://matchlocator.com/matches/${fixture.id}-${fixture.home.name.toLowerCase().replace(/\s+/g, '-')}-vs-${fixture.away.name.toLowerCase().replace(/\s+/g, '-')}-${kickoffDate.split('T')[0]}`;

    // Get image - use home team crest, fallback to competition logo, then default
    const getEventImage = () => {
      if (isSimpleFixture) {
        return fixture.home_crest || 'https://matchlocator.com/images/football-default.jpg';
      } else {
        return fixture.home.crest || 'https://matchlocator.com/images/football-default.jpg';
      }
    };

    // Get broadcaster info
    const getBroadcaster = () => {
      if (isSimpleFixture) {
        return fixture.broadcaster || 'Match Locator';
      } else {
        return (fixture.providers_uk && fixture.providers_uk.length > 0)
          ? fixture.providers_uk[0].name
          : 'Match Locator';
      }
    };

    // Get proper location data - always include location for Google rich results
    const getLocationData = () => {
      if (venue) {
        // Try to map known venues to proper address data
        const venueData = getVenueAddressData(venue);
        return {
          "@type": "Place",
          "name": venue,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "GB",
            "addressLocality": venueData.city,
            "streetAddress": venueData.address
          }
        };
      } else {
        // Default location for matches without specific venue
        return {
          "@type": "Place",
          "name": "UK Football Venue",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "GB",
            "addressLocality": "United Kingdom"
          }
        };
      }
    };

    // Get home and away team crests
    const homeTeamCrest = isSimpleFixture ? fixture.home_crest : fixture.home.crest;
    const awayTeamCrest = isSimpleFixture ? fixture.away_crest : fixture.away.crest;

    // Get broadcaster name for BroadcastEvent
    const broadcasterName = getBroadcaster();

    // Build enhanced team objects with logos
    const homeTeamSchema = {
      "@type": "SportsTeam",
      "name": homeTeam,
      "sport": "Football",
      ...(homeTeamCrest && { "logo": homeTeamCrest })
    };

    const awayTeamSchema = {
      "@type": "SportsTeam",
      "name": awayTeam,
      "sport": "Football",
      ...(awayTeamCrest && { "logo": awayTeamCrest })
    };

    const baseSchema: any = {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": `${homeTeam} vs ${awayTeam}`,
      "description": `Football match between ${homeTeam} and ${awayTeam} in ${getCompetitionName(fixture)}. Watch on UK TV via ${broadcasterName}.`,
      "startDate": kickoffDate,
      "endDate": endDate,
      "image": getEventImage(),
      "performer": [homeTeamSchema, awayTeamSchema],
      "sport": {
        "@type": "Sport",
        "name": "Football"
      },
      "homeTeam": homeTeamSchema,
      "awayTeam": awayTeamSchema,
      "competitor": [homeTeamSchema, awayTeamSchema],
      "organizer": {
        "@type": "SportsOrganization",
        "name": getCompetitionName(fixture),
        "url": getCompetitionUrl(fixture)
      },
      "location": getLocationData(),
      "url": matchUrl,
      "isAccessibleForFree": true,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "offers": {
        "@type": "Offer",
        "url": matchUrl,
        "price": "0",
        "priceCurrency": "GBP",
        "validFrom": new Date(new Date(fixture.kickoff_utc).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        "availability": "https://schema.org/InStock",
        "name": "TV Broadcasting",
        "description": "Watch this football match on UK television",
        "seller": {
          "@type": "Organization",
          "name": broadcasterName
        }
      }
    };

    // Add BroadcastEvent if broadcaster is known
    if (broadcasterName && broadcasterName !== 'Match Locator') {
      baseSchema.subEvent = {
        "@type": "BroadcastEvent",
        "name": `${homeTeam} vs ${awayTeam} - TV Broadcast`,
        "isLiveBroadcast": true,
        "startDate": kickoffDate,
        "endDate": endDate,
        "publishedOn": {
          "@type": "BroadcastService",
          "name": broadcasterName,
          "broadcastDisplayName": broadcasterName,
          "broadcaster": {
            "@type": "Organization",
            "name": broadcasterName
          }
        },
        "inLanguage": "en-GB",
        "videoFormat": "HD"
      };
    }

    return baseSchema;
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

  const generateSportsTeamStructuredData = (teamData?: any) => {
    if (!teamData) return null;

    const schema: any = {
      "@context": "https://schema.org",
      "@type": "SportsTeam",
      "name": teamData.name,
      "sport": "Football",
      "url": `https://matchlocator.com/club/${teamData.slug}`,
      "description": `${teamData.name} TV schedule, fixtures, and broadcast information. Find out what channel ${teamData.name} matches are on.`
    };

    // Add logo if available
    if (teamData.crest) {
      schema.logo = teamData.crest;
      schema.image = teamData.crest;
    }

    // Add venue if available
    if (teamData.venue) {
      schema.location = {
        "@type": "Place",
        "name": teamData.venue,
        ...(teamData.city && {
          "address": {
            "@type": "PostalAddress",
            "addressLocality": teamData.city,
            "addressCountry": "GB"
          }
        })
      };
    }

    // Add website if available
    if (teamData.website) {
      schema.sameAs = [teamData.website];
    }

    return schema;
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

  const generateFAQStructuredData = (faqData?: Array<{question: string; answer: string}>, dateModified?: string) => {
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

    const schema: any = {
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

    // Add dateModified if provided for content freshness
    if (dateModified) {
      schema.dateModified = dateModified;
      schema.datePublished = dateModified; // Use same date for simplicity
    }

    return schema;
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
      structuredData = generateFAQStructuredData(data, dateModified);
      break;
    case 'team':
      structuredData = generateSportsTeamStructuredData(data);
      if (!structuredData) return null;
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