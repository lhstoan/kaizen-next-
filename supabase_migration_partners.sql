-- Partners table, replaces the WordPress "partner" custom post type
-- (logo, main_partner, international_partners meta fields).
create table if not exists partners (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	logo_url text not null,
	main_partner boolean not null default false,
	international_partner boolean not null default false,
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

alter table partners enable row level security;

-- Public site only needs read access; writes go through the admin panel
-- with the service role / an authenticated admin policy added later.
create policy "Public can read partners" on partners
	for select
	using (true);
