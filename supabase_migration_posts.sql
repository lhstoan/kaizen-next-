-- Blog posts. Body is plain text, split into paragraphs on render, so nothing the
-- admin types can inject markup into the public page.
create table if not exists kaizen_posts (
	id uuid primary key default gen_random_uuid(),
	title text not null default '',
	slug text not null unique,
	excerpt text not null default '',
	body text not null default '',
	cover_url text not null default '',
	published_at text not null default '',
	sort_order int not null default 0,
	active boolean not null default true,
	created_at timestamptz not null default now()
);

alter table kaizen_posts enable row level security;

create policy "Public can read kaizen_posts" on kaizen_posts for select using (true);
create policy "Authenticated can insert kaizen_posts" on kaizen_posts for insert to authenticated with check (true);
create policy "Authenticated can update kaizen_posts" on kaizen_posts for update to authenticated using (true) with check (true);
create policy "Authenticated can delete kaizen_posts" on kaizen_posts for delete to authenticated using (true);
