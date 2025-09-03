-- A) Fixtures + team names (for homepage list)
create or replace view fixtures_with_team_names_v as
select
  f.id,
  f.utc_kickoff,
  f.matchday,
  ht.name as home_team,
  at.name as away_team
from fixtures f
join teams ht on ht.id = f.home_team_id
join teams at on at.id = f.away_team_id;

comment on view fixtures_with_team_names_v is 'Homepage: fixture + team names. Source of truth for SPA list.';

-- B) Minimal fixture shape (for match page header)
create or replace view fixtures_min_v as
select
  f.id,
  f.utc_kickoff,
  f.home_team_id,
  f.away_team_id,
  f.venue,
  coalesce(f.status, 'scheduled') as status,
  f.matchday
from fixtures f;

comment on view fixtures_min_v is 'Match page header: minimal fixture fields.';

-- C) Broadcasts joined to provider display name
create or replace view broadcasts_with_provider_v as
select
  b.fixture_id,
  b.provider_id,
  b.channel_name,
  b.stream_type,
  b.verified,
  b.verified_at,
  p.display_name as provider_display_name
from broadcasts_uk b
join providers p on p.id = b.provider_id;

comment on view broadcasts_with_provider_v is 'Match page: broadcasts + provider name.';

-- D) Provider → affiliate url mapping (only what SPA needs)
create or replace view affiliate_min_v as
select provider_id, affiliate_url
from affiliate_destinations;

comment on view affiliate_min_v is 'Affiliate URL lookup by provider.';