-- Players shown on the homepage carousel and the team member grid.
create table if not exists kaizen_members (
	id uuid primary key default gen_random_uuid(),
	full_name text not null default '',
	gender text not null default 'men',
	nationality text not null default 'vn',
	event text[] not null default '{}',
	photo_url text not null default '',
	sort_order int not null default 0,
	active boolean not null default true,
	created_at timestamptz not null default now()
);

-- Fixtures and results. score_home/score_away stay null until the match is played;
-- the site shows time_label instead while they are.
create table if not exists kaizen_matches (
	id uuid primary key default gen_random_uuid(),
	round int not null default 1,
	date text not null default '',
	tournament_name text not null default '',
	court_location text not null default '',
	kaizen_is_home boolean not null default true,
	opponent_name text not null default '',
	opponent_logo_url text not null default '',
	time_label text not null default '',
	score_home int,
	score_away int,
	sort_order int not null default 0,
	active boolean not null default true,
	created_at timestamptz not null default now()
);

alter table kaizen_members enable row level security;
alter table kaizen_matches enable row level security;

create policy "Public can read kaizen_members" on kaizen_members for select using (true);
create policy "Authenticated can insert kaizen_members" on kaizen_members for insert to authenticated with check (true);
create policy "Authenticated can update kaizen_members" on kaizen_members for update to authenticated using (true) with check (true);
create policy "Authenticated can delete kaizen_members" on kaizen_members for delete to authenticated using (true);

create policy "Public can read kaizen_matches" on kaizen_matches for select using (true);
create policy "Authenticated can insert kaizen_matches" on kaizen_matches for insert to authenticated with check (true);
create policy "Authenticated can update kaizen_matches" on kaizen_matches for update to authenticated using (true) with check (true);
create policy "Authenticated can delete kaizen_matches" on kaizen_matches for delete to authenticated using (true);

-- Month caption above the homepage matches block.
insert into site_settings (key, value) values ('matches_month', 'September')
on conflict (key) do nothing;
