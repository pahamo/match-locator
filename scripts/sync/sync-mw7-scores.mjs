#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔄 Syncing MW7 scores from SportMonks...\n');

// Fetch round with fixtures and scores
const url = `https://api.sportmonks.com/v3/football/rounds/372201?api_token=${SPORTMONKS_TOKEN}&include=fixtures.scores`;

try {
  const response = await fetch(url);
  const data = await response.json();
  const fixtures = data.data.fixtures || [];

  console.log(`📊 Found ${fixtures.length} MW7 fixtures\n`);

  for (const fixture of fixtures) {
    try {
      // Find fixture in our database
      const { data: dbFixture } = await supabase
        .from('fixtures')
        .select('id, home_team_id, away_team_id')
        .eq('sportmonks_fixture_id', fixture.id)
        .maybeSingle();

      if (!dbFixture) {
        console.log(`⚠️  Skipping SM ${fixture.id} - not in database`);
        continue;
      }

      // Extract scores
      const scores = fixture.scores || [];
      const currentScores = scores.filter(s => s.description === 'CURRENT');

      const homeScore = currentScores.find(s => s.score?.participant === 'home')?.score?.goals;
      const awayScore = currentScores.find(s => s.score?.participant === 'away')?.score?.goals;

      if (homeScore !== undefined && awayScore !== undefined) {
        // Update scores
        const { error } = await supabase
          .from('fixtures')
          .update({
            home_score: homeScore,
            away_score: awayScore,
            status: fixture.state?.state || 'FT'
          })
          .eq('id', dbFixture.id);

        if (error) {
          console.error(`❌ Error updating ${fixture.name}:`, error.message);
        } else {
          console.log(`✅ ${fixture.name}: ${homeScore}-${awayScore}`);
        }
      } else {
        console.log(`⚠️  ${fixture.name}: No scores available`);
      }

    } catch (err) {
      console.error(`❌ Error processing ${fixture.name}:`, err.message);
    }
  }

  console.log('\n✅ Done!');

} catch (error) {
  console.error('❌ Failed to fetch round:', error.message);
  process.exit(1);
}
