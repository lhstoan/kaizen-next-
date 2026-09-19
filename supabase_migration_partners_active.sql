-- Adds an "active" flag to partners so admins can hide a sponsor
-- from the public site without deleting it.
alter table partners
	add column if not exists active boolean not null default true;
