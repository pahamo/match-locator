-- Public read access to views; service role access to tables/sequences

grant usage on schema public to anon, authenticated;

grant select on public.teams_v,
               public.fixtures_with_team_names_v,
               public.fixtures_min_v,
               public.broadcasts_with_provider_v
to anon, authenticated;

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;