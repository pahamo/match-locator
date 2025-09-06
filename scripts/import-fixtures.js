const SUPABASE_URL = 'https://ksqyurqkqznzrntdpood.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4';

async function importCompleteSeasonFixtures() {
    console.log('Starting fixture import...');
    
    try {
        const teamsResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=id,name`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const teams = await teamsResponse.json();
        console.log(`Found ${teams.length} teams`);
        
        const teamMap = {};
        teams.forEach(team => {
            teamMap[team.name] = team.id;
            if (team.name === 'Tottenham Hotspur') teamMap['Tottenham'] = team.id;
            if (team.name === 'Manchester United') teamMap['Man United'] = team.id;
            if (team.name === 'Manchester City') teamMap['Man City'] = team.id;
            if (team.name === 'West Ham United') teamMap['West Ham'] = team.id;
            if (team.name === 'Brighton & Hove Albion') teamMap['Brighton'] = team.id;
            if (team.name === 'Wolverhampton Wanderers') teamMap['Wolves'] = team.id;
            if (team.name === 'Newcastle United') teamMap['Newcastle'] = team.id;
        });
        
        console.log('Fetching from TheSportsDB...');
        const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4328&s=2024-2025');
        const data = await response.json();
        
        if (!data.events) {
            console.log('No events found');
            return;
        }
        
        console.log(`Found ${data.events.length} fixtures from API`);
        
        const existingResponse = await fetch(`${SUPABASE_URL}/rest/v1/fixtures?select=external_ref`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const existing = await existingResponse.json();
        const existingRefs = new Set(existing.map(f => f.external_ref));
        
        const fixturesToInsert = [];
        
        for (const fixture of data.events) {
            if (existingRefs.has(fixture.idEvent)) continue;
            
            const homeTeamId = teamMap[fixture.strHomeTeam];
            const awayTeamId = teamMap[fixture.strAwayTeam];
            
            if (!homeTeamId || !awayTeamId) {
                console.log(`Skipping: ${fixture.strHomeTeam} vs ${fixture.strAwayTeam}`);
                continue;
            }
            
            let utcKickoff = null;
            if (fixture.dateEvent && fixture.strTime) {
                // TheSportsDB provides times in UK local time, so we need to convert to UTC
                const dateTime = `${fixture.dateEvent}T${fixture.strTime}`;
                const date = new Date(dateTime);
                if (!isNaN(date.getTime())) {
                    // Add 1 hour to convert UK local time to UTC (accounts for BST/GMT)
                    const adjustedDate = new Date(date.getTime() + (60 * 60 * 1000));
                    utcKickoff = adjustedDate.toISOString();
                }
            }
            
            fixturesToInsert.push({
                external_ref: fixture.idEvent,
                season: '2025-26',
                matchweek: fixture.intRound || null,
                utc_kickoff: utcKickoff,
                home_team_id: homeTeamId,
                away_team_id: awayTeamId,
                venue: fixture.strVenue || null,
                status: fixture.strStatus === 'Match Finished' ? 'completed' : 'pending'
            });
        }
        
        console.log(`Inserting ${fixturesToInsert.length} new fixtures`);
        
        if (fixturesToInsert.length === 0) {
            console.log('All fixtures already exist');
            return;
        }
        
        const batchSize = 50;
        for (let i = 0; i < fixturesToInsert.length; i += batchSize) {
            const batch = fixturesToInsert.slice(i, i + batchSize);
            
            const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/fixtures`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(batch)
            });
            
            if (!insertResponse.ok) {
                console.error('Insert failed:', await insertResponse.text());
                return;
            }
            
            console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)}`);
        }
        
        console.log('Import complete!');
        
    } catch (error) {
        console.error('Import failed:', error);
    }
}

importCompleteSeasonFixtures();