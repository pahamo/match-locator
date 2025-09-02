<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Football Listings MVP</title>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import { jget, PATH, BIG_LIMIT, orderByKickoff } from './api.js';

    async function homeView(){
      const nowISO = new Date().toISOString();
      const fixtures = await jget(`${PATH.fixtures}?select=id,utc_kickoff,home_team:teams!fixtures_home_team_id_fkey(name),away_team:teams!fixtures_away_team_id_fkey(name),broadcasts:broadcasts_uk(channel_name,providers(display_name))&utc_kickoff=gte.${nowISO}&${orderByKickoff}&limit=${BIG_LIMIT}`);

      const listHtml = fixtures.map(fixture => {
        return `
          <div>
            <strong>${fixture.home_team.name}</strong> vs <strong>${fixture.away_team.name}</strong><br />
            Kickoff: ${new Date(fixture.utc_kickoff).toLocaleString()}
          </div>
        `;
      }).join('');

      const countLine = `<p style="margin:0 0 8px; font-size:12px; opacity:.7;">Showing ${fixtures.length} upcoming fixtures</p>`;

      const app = document.getElementById('app');
      app.innerHTML = `
        <h1>Football Listings</h1>
        ${countLine}
        <div id="list">
          ${listHtml}
        </div>
      `;
    }

    homeView();
  </script>
</body>
</html>