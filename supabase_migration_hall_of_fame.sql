-- Hall of Fame board: one row per season, showing that year's champion plus the
-- top scorers beside it. top_scorers is jsonb ({name, logo_url}[]) for the same
-- reason products.colors is: a small, row-owned list with no queries of its own.
create table if not exists hall_of_fame (
	id uuid primary key default gen_random_uuid(),
	year int not null,
	rank text not null default '1st',
	champion_name text not null default '',
	champion_logo_url text not null default '',
	top_scorers jsonb not null default '[]',
	sort_order int not null default 0,
	active boolean not null default true,
	created_at timestamptz not null default now()
);

alter table hall_of_fame enable row level security;

create policy "Public can read hall_of_fame" on hall_of_fame
	for select
	using (true);

create policy "Authenticated can insert hall_of_fame" on hall_of_fame
	for insert
	to authenticated
	with check (true);

create policy "Authenticated can update hall_of_fame" on hall_of_fame
	for update
	to authenticated
	using (true)
	with check (true);

create policy "Authenticated can delete hall_of_fame" on hall_of_fame
	for delete
	to authenticated
	using (true);
