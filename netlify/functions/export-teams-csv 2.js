
const { getSupabaseClient } = require('./_shared/supabase');

exports.handler = async (event, context) => {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, slug, competition_id')
      .order('name', { ascending: true });

    if (error) throw error;

    let csvContent = 'id,name,current_slug,new_slug,competition_id\n';
    data.forEach(team => {
      const escapedName = team.name.replace(/"/g, '""');
      const nameWithQuotes = escapedName.includes(',') ? `"${escapedName}"` : escapedName;
      csvContent += `${team.id},${nameWithQuotes},${team.slug},,${team.competition_id}\n`;
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
