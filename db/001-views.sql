-- Canonical read-only views for the frontend (EPL-only)

-- 1) Teams used in EPL (competition_id = 1)
create or replace view public.teams_v as
select distinct t.id, t.slug, t.name, t.short_name, t.crest_url
from public.teams t
join (
  select home_team_id as team_id from public.fixtures where competition_id = 1
  union
  select away_team_id from public.fixtures where competition_id = 1
) pl on pl.team_id = t.id;

-- 2) EPL fixtures with names and badges (branding -> teams -> placeholder)
create or replace view public.fixtures_with_team_names_v as
select
  f.id,
  f.competition_id,
  f.utc_kickoff,
  f.matchday,
  ht.name as home_team,
  at.name as away_team,
  coalesce(
    hb.badge_url,
    ht.crest_url,
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="%23e5e7eb" stroke="%23111" stroke-width="1"/></svg>'
  ) as home_badge,
  coalesce(
    ab.badge_url,
    at.crest_url,
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="%23e5e7eb" stroke="%23111" stroke-width="1"/></svg>'
  ) as away_badge
from public.fixtures f
join public.teams ht on ht.id = f.home_team_id
left join public.team_branding hb on hb.team_id = ht.id
join public.teams at on at.id = f.away_team_id
left join public.team_branding ab on ab.team_id = at.id
where f.competition_id = 1;

-- 3) Minimal fixture view used by match pages (EPL-only)
create or replace view public.fixtures_min_v as
select id, utc_kickoff, home_team_id, away_team_id, venue
from public.fixtures
where competition_id = 1;

-- 4) Broadcasts (label can be enriched later)
create or replace view public.broadcasts_with_provider_v as
select
  b.id,
  b.fixture_id,
  b.provider_id,
  b.provider_id::text as provider_display_name,
  null::text as channel_name,
  b.stream_type,
  b.verified,
  b.verified_at
from public.broadcasts_uk b;