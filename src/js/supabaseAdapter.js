// expose a single global to keep your existing jget indirection working
(() => {
  function getConfig(){
    const url = (window.__ENV && window.__ENV.VITE_SUPABASE_URL)
      || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url);
    const key = (window.__ENV && window.__ENV.VITE_SUPABASE_ANON_KEY)
      || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey);
    return {
      url: url || 'https://nkfuzkrazehjivzmdrvt.supabase.co',
      key: key || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey) || ''
    };
  }
  function getBase(){
    const c = getConfig();
    const base = `${c.url}/rest/v1`;
    return { base, headers: { apikey: c.key, Authorization: `Bearer ${c.key}` } };
  }

  function _normalizePath(path) {
    if (!path) return '';
    let p = String(path).trim();
    // If a full URL was passed, just return it and mark as absolute
    try {
      const u = new URL(p);
      return { absolute: true, url: u.toString() };
    } catch { /* not a full URL */ }
    // Strip leading base segment if caller included /rest/v1
    if (p.startsWith('/rest/v1')) p = p.slice('/rest/v1'.length);
    // Ensure it starts with a single slash
    if (!p.startsWith('/')) p = '/' + p;
    return { absolute: false, path: p };
  }

  async function _request(path, opts = {}) {
    const norm = _normalizePath(path);
    const { base, headers } = getBase();
    const url = norm && norm.absolute ? norm.url : (norm && norm.path ? (base + norm.path) : base);
    try {
      const res = await fetch(url, {
        method: opts.method || 'GET',
        headers: { ...headers, 'Content-Type': 'application/json', ...(opts.headers || {}) },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn(`[SupabaseAdapter] ${res.status} on ${url}`, text);
        return [];
      }
      return await res.json();
    } catch (err) {
      console.warn('[SupabaseAdapter] network error', err);
      return [];
    }
  }

  // already used by your index.html:
  async function jget(path) {
    return _request(path);
  }

  // ---- New: typed(ish) helpers for fixtures & providers ----

  // Map rows from fixtures view; providers injected separately via providersByFixture
  function mapFixtureRow(row, providersByFixture = {}) {
    const kickoffIso = row.utc_kickoff || row.kickoff_utc || null;
    const mw = (row.matchweek ?? row.matchday) ?? null;
    const home = {
      id: row.home_team_id || (row.home_team && row.home_team.id),
      name: row.home_name || (row.home_team && row.home_team.name),
      slug: row.home_slug || (row.home_team && row.home_team.slug),
      crest: row.home_crest || (row.home_team && row.home_team.crest_url) || null,
    };
    const away = {
      id: row.away_team_id || (row.away_team && row.away_team.id),
      name: row.away_name || (row.away_team && row.away_team.name),
      slug: row.away_slug || (row.away_team && row.away_team.slug),
      crest: row.away_crest || (row.away_team && row.away_team.crest_url) || null,
    };
    const providers = providersByFixture[row.id] || [];

    return {
      id: row.id,
      sport: 'football',
      competition: 'premier-league',
      matchweek: mw,
      kickoff_utc: kickoffIso,
      venue: row.venue ?? null,
      home: { id: home.id, name: home.name, slug: home.slug, crest: home.crest || null },
      away: { id: away.id, name: away.name, slug: away.slug, crest: away.crest || null },
      providers_uk: providers,
      blackout: row.blackout ? { is_blackout: !!row.blackout, reason: row.blackout_reason || null } : { is_blackout: false },
      status: row.status || 'scheduled',
    };
  }

  async function getFixtures({ teamSlug, dateFrom, dateTo, limit = 100, order = 'asc', competitionId } = {}) {
    const select =
      'id,matchday,utc_kickoff,venue,status,blackout,blackout_reason,' +
      'home_team_id,home_name,home_slug,home_crest,' +
      'away_team_id,away_name,away_slug,away_crest';

    const params = new URLSearchParams({
      select,
      order: `utc_kickoff.${order}`,
      limit: String(limit),
    });
    if (dateFrom) params.append('utc_kickoff', `gte.${dateFrom}`);
    if (dateTo) params.append('utc_kickoff', `lte.${dateTo}`);
    if (competitionId) params.set('competition_id', `eq.${competitionId}`);

    const rows = await _request(`/fixtures_with_team_names_v?${params.toString()}`);
    // Enrich providers in a second step
    const ids = (rows || []).map(r => r.id).filter(Boolean);
    let providersByFixture = {};
    if (ids.length) {
      const bcasts = await getBroadcastsForFixtures(ids);
      const providerIds = Array.from(new Set((bcasts || []).map(b => b.provider_id).filter(Boolean)));
      const provs = providerIds.length ? await getProvidersByIds(providerIds) : [];
      const byPk = Object.fromEntries((provs || []).map(p => [String(p.originalId), p]));
      for (const b of (bcasts || [])) {
        const fId = b.fixture_id;
        const p = byPk[String(b.provider_id)];
        const entry = p ? { id: p.id, name: p.name, type: p.type, href: p.href, status: 'confirmed' } : null;
        if (!providersByFixture[fId]) providersByFixture[fId] = [];
        if (entry) providersByFixture[fId].push(entry);
      }
    }
    let mapped = (rows || []).map(r => mapFixtureRow(r, providersByFixture));

    if (teamSlug) {
      mapped = mapped.filter(fx => fx.home.slug === teamSlug || fx.away.slug === teamSlug);
    }
    return Array.isArray(mapped) ? mapped : [];
  }

  async function getFixtureById(id) {
    if (!id) return undefined;
    const select =
      'id,matchday,utc_kickoff,venue,status,blackout,blackout_reason,' +
      'home_team_id,home_name,home_slug,home_crest,' +
      'away_team_id,away_name,away_slug,away_crest';
    const rows = await _request(`/fixtures_with_team_names_v?id=eq.${encodeURIComponent(id)}&select=${encodeURIComponent(select)}&limit=1`);
    const row = rows[0];
    if (!row) return undefined;
    const bcasts = await getBroadcastsForFixtures([row.id]);
    const providerIds = Array.from(new Set((bcasts || []).map(b => b.provider_id).filter(Boolean)));
    const provs = providerIds.length ? await getProvidersByIds(providerIds) : [];
    const byPk = Object.fromEntries((provs || []).map(p => [String(p.originalId), p]));
    const providersByFixture = {};
    providersByFixture[row.id] = (bcasts || []).map(b => {
      const p = byPk[String(b.provider_id)];
      return p ? { id: p.id, name: p.name, type: p.type, href: p.href, status: 'confirmed' } : null;
    }).filter(Boolean);
    return mapFixtureRow(row, providersByFixture);
  }

  // Query broadcasts for a set of fixture IDs from broadcasts_uk
  async function getBroadcastsForFixtures(ids = []) {
    try {
      if (!ids || !ids.length) return [];
      const or = ids.map(id => `fixture_id.eq.${encodeURIComponent(id)}`).join(',');
      // Only select columns we know exist
      const rows = await _request(`/broadcasts_uk?or=(${or})&select=fixture_id,provider_id`);
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      console.warn('[SupabaseAdapter] getBroadcastsForFixtures error', e);
      return [];
    }
  }

  async function getProvidersByIds(ids = []) {
    let rows = [];
    if (!ids.length) {
      rows = await _request(`/providers?select=id,slug,display_name,type,url&order=display_name.asc`);
    } else {
      const list = ids.map(id => `id.eq.${encodeURIComponent(id)}`).join(',');
      rows = await _request(`/providers?or=(${list})&select=id,slug,display_name,type,url`);
    }
    return (rows || []).map(p => ({
      id: p.slug || p.id,
      originalId: p.id,
      name: p.display_name || p.name || 'Unknown',
      type: p.type || 'unknown',
      href: p.url || undefined,
    }));
  }

  // expose
  window.SupabaseAdapter = {
    jget, // legacy
    getFixtures,
    getFixtureById,
    getBroadcastsForFixtures,
    getProvidersByIds,
  };
})();
