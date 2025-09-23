const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

async function extractTeams() {
  // Note: Using environment variables that should be set in production
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY
  );

  console.log('Extracting teams from database...');

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, slug, competition_id')
      .order('name', { ascending: true });

    if (error) {
      throw error;
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

    // Write to CSV file
    fs.writeFileSync('teams-slugs.csv', csvContent);
    console.log('CSV file created: teams-slugs.csv');
    console.log('You can now edit the "new_slug" column and provide it back for updates');

  } catch (err) {
    console.error('Error extracting teams:', err);
  }
}

extractTeams();