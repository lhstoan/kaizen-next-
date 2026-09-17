-- Public bucket for partner logo uploads from the admin panel.
insert into storage.buckets (id, name, public)
values ('partners', 'partners', true)
on conflict (id) do nothing;

create policy "Public can read partner logos"
on storage.objects for select
using (bucket_id = 'partners');

create policy "Authenticated can upload partner logos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'partners');

create policy "Authenticated can update partner logos"
on storage.objects for update
to authenticated
using (bucket_id = 'partners');

create policy "Authenticated can delete partner logos"
on storage.objects for delete
to authenticated
using (bucket_id = 'partners');
