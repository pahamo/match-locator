#!/usr/bin/env node

/**
 * Fixed Score Import Script
 * Imports scores from Football-Data.org by matching teams and dates instead of external_id
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const API_TOKEN = process.env.FOOTBALL_DATA_TOKEN;
const COMP_ID_API = process.env.COMP_ID_API || '2021'; // Premier League
const COMP_ID_DB = process.env.COMP_ID_DB || '1';
const SEASON = process.env.SEASON || '2025';

function makeApiRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.football-data.org',
      path: endpoint,
      method: 'GET',
      headers: {
        'X-Auth-Token': API_TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error ${res.statusCode}: ${parsed.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function normalizeTeamName(name) {
  if (!name) return '';

  // Remove common suffixes and normalize
  return name
    .replace(/\s+(FC|CF|United|City|Town|Rovers|Wanderers|Albion)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findMatchingFixture(apiMatch, dbFixtures) {
  const apiHomeNorm = normalizeTeamName(apiMatch.homeTeam?.name || apiMatch.homeTeam?.shortName);
  const apiAwayNorm = normalizeTeamName(apiMatch.awayTeam?.name || apiMatch.awayTeam?.shortName);
  const apiDate = new Date(apiMatch.utcDate).toISOString().split('T')[0];

  // Find best match by team names and date
  for (const fixture of dbFixtures) {
    const dbHomeNorm = normalizeTeamName(fixture.home_team);
    const dbAwayNorm = normalizeTeamName(fixture.away_team);
    const dbDate = new Date(fixture.utc_kickoff).toISOString().split('T')[0];

    // Exact team name and date match
    if (dbHomeNorm === apiHomeNorm && dbAwayNorm === apiAwayNorm && dbDate === apiDate) {
      return { fixture, confidence: 'exact' };
    }
  }

  // Fallback: try partial team name matches on same date
  for (const fixture of dbFixtures) {
    const dbHomeNorm = normalizeTeamName(fixture.home_team);
    const dbAwayNorm = normalizeTeamName(fixture.away_team);
    const dbDate = new Date(fixture.utc_kickoff).toISOString().split('T')[0];

    if (dbDate === apiDate) {
      // Check if team names contain each other (partial match)
      const homeMatch = (dbHomeNorm.includes(apiHomeNorm) || apiHomeNorm.includes(dbHomeNorm)) &&
                       dbHomeNorm.length > 3 && apiHomeNorm.length > 3;
      const awayMatch = (dbAwayNorm.includes(apiAwayNorm) || apiAwayNorm.includes(dbAwayNorm)) &&
                       dbAwayNorm.length > 3 && apiAwayNorm.length > 3;

      if (homeMatch && awayMatch) {
        return { fixture, confidence: 'partial' };
      }
    }
  }

  return null;
}

async function main() {
  console.log('🏈 Fixed Score Import - Matching by Team Names & Dates\n');

  try {
    // Get all database fixtures for the competition with team names
    console.log('📋 Loading database fixtures...');
    const { data: dbFixtures, error: fixturesError } = await supabase
      .from('fixtures_with_teams')
      .select('id, home_team, away_team, utc_kickoff, status')
      .eq('competition_id', COMP_ID_DB)
      .order('utc_kickoff');

    if (fixturesError) {
      throw new Error(`Failed to load fixtures: ${fixturesError.message}`);
    }

    console.log(`✅ Loaded ${dbFixtures.length} fixtures from database`);

    // Get matches from Football-Data.org API
    console.log('\n📡 Fetching matches from Football-Data.org...');
    const endpoint = `/v4/competitions/${COMP_ID_API}/matches?status=FINISHED&season=${SEASON}`;
    const apiData = await makeApiRequest(endpoint);

    const finishedMatches = apiData.matches.filter(match =>
      match.status === 'FINISHED' &&
      match.score?.fullTime?.home !== null &&
      match.score?.fullTime?.away !== null
    );

    console.log(`✅ Found ${finishedMatches.length} finished matches from API`);

    // Process matches
    console.log('\n⚽ Processing matches...');
    let matchedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const matchDetails = [];

    for (const apiMatch of finishedMatches) {
      try {
        const matchResult = findMatchingFixture(apiMatch, dbFixtures);

        if (!matchResult) {
          console.log(`❌ No match found: ${apiMatch.homeTeam.name} vs ${apiMatch.awayTeam.name} (${apiMatch.utcDate})`);
          errorCount++;
          continue;
        }

        matchedCount++;
        const { fixture, confidence } = matchResult;

        // Check if already has scores (we'll check this during update)
        const hasExistingScores = false; // Will be determined by update result

        const scoreData = {
          status: 'FINISHED',
          full_time_home_score: apiMatch.score.fullTime.home,
          full_time_away_score: apiMatch.score.fullTime.away,
          half_time_home_score: apiMatch.score.halftime?.home || null,
          half_time_away_score: apiMatch.score.halftime?.away || null,
          home_score: apiMatch.score.fullTime.home,  // Legacy compatibility
          away_score: apiMatch.score.fullTime.away,
          winner: apiMatch.score.winner || 'DRAW',
          duration: apiMatch.score.duration || 'REGULAR'
        };

        // Update the fixture
        const { error: updateError } = await supabase
          .from('fixtures')
          .update(scoreData)
          .eq('id', fixture.id);

        if (updateError) {
          console.log(`❌ Update failed for fixture ${fixture.id}: ${updateError.message}`);
          errorCount++;
        } else {
          updatedCount++;
          const status = hasExistingScores ? 'updated' : 'added';
          const confIcon = confidence === 'exact' ? '✅' : '⚠️';
          console.log(`${confIcon} ${status.toUpperCase()}: ${fixture.home_team} ${scoreData.home_score}-${scoreData.away_score} ${fixture.away_team} (${confidence})`);

          matchDetails.push({
            fixtureId: fixture.id,
            homeTeam: fixture.home_team,
            awayTeam: fixture.away_team,
            score: `${scoreData.home_score}-${scoreData.away_score}`,
            confidence,
            status
          });
        }

      } catch (matchError) {
        console.log(`❌ Error processing match: ${matchError.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`   Total API matches: ${finishedMatches.length}`);
    console.log(`   Matched fixtures: ${matchedCount}`);
    console.log(`   Successfully updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Unmatched: ${finishedMatches.length - matchedCount}`);

    if (updatedCount > 0) {
      // Trigger league table calculation
      console.log('\n🏆 Calculating league standings...');
      const { error: calcError } = await supabase.rpc('calculate_league_standings', {
        comp_id: parseInt(COMP_ID_DB),
        season_str: SEASON
      });

      if (calcError) {
        console.log(`❌ League calculation error: ${calcError.message}`);
      } else {
        console.log('✅ League standings calculated successfully');

        // Show top 5 teams
        const { data: standings } = await supabase
          .from('current_league_tables')
          .select('position, team_name, played, points, goals_for, goals_against')
          .eq('competition_id', COMP_ID_DB)
          .order('position')
          .limit(5);

        if (standings && standings.length > 0) {
          console.log('\n🏆 Current League Table (Top 5):');
          console.log('   Pos | Team                    | P | Pts | GF | GA');
          console.log('   ----|-------------------------|---|-----|----|----|');
          standings.forEach(team => {
            const pos = String(team.position).padStart(3, ' ');
            const name = (team.team_name || 'Unknown').padEnd(23, ' ').substring(0, 23);
            const p = String(team.played).padStart(2, ' ');
            const pts = String(team.points).padStart(3, ' ');
            const gf = String(team.goals_for).padStart(2, ' ');
            const ga = String(team.goals_against).padStart(2, ' ');
            console.log(`   ${pos} | ${name} | ${p}|${pts} | ${gf}| ${ga}`);
          });
        }
      }
    }

    if (updatedCount > 0) {
      console.log('\n🎉 Score import completed successfully!');
    } else {
      console.log('\n⚠️  No scores were imported. Check team name matching logic.');
    }

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}