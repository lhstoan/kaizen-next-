-- "Hot news" cards on the homepage. featured rows render as the wide cards in the
-- second row of the mockup; the rest fill the three-up grid above them.
create table if not exists news (
	id uuid primary key default gen_random_uuid(),
	label_en text not null default 'Players',
	label_jp text not null default 'プレイヤー',
	title text not null default '',
	link text not null default '',
	image_url text not null default '',
	featured boolean not null default false,
	sort_order int not null default 0,
	active boolean not null default true,
	created_at timestamptz not null default now()
);

alter table news enable row level security;

create policy "Public can read news" on news
	for select
	using (true);

create policy "Authenticated can insert news" on news
	for insert
	to authenticated
	with check (true);

create policy "Authenticated can update news" on news
	for update
	to authenticated
	using (true)
	with check (true);

create policy "Authenticated can delete news" on news
	for delete
	to authenticated
	using (true);
