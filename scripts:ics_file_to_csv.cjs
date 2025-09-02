// scripts/ics_file_to_csv.cjs
const ical = require('node-ical');
const fs = require('fs');

const INPUT = 'pl.ics';
const OUTPUT = 'pl_fixtures_batch.csv';

function toISO(d) {
  try { return new Date(d).toISOString(); } catch { return ''; }
}

try {
  console.log('▶ Reading', INPUT);
  const data = ical.sync.parseFile(INPUT);

  const rows = Object.values(data)
    .filter(ev => ev && ev.type === 'VEVENT' && ev.uid && ev.summary && ev.start)
    .map(ev => ({
      uid: String(ev.uid),
      summary: String(ev.summary).replace(/\s+/g, ' ').trim(),
      starts_at: toISO(ev.start),
      location: ev.location ? String(ev.location).replace(/\s+/g, ' ').trim() : ''
    }))
    .sort((a,b) => a.starts_at.localeCompare(b.starts_at));

  if (!rows.length) {
    console.error('❌ No VEVENT items found. Is pl.ics valid?');
    process.exit(2);
  }

  const header = ['uid','summary','starts_at','location'].join(',') + '\n';
  const body = rows.map(r =>
    [r.uid, r.summary, r.starts_at, r.location]
      .map(v => `"${String(v||'').replace(/"/g,'""')}"`)
      .join(',')
  ).join('\n');

  fs.writeFileSync(OUTPUT, header + body);
  console.log(`✅ Wrote ${rows.length} rows to ${OUTPUT}`);
} catch (err) {
  console.error('❌ Failed:', err && (err.stack || err.message || err));
  process.exit(1);
}