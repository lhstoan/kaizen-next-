-- ONLY run this if you already ran an earlier copy of supabase_migration_members_matches.sql
-- that used the bare names `members` / `matches`. This Supabase project already hosts an
-- unrelated project's `members` and `matches` tables, so that version attached Kaizen's
-- RLS policies to those tables. This removes just the policies it added — it touches no data.
drop policy if exists "Public can read members" on members;
drop policy if exists "Authenticated can insert members" on members;
drop policy if exists "Authenticated can update members" on members;
drop policy if exists "Authenticated can delete members" on members;

drop policy if exists "Public can read matches" on matches;
drop policy if exists "Authenticated can insert matches" on matches;
drop policy if exists "Authenticated can update matches" on matches;
drop policy if exists "Authenticated can delete matches" on matches;

-- The same migration also ran `alter table ... enable row level security` on both tables.
-- If they had RLS disabled before, re-run these two lines as well; check first, because
-- disabling RLS on a table that is meant to have it exposes that project's data.
-- alter table members disable row level security;
-- alter table matches disable row level security;
