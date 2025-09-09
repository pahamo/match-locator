const $ = (id) => document.getElementById(id);
const log = (msg) => { $('logs').textContent = new Date().toISOString() + '  |  ' + msg + '\n' + $('logs').textContent; };
const setErr = (e) => $('errors').textContent = (e?.stack || String(e));
const clearErr = () => $('errors').textContent = 'None';

function headers() {
  const key = $('sbKey').value.trim();
  return { apikey: key, Authorization: 'Bearer ' + key, Accept: 'application/json' };
}

function base() { return $('sbUrl').value.replace(/\/+$/, ''); }

function paramsForList() {
  const usp = new URLSearchParams();
  const from = $('from').value;
  const to = $('to').value;
  const team = $('team').value.trim();

  if (from) usp.set('date_utc', `gte.${from}`);
  if (to)   usp.append('date_utc', `lte.${to}`);
  if (team) usp.set('or', `(home_team.ilike.*${team}*,away_team.ilike.*${team}*)`);

  usp.set('order', 'date_utc.asc,ko_utc.asc');
  usp.set('select', 'fixture_id,date_utc,ko_utc,home_team,away_team,broadcasters_csv');
  return usp;
}

async function load() {
  clearErr();
  const url = base() + '/rest/v1/vw_fixtures_expanded?' + paramsForList().toString();
  log('GET ' + url);
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + await res.text());
  const rows = await res.json();
  render(rows);
}

function render(rows) {
  const tb = $('tbl').querySelector('tbody');
  tb.innerHTML = '';
  $('count').textContent = String(rows.length);
  for (const r of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.date_utc || ''}</td>
      <td>${r.ko_utc || ''}</td>
      <td>${r.home_team || ''}</td>
      <td>${r.away_team || ''}</td>
      <td>${r.broadcasters_csv || ''}</td>
      <td><button data-id="${r.fixture_id}" class="view">View</button></td>
    `;
    tb.appendChild(tr);
  }
}

async function viewOne(id) {
  clearErr();
  const usp = new URLSearchParams();
  usp.set('fixture_id', `eq.${id}`);
  usp.set('select', `
    id,competition_id,utc_kickoff,home_team_id,away_team_id,
    home:teams!fixtures_home_team_id_fkey(id,name,short_name,badge_url),
    away:teams!fixtures_away_team_id_fkey(id,name,short_name,badge_url),
    broadcasts:broadcasts(*,provider:providers(id,name,slug,brand_color))
  `.replace(/\s+/g,''));
  const url = base() + '/rest/v1/fixtures?' + usp.toString();
  log('GET ' + url);
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + await res.text());
  const data = await res.json();
  $('detail').textContent = JSON.stringify(data, null, 2);
}

$('tbl').addEventListener('click', (e) => {
  const btn = e.target.closest('.view');
  if (btn) viewOne(btn.dataset.id).catch(setErr);
});

$('saveEnv').onclick = () => {
  localStorage.setItem('sb_url', $('sbUrl').value.trim());
  localStorage.setItem('sb_key', $('sbKey').value.trim());
  $('envMsg').textContent = 'Saved ✓';
  setTimeout(() => $('envMsg').textContent = '', 1000);
};
$('load').onclick = () => load().catch(setErr);

// init
$('sbUrl').value = localStorage.getItem('sb_url') || 'https://nkfuzkrazehjivzmdrvt.supabase.co';
$('sbKey').value = localStorage.getItem('sb_key') || '';
const today = new Date();
const plus30 = new Date(Date.now() + 30*864e5);
$('from').valueAsDate = today;
$('to').valueAsDate = plus30;