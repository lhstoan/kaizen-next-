-- Admin panel writes as an authenticated Supabase user (email/password login),
-- not via the public anon key alone.
create policy "Authenticated can insert partners" on partners
	for insert
	to authenticated
	with check (true);

create policy "Authenticated can update partners" on partners
	for update
	to authenticated
	using (true)
	with check (true);

create policy "Authenticated can delete partners" on partners
	for delete
	to authenticated
	using (true);
