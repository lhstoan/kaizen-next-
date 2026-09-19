-- Products table, replaces the WordPress products/shop custom post type.
-- Colors are stored as jsonb ({name, code, images: string[]}[]) since they're a small,
-- product-owned list with no independent queries of their own.
create table if not exists products (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	category text not null,
	sizes text[] not null default '{}',
	price int not null default 0,
	is_new boolean not null default false,
	short_description text not null default '',
	image_url text not null default '',
	purchase_link text not null default '',
	colors jsonb not null default '[]',
	sort_order int not null default 0,
	active boolean not null default true,
	created_at timestamptz not null default now()
);

alter table products enable row level security;

create policy "Public can read products" on products
	for select
	using (true);

create policy "Authenticated can insert products" on products
	for insert
	to authenticated
	with check (true);

create policy "Authenticated can update products" on products
	for update
	to authenticated
	using (true)
	with check (true);

create policy "Authenticated can delete products" on products
	for delete
	to authenticated
	using (true);
