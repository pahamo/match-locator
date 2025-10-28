/**
 * Structured Data Helper Functions
 *
 * Functions to generate enhanced structured data for team pages
 */

import type { Fixture, Team } from '../types';
import { formatTeamNameShort } from './seo';
import { getAllCompetitionConfigs } from '../config/competitions';

/**
 * Generate expanded FAQ data for team pages
 * Includes 8-10 questions covering various user intents
 */
export function generateExpandedTeamFAQ(
  team: Team,
  nextMatch?: Fixture,
  upcomingCount: number = 0,
  competitions: string[] = []
): Array<{ question: string; answer: string }> {
  const teamName = formatTeamNameShort(team.name);
  const nextMatchInfo = nextMatch
    ? {
        opponent: formatTeamNameShort(
          nextMatch.home.id === team.id ? nextMatch.away.name : nextMatch.home.name
        ),
        date: new Date(nextMatch.kickoff_utc).toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        time: new Date(nextMatch.kickoff_utc).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        broadcaster: nextMatch.broadcaster || nextMatch.providers_uk?.[0]?.name,
        isHome: nextMatch.home.id === team.id
      }
    : null;

  const faq: Array<{ question: string; answer: string }> = [];

  // Q1: What time is [team] playing today?
  faq.push({
    question: `What time is ${teamName} playing today?`,
    answer:
      nextMatchInfo &&
      new Date(nextMatch!.kickoff_utc).toDateString() === new Date().toDateString()
        ? `${teamName} ${nextMatchInfo.isHome ? 'host' : 'visit'} ${nextMatchInfo.opponent} today at ${nextMatchInfo.time} UK time${nextMatchInfo.broadcaster ? ` on ${nextMatchInfo.broadcaster}` : ''}.`
        : `${teamName} are not playing today. Their next match is ${nextMatchInfo ? `on ${nextMatchInfo.date}` : 'to be confirmed'}.`
  });

  // Q2: When is [team]'s next match?
  if (nextMatchInfo) {
    const homeAway = nextMatchInfo.isHome ? 'home to' : 'away to';
    faq.push({
      question: `When is ${teamName}'s next match?`,
      answer: `${teamName}'s next match is ${homeAway} ${nextMatchInfo.opponent} on ${nextMatchInfo.date} at ${nextMatchInfo.time}${nextMatchInfo.broadcaster ? ` on ${nextMatchInfo.broadcaster}` : ' (TV channel TBC)'}.`
    });
  }

  // Q3: What channel is [team] on?
  faq.push({
    question: `What channel is ${teamName} on?`,
    answer: nextMatchInfo?.broadcaster
      ? `${teamName}'s next match is on ${nextMatchInfo.broadcaster}. You can watch it ${
          nextMatchInfo.broadcaster.includes('Sky')
            ? 'with a Sky Sports subscription'
            : nextMatchInfo.broadcaster.includes('TNT')
              ? 'with a TNT Sports subscription'
              : 'via their streaming service'
        }.`
      : `${teamName}'s next match TV channel has not been confirmed yet. Check back closer to match day for broadcast details.`
  });

  // Q4: Where can I watch [team] on TV in the UK?
  const competitionBroadcasters = competitions.includes('Champions League')
    ? 'Sky Sports, TNT Sports (UEFA Champions League), Amazon Prime Video, or BBC'
    : competitions.includes('Europa League')
      ? 'Sky Sports, TNT Sports (UEFA Europa League), Amazon Prime Video, or BBC'
      : 'Sky Sports, TNT Sports, Amazon Prime Video, or BBC';

  faq.push({
    question: `Where can I watch ${teamName} on TV in the UK?`,
    answer: `${teamName} matches are typically broadcast on ${competitionBroadcasters} depending on the competition. Check the fixtures list above for specific channel information for each match.`
  });

  // Q5: How many fixtures does [team] have coming up?
  faq.push({
    question: `How many fixtures does ${teamName} have coming up?`,
    answer: `${teamName} have ${upcomingCount} upcoming ${upcomingCount === 1 ? 'fixture' : 'fixtures'} scheduled${competitions.length > 0 ? ` across ${competitions.join(', ')}` : ''}.`
  });

  // Q6: What is [team]'s home stadium?
  if (team.venue || team.home_venue) {
    faq.push({
      question: `What is ${teamName}'s home stadium?`,
      answer: `${teamName} play their home matches at ${team.venue || team.home_venue}${team.city ? ` in ${team.city}` : ''}.`
    });
  }

  // Q7: Is [team] playing in Europe? (if applicable)
  if (competitions.includes('Champions League') || competitions.includes('Europa League')) {
    const europeanComp = competitions.includes('Champions League')
      ? 'Champions League'
      : 'Europa League';
    faq.push({
      question: `Is ${teamName} playing in Europe?`,
      answer: `Yes, ${teamName} are competing in the UEFA ${europeanComp} this season. All European fixtures are listed above with UK broadcast information.`
    });
  }

  // Q8: What are [team]'s team colors?
  if (team.club_colors) {
    faq.push({
      question: `What are ${teamName}'s team colors?`,
      answer: `${teamName}'s team colors are ${team.club_colors}.`
    });
  }

  // Q9: When was [team] founded? (if available)
  if (team.founded) {
    faq.push({
      question: `When was ${teamName} founded?`,
      answer: `${teamName} was founded in ${team.founded}.`
    });
  }

  // Q10: What competitions does [team] play in?
  if (competitions.length > 0) {
    faq.push({
      question: `What competitions does ${teamName} play in?`,
      answer: `${teamName} currently compete in the ${competitions.join(' and ')}.`
    });
  }

  return faq;
}

/**
 * Generate multiple SportsEvent schemas for upcoming fixtures
 * Google prefers multiple event schemas for rich results
 */
export function generateMultipleSportsEvents(fixtures: Fixture[], limit: number = 5) {
  return fixtures.slice(0, limit).map(fixture => ({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${fixture.home.name} vs ${fixture.away.name}`,
    startDate: new Date(fixture.kickoff_utc).toISOString(),
    endDate: new Date(
      new Date(fixture.kickoff_utc).getTime() + 2 * 60 * 60 * 1000
    ).toISOString(),
    location: {
      '@type': 'Place',
      name: fixture.venue || `${fixture.home.name} Stadium`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GB'
      }
    },
    homeTeam: {
      '@type': 'SportsTeam',
      name: fixture.home.name
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: fixture.away.name
    },
    ...(fixture.broadcaster && {
      broadcastOfEvent: {
        '@type': 'BroadcastEvent',
        name: `${fixture.home.name} vs ${fixture.away.name} - Live on ${fixture.broadcaster}`,
        videoFormat: 'HD',
        isLiveBroadcast: true,
        broadcastOfEvent: {
          '@type': 'SportsEvent',
          name: `${fixture.home.name} vs ${fixture.away.name}`
        }
      }
    })
  }));
}
