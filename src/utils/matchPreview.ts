/**
 * Match Preview Generator
 * Generates contextual match previews for Premier League fixtures
 */

import type { Fixture } from '../types';

// Team information and characteristics
const TEAM_INFO: Record<string, {
  nickname: string;
  ground: string;
  manager: string;
  style: string;
  keyPlayers: string[];
  recentForm: string;
  strengths: string[];
  rivalry?: string;
}> = {
  'Arsenal': {
    nickname: 'The Gunners',
    ground: 'Emirates Stadium',
    manager: 'Mikel Arteta',
    style: 'possession-based attacking football',
    keyPlayers: ['Bukayo Saka', 'Martin Ødegaard', 'Gabriel Jesus'],
    recentForm: 'strong title contenders',
    strengths: ['fluid attacking play', 'solid defensive structure', 'pace on the counter'],
    rivalry: 'North London Derby with Tottenham'
  },
  'Liverpool': {
    nickname: 'The Reds',
    ground: 'Anfield',
    manager: 'Jürgen Klopp',
    style: 'high-intensity pressing and counter-attacking',
    keyPlayers: ['Mohamed Salah', 'Virgil van Dijk', 'Luis Díaz'],
    recentForm: 'rebuilding under Klopp',
    strengths: ['lethal counter-attacks', 'Anfield atmosphere', 'clinical finishing'],
    rivalry: 'Merseyside Derby with Everton'
  },
  'Manchester City': {
    nickname: 'The Citizens',
    ground: 'Etihad Stadium',
    manager: 'Pep Guardiola',
    style: 'possession-heavy technical football',
    keyPlayers: ['Erling Haaland', 'Kevin De Bruyne', 'Phil Foden'],
    recentForm: 'dominant champions',
    strengths: ['technical superiority', 'tactical flexibility', 'squad depth'],
  },
  'Manchester United': {
    nickname: 'The Red Devils',
    ground: 'Old Trafford',
    manager: 'Erik ten Hag',
    style: 'direct attacking football',
    keyPlayers: ['Bruno Fernandes', 'Marcus Rashford', 'Casemiro'],
    recentForm: 'inconsistent but improving',
    strengths: ['pace in transition', 'Old Trafford atmosphere', 'individual brilliance'],
  },
  'Chelsea': {
    nickname: 'The Blues',
    ground: 'Stamford Bridge',
    manager: 'Mauricio Pochettino',
    style: 'flexible tactical approach',
    keyPlayers: ['Enzo Fernández', 'Reece James', 'Christopher Nkunku'],
    recentForm: 'rebuilding with young talent',
    strengths: ['youth and energy', 'tactical discipline', 'defensive solidity'],
  },
  'Tottenham Hotspur': {
    nickname: 'Spurs',
    ground: 'Tottenham Hotspur Stadium',
    manager: 'Ange Postecoglou',
    style: 'aggressive high-pressing football',
    keyPlayers: ['Son Heung-min', 'Harry Kane', 'Dejan Kulusevski'],
    recentForm: 'entertaining but inconsistent',
    strengths: ['attacking flair', 'pressing intensity', 'modern stadium atmosphere'],
    rivalry: 'North London Derby with Arsenal'
  },
  'Newcastle United': {
    nickname: 'The Magpies',
    ground: 'St. James\' Park',
    manager: 'Eddie Howe',
    style: 'organized and disciplined football',
    keyPlayers: ['Bruno Guimarães', 'Alexander Isak', 'Kieran Trippier'],
    recentForm: 'consistent mid-table performers',
    strengths: ['St. James\' Park atmosphere', 'work ethic', 'team unity'],
  },
  'Brighton & Hove Albion': {
    nickname: 'The Seagulls',
    ground: 'Amex Stadium',
    manager: 'Roberto De Zerbi',
    style: 'possession-based technical football',
    keyPlayers: ['Alexis Mac Allister', 'Kaoru Mitoma', 'Lewis Dunk'],
    recentForm: 'impressive overachievers',
    strengths: ['technical ability', 'tactical discipline', 'player development'],
  },
  'West Ham United': {
    nickname: 'The Hammers',
    ground: 'London Stadium',
    manager: 'David Moyes',
    style: 'pragmatic and physical football',
    keyPlayers: ['Declan Rice', 'Jarrod Bowen', 'Michail Antonio'],
    recentForm: 'solid mid-table side',
    strengths: ['set-piece threat', 'physical presence', 'European experience'],
  },
  'Aston Villa': {
    nickname: 'The Villans',
    ground: 'Villa Park',
    manager: 'Unai Emery',
    style: 'organized defensive football',
    keyPlayers: ['Ollie Watkins', 'John McGinn', 'Emiliano Martínez'],
    recentForm: 'steady improvement under Emery',
    strengths: ['Villa Park atmosphere', 'defensive organization', 'counter-attacking'],
  },
  'Crystal Palace': {
    nickname: 'The Eagles',
    ground: 'Selhurst Park',
    manager: 'Roy Hodgson',
    style: 'counter-attacking football',
    keyPlayers: ['Wilfried Zaha', 'Eberechi Eze', 'Marc Guéhi'],
    recentForm: 'experienced Premier League side',
    strengths: ['Selhurst Park atmosphere', 'pace on the break', 'defensive resilience'],
  },
  'Everton': {
    nickname: 'The Toffees',
    ground: 'Goodison Park',
    manager: 'Sean Dyche',
    style: 'direct and physical football',
    keyPlayers: ['Dominic Calvert-Lewin', 'Amadou Onana', 'James Tarkowski'],
    recentForm: 'fighting relegation battles',
    strengths: ['Goodison Park atmosphere', 'fighting spirit', 'set-piece threat'],
    rivalry: 'Merseyside Derby with Liverpool'
  },
  'Brentford': {
    nickname: 'The Bees',
    ground: 'Brentford Community Stadium',
    manager: 'Thomas Frank',
    style: 'data-driven attacking football',
    keyPlayers: ['Ivan Toney', 'Bryan Mbeumo', 'Yoane Wissa'],
    recentForm: 'impressive Premier League newcomers',
    strengths: ['attacking threat', 'team spirit', 'set-piece specialists'],
  },
  'Fulham': {
    nickname: 'The Cottagers',
    ground: 'Craven Cottage',
    manager: 'Marco Silva',
    style: 'possession-based football',
    keyPlayers: ['Aleksandar Mitrović', 'Andreas Pereira', 'João Palhinha'],
    recentForm: 'solid Premier League returnees',
    strengths: ['Craven Cottage atmosphere', 'technical ability', 'attacking flair'],
  },
  'Leicester City': {
    nickname: 'The Foxes',
    ground: 'King Power Stadium',
    manager: 'Enzo Maresca',
    style: 'quick transitional football',
    keyPlayers: ['Jamie Vardy', 'James Maddison', 'Youri Tielemans'],
    recentForm: 'experienced Premier League campaigners',
    strengths: ['counter-attacking pace', 'experience', 'big-game mentality'],
  },
  'Nottingham Forest': {
    nickname: 'The Reds',
    ground: 'City Ground',
    manager: 'Steve Cooper',
    style: 'organized defensive football',
    keyPlayers: ['Brennan Johnson', 'Jesse Lingard', 'Dean Henderson'],
    recentForm: 'Premier League returnees',
    strengths: ['City Ground atmosphere', 'team spirit', 'defensive organization'],
  },
  'Southampton': {
    nickname: 'The Saints',
    ground: 'St. Mary\'s Stadium',
    manager: 'Russell Martin',
    style: 'possession-based football',
    keyPlayers: ['James Ward-Prowse', 'Che Adams', 'Romeo Lavia'],
    recentForm: 'developing young talent',
    strengths: ['youth development', 'technical ability', 'set-piece expertise'],
  },
  'Wolverhampton Wanderers': {
    nickname: 'Wolves',
    ground: 'Molineux Stadium',
    manager: 'Gary O\'Neil',
    style: 'counter-attacking football',
    keyPlayers: ['Rúben Neves', 'Pedro Neto', 'José Sá'],
    recentForm: 'solid mid-table performers',
    strengths: ['Molineux atmosphere', 'pace on the break', 'Portuguese connection'],
  },
  'AFC Bournemouth': {
    nickname: 'The Cherries',
    ground: 'Vitality Stadium',
    manager: 'Andoni Iraola',
    style: 'attacking football',
    keyPlayers: ['Dominic Solanke', 'Philip Billing', 'Lloyd Kelly'],
    recentForm: 'ambitious Premier League side',
    strengths: ['attacking intent', 'team unity', 'Vitality Stadium atmosphere'],
  },
  'Ipswich Town': {
    nickname: 'The Tractor Boys',
    ground: 'Portman Road',
    manager: 'Kieran McKenna',
    style: 'energetic pressing football',
    keyPlayers: ['Nathan Broadhead', 'Leif Davis', 'Sam Morsy'],
    recentForm: 'exciting Championship promotion winners',
    strengths: ['youthful energy', 'attacking flair', 'Portman Road atmosphere'],
  }
};

// Default info for teams not in the database
const getDefaultTeamInfo = (teamName: string) => ({
  nickname: teamName,
  ground: `${teamName} Stadium`,
  manager: 'the manager',
  style: 'competitive football',
  keyPlayers: ['key players'],
  recentForm: 'competitive form',
  strengths: ['determination', 'team spirit', 'home advantage'],
});

/**
 * Generate a match preview for Premier League fixtures
 */
export function generateMatchPreview(
  team1Name: string,
  team2Name: string,
  nextFixture?: Fixture
): string {
  const team1Info = TEAM_INFO[team1Name] || getDefaultTeamInfo(team1Name);
  const team2Info = TEAM_INFO[team2Name] || getDefaultTeamInfo(team2Name);

  // Check if it's a special rivalry
  const isRivalry = team1Info.rivalry?.includes(team2Name) || team2Info.rivalry?.includes(team1Name);

  // Generate preview based on context
  let preview = '';

  if (nextFixture) {
    const isWeekend = nextFixture.kickoff_utc && (
      new Date(nextFixture.kickoff_utc).getDay() === 0 || // Sunday
      new Date(nextFixture.kickoff_utc).getDay() === 6    // Saturday
    );

    // Opening paragraph
    if (isRivalry) {
      preview += `This ${isWeekend ? 'weekend' : 'fixture'} brings one of the Premier League's most anticipated clashes as ${team1Name} welcome ${team2Name} in what promises to be a captivating encounter. `;
    } else {
      preview += `${team1Name} host ${team2Name} in what promises to be an intriguing Premier League ${isWeekend ? 'weekend' : 'fixture'}, with both sides looking to secure valuable points in their respective campaigns. `;
    }

    // Home team analysis
    preview += `${team1Name}, known as ${team1Info.nickname}, will be looking to capitalize on their home advantage at ${team1Info.ground}. Under ${team1Info.manager}, they have been ${team1Info.recentForm} and are renowned for their ${team1Info.style}. `;

    if (team1Info.keyPlayers.length > 0) {
      preview += `Key players to watch include ${team1Info.keyPlayers.slice(0, 2).join(' and ')}, who will be crucial to their chances of success. `;
    }

    // Away team analysis
    preview += `${team2Name}, nicknamed ${team2Info.nickname}, travel to ${team1Info.ground} with their own ambitions. ${team2Info.manager}'s side have shown ${team2Info.recentForm} and prefer ${team2Info.style}. `;

    if (team2Info.keyPlayers.length > 0) {
      preview += `${team2Info.keyPlayers[0]} will be a player to watch for the visitors, alongside ${team2Info.keyPlayers[1] || 'the rest of the squad'}. `;
    }

    // Tactical analysis
    preview += `Tactically, this matchup presents an interesting contrast. ${team1Name}'s strengths in ${team1Info.strengths[0]} and ${team1Info.strengths[1] || 'team cohesion'} will be tested against ${team2Name}'s ability to execute ${team2Info.style}. `;

    // Atmosphere and context
    if (team1Info.ground) {
      preview += `The atmosphere at ${team1Info.ground} is expected to be electric, with the home crowd playing their part in what could be a crucial encounter for both teams' seasons. `;
    }

    // Closing prediction
    if (isRivalry) {
      preview += `Given the rivalry between these two sides and their contrasting styles, fans can expect a passionate and competitive match that could go either way. `;
    } else {
      preview += `With both teams possessing quality and determination, this fixture has all the ingredients for an entertaining Premier League encounter that could prove pivotal in the context of the season. `;
    }

    preview += `The result could have significant implications for both teams as they continue their Premier League campaigns.`;

  } else {
    // General H2H preview when no specific fixture
    preview += `The fixture between ${team1Name} and ${team2Name} always promises to be an engaging Premier League encounter. `;
    preview += `${team1Name} (${team1Info.nickname}) typically rely on their ${team1Info.style} and the intimidating atmosphere of ${team1Info.ground} to gain an advantage. `;
    preview += `Meanwhile, ${team2Name} (${team2Info.nickname}) bring their own tactical approach featuring ${team2Info.style}. `;

    if (isRivalry) {
      preview += `This rivalry adds extra spice to proceedings, with both sets of fans creating an electric atmosphere whenever these teams meet. `;
    }

    preview += `Historical encounters between these sides have often been closely contested affairs, with individual moments of brilliance and tactical battles determining the outcome.`;
  }

  return preview;
}

/**
 * Check if teams are Premier League teams (for weekend preview eligibility)
 */
export function isPremierLeagueFixture(team1Name: string, team2Name: string): boolean {
  return TEAM_INFO.hasOwnProperty(team1Name) && TEAM_INFO.hasOwnProperty(team2Name);
}