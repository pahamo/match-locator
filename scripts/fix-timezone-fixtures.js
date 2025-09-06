const SUPABASE_URL = 'https://ksqyurqkqznzrntdpood.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4';

async function fixTimezoneIssue() {
    console.log('Starting timezone fix: adding 1 hour to all fixtures...');
    
    try {
        // Fetch all existing fixtures from the database
        console.log('Fetching all fixtures...');
        const existingResponse = await fetch(`${SUPABASE_URL}/rest/v1/fixtures?select=id,utc_kickoff`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const existingFixtures = await existingResponse.json();
        console.log(`Found ${existingFixtures.length} fixtures to fix`);
        
        const fixturesToUpdate = [];
        
        // Add 1 hour to each fixture
        for (const fixture of existingFixtures) {
            if (!fixture.utc_kickoff) {
                console.log(`Skipping fixture ${fixture.id}: no kickoff time`);
                continue;
            }
            
            try {
                // Parse current time and add 1 hour
                const currentTime = new Date(fixture.utc_kickoff);
                const correctedTime = new Date(currentTime.getTime() + (60 * 60 * 1000)); // Add 1 hour
                const correctedUtcKickoff = correctedTime.toISOString();
                
                fixturesToUpdate.push({
                    id: fixture.id,
                    utc_kickoff: correctedUtcKickoff
                });
                
                console.log(`Fixture ${fixture.id}: ${fixture.utc_kickoff} -> ${correctedUtcKickoff}`);
                
            } catch (error) {
                console.log(`Error processing fixture ${fixture.id}:`, error);
                continue;
            }
        }
        
        console.log(`Found ${fixturesToUpdate.length} fixtures that need time correction`);
        
        if (fixturesToUpdate.length === 0) {
            console.log('No fixtures need updating. Times are already correct.');
            return;
        }
        
        // Update fixtures in batches
        const batchSize = 10; // Smaller batches for updates
        for (let i = 0; i < fixturesToUpdate.length; i += batchSize) {
            const batch = fixturesToUpdate.slice(i, i + batchSize);
            
            console.log(`Updating batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(fixturesToUpdate.length / batchSize)}`);
            
            for (const fixture of batch) {
                const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/fixtures?id=eq.${fixture.id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        utc_kickoff: fixture.utc_kickoff
                    })
                });
                
                if (!updateResponse.ok) {
                    console.error(`Failed to update fixture ${fixture.id}:`, await updateResponse.text());
                } else {
                    console.log(`✓ Updated fixture ${fixture.id}`);
                }
            }
        }
        
        console.log('Timezone fix complete! All fixture times should now be correct.');
        
    } catch (error) {
        console.error('Timezone fix failed:', error);
    }
}

fixTimezoneIssue();