/**
 * Base Competition Importer
 * Abstract base class for all competition importers
 */

import {
  createSupabaseClient,
  fetchFromFootballData,
  processBatches,
  slugify,
  normalizeTeamNameWithAliases,
  mapMatchStatus,
  sleep
} from '../utils/common.mjs';

export class BaseCompetitionImporter {
  constructor(competitionConfig) {
    this.config = competitionConfig;
    this.supabase = createSupabaseClient();
  }

  /**
   * Import both teams and fixtures for this competition
   */
  async importAll() {
    console.log(`🚀 Starting ${this.config.name} import...`);
    console.log(`Competition: ${this.config.name} (${this.config.code})`);
    console.log(`Season: ${this.config.season}`);
    console.log(`Database ID: ${this.config.id}\n`);

    try {
      // Step 1: Ensure competition exists
      await this.ensureCompetition();

      // Step 2: Import teams
      const teamsCount = await this.importTeams();
      console.log(`✅ Imported ${teamsCount} teams\n`);

      // Rate limiting between major operations
      await sleep(2000);

      // Step 3: Import fixtures
      const fixturesCount = await this.importFixtures();
      console.log(`✅ Imported ${fixturesCount} fixtures\n`);

      console.log(`🎉 ${this.config.name} import completed successfully!`);
      return { teams: teamsCount, fixtures: fixturesCount };

    } catch (error) {
      console.error(`❌ Import failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ensure competition exists in database
   */
  async ensureCompetition() {
    console.log(`📋 Ensuring ${this.config.name} competition exists...`);

    const competitionData = {
      id: this.config.id,
      name: this.config.name,
      slug: this.config.slug,
      short_name: this.config.shortName,
      country: this.config.country,
      country_code: this.config.countryCode,
      season: this.config.season,
      total_teams: this.config.teams,
      total_rounds: this.config.rounds,
      type: this.config.type,
      is_active: this.config.isActive,
      is_production_visible: this.config.isProductionVisible,
      external_id: this.config.fdId,
      external_code: this.config.code,
      colors_primary: this.config.colors.primary,
      colors_secondary: this.config.colors.secondary,
      last_updated: new Date().toISOString()
    };

    const { error } = await this.supabase
      .from('competitions')
      .upsert([competitionData], {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      throw new Error(`Failed to ensure competition: ${error.message}`);
    }

    console.log(`✅ Competition ready`);
  }

  /**
   * Import teams for this competition
   */
  async importTeams() {
    console.log(`👥 Importing ${this.config.name} teams...`);

    const data = await fetchFromFootballData(`/competitions/${this.config.code}/teams`);
    const teams = data.teams || [];

    console.log(`Found ${teams.length} teams from API`);

    const transformedTeams = teams.map(team => this.transformTeam(team));

    return await processBatches(
      transformedTeams,
      20, // batch size
      (batch) => this.insertTeamBatch(batch)
    );
  }

  /**
   * Import fixtures for this competition
   */
  async importFixtures() {
    console.log(`⚽ Importing ${this.config.name} fixtures...`);

    const data = await fetchFromFootballData(`/competitions/${this.config.code}/matches?season=${this.config.season}`);
    const matches = data.matches || [];

    console.log(`Found ${matches.length} fixtures from API`);

    const transformedFixtures = await this.transformFixtures(matches);

    return await processBatches(
      transformedFixtures,
      50, // batch size
      (batch) => this.insertFixtureBatch(batch)
    );
  }

  /**
   * Transform API team data to our database format
   */
  transformTeam(apiTeam) {
    return {
      // Don't include id - let database auto-generate to avoid conflicts
      name: normalizeTeamNameWithAliases(apiTeam.name),
      slug: slugify(apiTeam.name),
      short_name: apiTeam.shortName || apiTeam.tla,
      tla: apiTeam.tla,
      crest_url: apiTeam.crest,
      competition_id: this.config.id,
      venue: apiTeam.venue,
      founded: apiTeam.founded,
      club_colors: apiTeam.clubColors,
      website: apiTeam.website,
      external_id: apiTeam.id,
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Transform API fixture data to our database format
   */
  async transformFixtures(apiMatches) {
    const fixtures = [];

    for (const match of apiMatches) {
      if (!match.homeTeam?.name || !match.awayTeam?.name || !match.utcDate) {
        continue; // Skip invalid matches
      }

      const homeTeamId = await this.getTeamIdByName(match.homeTeam.name);
      const awayTeamId = await this.getTeamIdByName(match.awayTeam.name);

      if (!homeTeamId || !awayTeamId) {
        console.warn(`Skipping match: could not find team IDs for ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        continue;
      }

      fixtures.push({
        competition_id: this.config.id,
        utc_kickoff: match.utcDate,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        matchday: match.matchday || null,
        status: mapMatchStatus(match.status),
        venue: match.venue,
        season: match.season?.id,
        stage: match.stage,
        round: match.round || match.stage,
        external_id: match.id,
        last_updated: new Date().toISOString()
      });
    }

    return fixtures;
  }

  /**
   * Get team ID by name (with caching)
   */
  async getTeamIdByName(teamName) {
    if (!this.teamNameCache) {
      this.teamNameCache = new Map();

      // Load all teams for this competition
      const { data: teams, error } = await this.supabase
        .from('teams')
        .select('id, name')
        .eq('competition_id', this.config.id);

      if (error) {
        throw new Error(`Failed to load teams: ${error.message}`);
      }

      teams.forEach(team => {
        this.teamNameCache.set(team.name, team.id);
      });
    }

    const normalizedName = normalizeTeamNameWithAliases(teamName);
    return this.teamNameCache.get(normalizedName) || null;
  }

  /**
   * Insert batch of teams
   */
  async insertTeamBatch(teams) {
    let insertedCount = 0;

    for (const team of teams) {
      try {
        // Check if team already exists by external_id
        const { data: existingTeam } = await this.supabase
          .from('teams')
          .select('id, competition_id')
          .eq('external_id', team.external_id)
          .maybeSingle();

        if (existingTeam) {
          // Team exists - update competition_id if this is their primary league
          if (this.config.type === 'LEAGUE') {
            const { error: updateError } = await this.supabase
              .from('teams')
              .update({
                competition_id: this.config.id,
                ...team  // Update other fields too
              })
              .eq('id', existingTeam.id);

            if (updateError) {
              console.warn(`Failed to update team ${team.name}: ${updateError.message}`);
            } else {
              console.log(`Updated ${team.name} to ${this.config.name}`);
              insertedCount++;
            }
          } else {
            console.log(`Skipped ${team.name} (already exists in league)`);
          }
        } else {
          // Team doesn't exist - insert new
          const processedTeam = {
            ...team,
            slug: `${team.slug}-${this.config.shortName.toLowerCase()}` // Make slug unique
          };

          const { error: insertError } = await this.supabase
            .from('teams')
            .insert([processedTeam]);

          if (insertError) {
            console.warn(`Failed to insert team ${team.name}: ${insertError.message}`);
          } else {
            console.log(`Inserted ${team.name}`);
            insertedCount++;
          }
        }
      } catch (err) {
        console.warn(`Error processing team ${team.name}: ${err.message}`);
      }
    }

    return insertedCount;
  }

  /**
   * Insert batch of fixtures
   */
  async insertFixtureBatch(fixtures) {
    const { data, error } = await this.supabase
      .from('fixtures')
      .upsert(fixtures, {
        onConflict: 'competition_id,home_team_id,away_team_id,utc_kickoff',
        ignoreDuplicates: false
      })
      .select('id');

    if (error) {
      throw new Error(`Failed to insert fixtures: ${error.message}`);
    }

    return data?.length || fixtures.length;
  }
}