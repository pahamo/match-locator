#!/usr/bin/env node

// Use the same approach as the existing scripts
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Initialize Supabase with service key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createTeamsCSV() {
  console.log('Fetching teams from database...');

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, slug, competition_id')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    console.log(`Found ${data.length} teams`);

    // Create CSV content
    let csvContent = 'id,name,current_slug,new_slug,competition_id\n';

    data.forEach(team => {
      // Escape commas and quotes in team names
      const escapedName = team.name.replace(/"/g, '""');
      const nameWithQuotes = escapedName.includes(',') ? `"${escapedName}"` : escapedName;

      csvContent += `${team.id},${nameWithQuotes},${team.slug},,${team.competition_id}\n`;
    });

    // Write to repo
    fs.writeFileSync('teams-slugs.csv', csvContent);
    console.log('✅ Created teams-slugs.csv in the repo');
    console.log('You can now edit this file directly in VS Code');

  } catch (err) {
    console.error('Error:', err);
  }
}

createTeamsCSV();