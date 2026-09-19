-- Small key/value store for the bits of the public site the club edits directly:
-- the main visual banners and the footer's social links. One table instead of a
-- column per setting, so a new setting is a row, not a migration.
create table if not exists site_settings (
	key text primary key,
	value text not null default '',
	updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

create policy "Public can read site_settings" on site_settings
	for select
	using (true);

create policy "Authenticated can insert site_settings" on site_settings
	for insert
	to authenticated
	with check (true);

create policy "Authenticated can update site_settings" on site_settings
	for update
	to authenticated
	using (true)
	with check (true);

-- Current hard-coded values become the starting row set.
insert into site_settings (key, value) values
	('banner_pc', '/images/banner.png'),
	('banner_sp', '/images/banner-sp.jpg'),
	('facebook_url', 'https://www.facebook.com/profile.php?id=61572834952468'),
	('tiktok_url', 'https://www.tiktok.com/@kaizen.badminton'),
	('youtube_url', 'https://www.youtube.com/@KaizenBadmintonHouse')
on conflict (key) do nothing;
