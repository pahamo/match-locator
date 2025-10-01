import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { generateBreadcrumbs } from '../utils/breadcrumbs';

interface AnalysisResult {
  competitions: Array<{
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    is_production_visible: boolean;
  }>;
  teamsByCompetition: Record<string, number>;
  teamsWithNullCompetition: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  fixturesByCompetition: Record<string, number>;
  championsLeagueTeams: {
    total: number;
    withCorrectCompetitionId: number;
    withoutCorrectCompetitionId: number;
    teamsNeedingUpdate: Array<{
      id: number;
      name: string;
      current_competition_id: number | null;
    }>;
  };
}

export default function DatabaseAnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeDatabase();
  }, []);

  const analyzeDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get all competitions
      const { data: competitions, error: compError } = await supabase
        .from('competitions')
        .select('id, name, slug, is_active, is_production_visible')
        .order('id');

      if (compError) throw compError;

      // 2. Count teams by competition_id
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, slug, competition_id');

      if (teamsError) throw teamsError;

      const teamsByCompetition: Record<string, number> = {};
      const teamsWithNullCompetition = teams.filter(team => team.competition_id === null);

      teams.forEach(team => {
        if (team.competition_id !== null) {
          const compName = competitions.find(c => c.id === team.competition_id)?.name || `Unknown (${team.competition_id})`;
          teamsByCompetition[compName] = (teamsByCompetition[compName] || 0) + 1;
        }
      });

      // 3. Count fixtures by competition_id
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures_with_teams')
        .select('competition_id');

      if (fixturesError) throw fixturesError;

      const fixturesByCompetition: Record<string, number> = {};
      fixtures.forEach(fixture => {
        if (fixture.competition_id !== null) {
          const compName = competitions.find(c => c.id === fixture.competition_id)?.name || `Unknown (${fixture.competition_id})`;
          fixturesByCompetition[compName] = (fixturesByCompetition[compName] || 0) + 1;
        }
      });

      // 4. Analyze Champions League teams
      const { data: clFixtures, error: clError } = await supabase
        .from('fixtures_with_teams')
        .select('home_team_id, away_team_id, home_team, away_team')
        .eq('competition_id', 2)
        .limit(100);

      if (clError) throw clError;

      // Get unique team IDs from Champions League fixtures
      const clTeamIds = new Set<number>();
      clFixtures.forEach(fixture => {
        clTeamIds.add(fixture.home_team_id);
        clTeamIds.add(fixture.away_team_id);
      });

      // Check how many of these teams have competition_id = 2
      const { data: clTeams, error: clTeamsError } = await supabase
        .from('teams')
        .select('id, name, competition_id')
        .in('id', Array.from(clTeamIds));

      if (clTeamsError) throw clTeamsError;

      const teamsWithClCompId = clTeams.filter(t => t.competition_id === 2);
      const teamsWithoutClCompId = clTeams.filter(t => t.competition_id !== 2);

      setAnalysis({
        competitions,
        teamsByCompetition,
        teamsWithNullCompetition: teamsWithNullCompetition.slice(0, 10),
        fixturesByCompetition,
        championsLeagueTeams: {
          total: clTeamIds.size,
          withCorrectCompetitionId: teamsWithClCompId.length,
          withoutCorrectCompetitionId: teamsWithoutClCompId.length,
          teamsNeedingUpdate: teamsWithoutClCompId.slice(0, 10).map(team => ({
            id: team.id,
            name: team.name,
            current_competition_id: team.competition_id
          }))
        }
      });

    } catch (err) {
      console.error('Database analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />
          <h1 className="text-3xl font-bold mb-6">Database Analysis</h1>
          <p>Analyzing database structure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />
          <h1 className="text-3xl font-bold mb-6">Database Analysis</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />
          <h1 className="text-3xl font-bold mb-6">Database Analysis</h1>
          <p>No analysis data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />
        <h1 className="text-3xl font-bold mb-6">Database Analysis</h1>

      <div className="grid gap-6">
        {/* Competitions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Competitions</h2>
          <div className="space-y-2">
            {analysis.competitions.map(comp => (
              <div key={comp.id} className="flex justify-between items-center">
                <span>{comp.id}: {comp.name} ({comp.slug})</span>
                <span className="text-sm text-gray-600">
                  Active: {comp.is_active ? '✅' : '❌'} |
                  Visible: {comp.is_production_visible ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Teams by Competition */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🏟️ Teams by Competition</h2>
          <div className="space-y-2">
            {Object.entries(analysis.teamsByCompetition).map(([compName, count]) => (
              <div key={compName} className="flex justify-between">
                <span>{compName}</span>
                <span className="font-mono">{count} teams</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teams with NULL competition_id */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">❌ Teams with NULL competition_id</h2>
          <p className="text-sm text-gray-600 mb-4">Showing first 10 of {analysis.teamsWithNullCompetition.length} teams</p>
          <div className="space-y-1">
            {analysis.teamsWithNullCompetition.map(team => (
              <div key={team.id} className="text-sm">
                {team.id}: {team.name} ({team.slug})
              </div>
            ))}
          </div>
        </div>

        {/* Fixtures by Competition */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">⚽ Fixtures by Competition</h2>
          <div className="space-y-2">
            {Object.entries(analysis.fixturesByCompetition).map(([compName, count]) => (
              <div key={compName} className="flex justify-between">
                <span>{compName}</span>
                <span className="font-mono">{count} fixtures</span>
              </div>
            ))}
          </div>
        </div>

        {/* Champions League Analysis */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🏆 Champions League Analysis</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold">{analysis.championsLeagueTeams.total}</div>
                <div className="text-sm text-gray-600">Teams in CL fixtures</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold">{analysis.championsLeagueTeams.withCorrectCompetitionId}</div>
                <div className="text-sm text-gray-600">With competition_id = 2</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold">{analysis.championsLeagueTeams.withoutCorrectCompetitionId}</div>
                <div className="text-sm text-gray-600">Missing competition_id = 2</div>
              </div>
            </div>

            {analysis.championsLeagueTeams.teamsNeedingUpdate.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Teams needing competition_id update:</h3>
                <div className="space-y-1 text-sm">
                  {analysis.championsLeagueTeams.teamsNeedingUpdate.map(team => (
                    <div key={team.id}>
                      {team.id}: {team.name} (current: {team.current_competition_id || 'NULL'})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}