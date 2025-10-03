import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface CompetitionUpdate {
  competitionId: number;
  competitionName: string;
  teamCount: number;
  teams: Array<{
    id: number;
    name: string;
    currentCompetitionId: number | null;
  }>;
}

export default function AdminFixDataPage() {
  const [updates, setUpdates] = useState<CompetitionUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResults, setUpdateResults] = useState<string[]>([]);

  useEffect(() => {
    analyzeUpdatesNeeded();
  }, []);

  const analyzeUpdatesNeeded = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all competitions
      const { data: competitions, error: compError } = await supabase
        .from('competitions')
        .select('id, name')
        .eq('is_active', true)
        .order('id');

      if (compError) throw compError;

      const updatesList: CompetitionUpdate[] = [];

      for (const competition of competitions) {
        // Get all fixtures for this competition
        const { data: fixtures, error: fixturesError } = await supabase
          .from('fixtures_with_teams')
          .select('home_team_id, away_team_id, home_team, away_team')
          .eq('competition_id', competition.id);

        if (fixturesError) throw fixturesError;

        if (!fixtures || fixtures.length === 0) continue;

        // Get unique team IDs from fixtures
        const teamIds = new Set<number>();
        fixtures.forEach(fixture => {
          teamIds.add(fixture.home_team_id);
          teamIds.add(fixture.away_team_id);
        });

        if (teamIds.size === 0) continue;

        // Check which teams need updating
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, competition_id')
          .in('id', Array.from(teamIds));

        if (teamsError) throw teamsError;

        // Find teams that don't have the correct competition_id
        const teamsNeedingUpdate = teams.filter(team => team.competition_id !== competition.id);

        if (teamsNeedingUpdate.length > 0) {
          updatesList.push({
            competitionId: competition.id,
            competitionName: competition.name,
            teamCount: teamsNeedingUpdate.length,
            teams: teamsNeedingUpdate.map(team => ({
              id: team.id,
              name: team.name,
              currentCompetitionId: team.competition_id
            }))
          });
        }
      }

      setUpdates(updatesList);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamCompetitions = async () => {
    try {
      setIsUpdating(true);
      setUpdateResults([]);
      const results: string[] = [];

      for (const update of updates) {
        results.push(`\n🏆 Updating ${update.competitionName} teams...`);

        let successCount = 0;
        let errorCount = 0;

        for (const team of update.teams) {
          try {
            const { error } = await supabase
              .from('teams')
              .update({ competition_id: update.competitionId })
              .eq('id', team.id);

            if (error) {
              results.push(`❌ Failed to update ${team.name}: ${error.message}`);
              errorCount++;
            } else {
              results.push(`✅ Updated ${team.name} (${team.currentCompetitionId || 'NULL'} → ${update.competitionId})`);
              successCount++;
            }
          } catch (err) {
            results.push(`❌ Failed to update ${team.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            errorCount++;
          }
        }

        results.push(`📊 ${update.competitionName}: ${successCount} successful, ${errorCount} failed`);
        setUpdateResults([...results]);
      }

      results.push(`\n🎉 Update process completed!`);
      results.push(`📝 Recommendation: Refresh the database analysis page to verify changes.`);
      setUpdateResults(results);

      // Refresh the analysis
      await analyzeUpdatesNeeded();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error during update');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Fix Team Competition Data</h1>
        <p>Analyzing data that needs to be fixed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Fix Team Competition Data</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  const totalUpdatesNeeded = updates.reduce((sum, update) => sum + update.teamCount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Fix Team Competition Data</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">📋 What this tool does</h2>
        <p className="text-sm text-gray-700">
          This tool identifies teams that participate in competition fixtures but don't have the correct competition_id set in the teams table.
          It will update each team's competition_id to match the competition they actually participate in based on fixture data.
        </p>
      </div>

      {totalUpdatesNeeded === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">✅ All teams have correct competition_id</h2>
          <p className="text-green-700">No updates needed! All teams that participate in fixtures already have the correct competition_id set.</p>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ {totalUpdatesNeeded} teams need updates</h2>
            <p className="text-yellow-700 mb-4">
              The following teams participate in competition fixtures but don't have the correct competition_id:
            </p>

            <div className="space-y-4">
              {updates.map(update => (
                <div key={update.competitionId} className="bg-white rounded border p-4">
                  <h3 className="font-semibold mb-2">
                    🏆 {update.competitionName} (ID: {update.competitionId}) - {update.teamCount} teams
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    {update.teams.map(team => (
                      <div key={team.id} className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">{team.name}</div>
                        <div className="text-gray-600">
                          {team.currentCompetitionId || 'NULL'} → {update.competitionId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={updateTeamCompetitions}
              disabled={isUpdating}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {isUpdating ? 'Updating...' : `Update ${totalUpdatesNeeded} Teams`}
            </button>
          </div>
        </>
      )}

      {updateResults.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">📝 Update Results</h2>
          <div className="space-y-1 text-sm font-mono">
            {updateResults.map((result, index) => (
              <div key={index} className={`
                ${result.includes('❌') ? 'text-red-600' : ''}
                ${result.includes('✅') ? 'text-green-600' : ''}
                ${result.includes('🏆') || result.includes('📊') ? 'font-semibold' : ''}
                ${result.includes('🎉') ? 'text-blue-600 font-semibold' : ''}
              `}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">🔗 Related Pages</h3>
        <div className="space-y-1 text-sm">
          <a href="/database-analysis" className="text-blue-600 hover:underline block">
            📊 Database Analysis - View current data structure
          </a>
          <a href="/competitions/champions-league/group-stage" className="text-blue-600 hover:underline block">
            🏆 Champions League Page - Test the fix
          </a>
          <a href="/admin/teams" className="text-blue-600 hover:underline block">
            👥 Admin Teams - Manage team data
          </a>
        </div>
      </div>
    </div>
  );
}