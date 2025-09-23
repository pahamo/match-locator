// Simple script to generate CSV from the teams debug data we already have
const fs = require('fs');

// From the browser console output, we know there are 177 teams
// Let's create a simple template CSV that can be filled in manually

const csvTemplate = `id,name,current_slug,new_slug,competition_id
# Please fill in the actual team data from the browser console
# The browser shows: "[DEBUG] First few teams: (3) [{…}, {…}, {…}]"
# You can expand those objects in the browser console to see the full data
# Alternatively, we can use a different approach...
`;

fs.writeFileSync('teams-template.csv', csvTemplate);
console.log('Template created. Let me try a different approach...');

// Let's use a Netlify function approach instead
const netlifyFunction = `
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, slug, competition_id')
      .order('name', { ascending: true });

    if (error) throw error;

    let csvContent = 'id,name,current_slug,new_slug,competition_id\\n';
    data.forEach(team => {
      const escapedName = team.name.replace(/"/g, '""');
      const nameWithQuotes = escapedName.includes(',') ? \`"\${escapedName}"\` : escapedName;
      csvContent += \`\${team.id},\${nameWithQuotes},\${team.slug},,\${team.competition_id}\\n\`;
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="teams-slugs.csv"'
      },
      body: csvContent
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
`;

fs.writeFileSync('netlify/functions/export-teams-csv.js', netlifyFunction);
console.log('Created Netlify function: netlify/functions/export-teams-csv.js');
console.log('You can now visit: https://matchlocator.com/.netlify/functions/export-teams-csv');