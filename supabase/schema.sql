-- Pitch, Hitch, or Ditch: Supabase schema.
-- Run this once in the Supabase SQL Editor (safe to re-run on a fresh project).
-- Also enable Authentication > Providers > Anonymous Sign-Ins.

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_uid uuid not null default auth.uid(),
  status text not null default 'lobby',      -- lobby | prep | pitch | summary | over
  round int not null default 0,
  prep_ends_at timestamptz,                  -- null while cards are dealt but the clock hasn't started
  pitch_order uuid[] not null default '{}',
  pitch_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  owner_uid uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 24),
  collected text[] not null default '{}',
  finished_round int,
  finish_order int,
  last_result text,
  created_at timestamptz not null default now(),
  unique (game_id, name)
);

create table if not exists hands (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  round int not null,
  persona jsonb not null,
  product jsonb not null,
  stage text not null,
  unique (team_id, round)
);

create or replace function server_now() returns timestamptz
language sql stable as $$ select now() $$;

create or replace function is_host(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from games where id = gid and host_uid = auth.uid())
$$;

alter table games enable row level security;
alter table teams enable row level security;
alter table hands enable row level security;

-- games: anyone signed in (anonymously) can look a game up by code; only its host can change it
create policy games_select on games for select to authenticated using (true);
create policy games_insert on games for insert to authenticated with check (host_uid = auth.uid());
create policy games_update on games for update to authenticated using (host_uid = auth.uid());
create policy games_delete on games for delete to authenticated using (host_uid = auth.uid());

-- teams: visible to everyone in the game (names and collected cards are public);
-- a team can only be created for its own device, only while the game is in the lobby
create policy teams_select on teams for select to authenticated using (true);
create policy teams_insert on teams for insert to authenticated with check (
  owner_uid = auth.uid()
  and exists (select 1 from games g where g.id = game_id and g.status = 'lobby')
);
create policy teams_update on teams for update to authenticated using (is_host(game_id));
create policy teams_delete on teams for delete to authenticated using (is_host(game_id));

-- hands: PRIVATE. Only the team that owns the hand, and the host, can read it. Only the host can write.
create policy hands_select on hands for select to authenticated using (
  is_host(game_id)
  or exists (select 1 from teams t where t.id = team_id and t.owner_uid = auth.uid())
);
create policy hands_insert on hands for insert to authenticated with check (is_host(game_id));
create policy hands_update on hands for update to authenticated using (is_host(game_id));
create policy hands_delete on hands for delete to authenticated using (is_host(game_id));

-- live updates
alter publication supabase_realtime add table games, teams, hands;
