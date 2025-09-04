-- EPL data quality audit view (20 rows expected)

create or replace view public.pl_team_audit_v as
with pl as (
  select home_team_id as team_id from public.fixtures where competition_id = 1
  union
  select away_team_id from public.fixtures where competition_id = 1
)
select
  t.id                                   as team_id,
  t.slug,
  t.name,
  coalesce(t.short_name, t.name)         as short_name,
  (t.crest_url is not null)              as has_crest_in_teams,
  x.external_id                          as tsdb_id,
  (select count(*)
     from public.fixtures f
     where f.competition_id = 1
       and (f.home_team_id = t.id or f.away_team_id = t.id)
  )                                      as fixture_count
from public.teams t
join pl on pl.team_id = t.id
left join public.team_external_ids x on x.source = 'tsdb' and x.team_id = t.id
order by t.name;

grant select on public.pl_team_audit_v to anon, authenticated;