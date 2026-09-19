-- One image per colorway + a separate list of descriptive shots.
-- Mirrors the legacy ACF layout (kaizen/archive-collections.php): colors is a fixed
-- Black/White/Navy/Red set where each entry holds a single image, and anything that
-- isn't a colorway (detail shots, size charts) now lives in gallery instead.
alter table products add column if not exists gallery text[] not null default '{}';

-- Collapse the old colors[].images array into colors[].image (first image wins).
update products
set colors = coalesce(
	(
		select jsonb_agg(
			jsonb_build_object(
				'name', c->>'name',
				'code', c->>'code',
				'image', coalesce(c->'images'->>0, c->>'image', '')
			)
			order by ord
		)
		from jsonb_array_elements(colors) with ordinality as t(c, ord)
	),
	'[]'::jsonb
)
where colors <> '[]'::jsonb
	and exists (
		select 1 from jsonb_array_elements(colors) as c where c ? 'images'
	);

-- Legacy category slug: "accessory" was never used by the WP theme, it ships "other".
update products set category = 'other' where category = 'accessory';
