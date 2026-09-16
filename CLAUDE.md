# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

Kaizen Badminton club marketing site — Next.js rebuild replacing the old WordPress theme at
`D:\Kaizenbadminton` (`kaizen/` PHP theme + `wp-content/` deployed snapshot). That repo's
`CLAUDE.md` documents the legacy theme in detail; treat its root static HTML (`index.html`,
`product.html`, `matchs.html`, ...) and `kaizen/*.php` templates as the **content/markup/CSS
source of truth** when porting a page — this repo doesn't reimplement design, it ports it.

## Tech stack

- Next.js (App Router), React 19, TypeScript
- Tailwind v4 (`@import "tailwindcss"` in `src/app/globals.css`) — scoped to the **admin** UI only;
  the public site reuses the legacy compiled CSS as-is (see below), not Tailwind classes
- Radix UI primitives (dialog, dropdown-menu, select, tabs) + react-hook-form + zod — for admin
  forms/CRUD, same pattern as `D:\OutSource\badminton`'s `src/components/ui/*`, but no shadcn
  wrapper layer has been created yet in this repo
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — DB + auth for the admin panel; not wired up
  yet (client/schema not created)

## Commands

```bash
npm run dev      # next dev
npm run build    # next build
npm run lint     # eslint
```

No test runner configured yet.

## Public site: porting legacy markup (important)

The public pages are **not** written with Tailwind. They reuse the original theme's compiled CSS
verbatim, loaded as plain stylesheets in `src/app/layout.tsx`:

```
public/css/styles.css        (compiled from the old repo's scss/, don't hand-edit — see below)
public/css/responsive.css
public/css/slick.css
public/images/, public/fonts/, public/favicon/, favicon.ico   (copied 1:1 from the old repo)
```

When porting a page/section from the old repo:
1. Read the equivalent `kaizen/*.php` template first (not the root static `.html` — the PHP
   version is the actively-maintained one and encodes the real data shape: WordPress custom post
   types/ACF fields via `get_field()`/`WP_Query`). The static HTML files are older prototypes and
   may be missing sections the PHP version has (or vice versa) — cross-check both, PHP wins on
   conflict.
2. Keep the original class names exactly (`iHeader`, `iMainvisual`, `iMember--list`, `ih3`, `en`/`jp`
   spans, etc.) — the legacy CSS selects on them, renaming breaks styling silently.
3. Model each PHP `WP_Query` loop as a typed prop (see `src/types/home.ts`) fed by placeholder data
   for now (`src/lib/placeholder-data.ts`) — this is what Supabase tables should eventually replace,
   one table per WP custom post type (`member`, `matches`, `partner`, ...).
4. Interactive bits that were jQuery in `js/common.js`/`js/top.js` (hamburger toggle, header
   scroll-shrink class, slick carousel) get reimplemented as small client components with
   `useState`/`useEffect` — don't reintroduce jQuery/slick as a dependency for behavior this simple.

If you need to re-derive `styles.css` after a design change, edit the `.scss` in the old repo
(`D:\Kaizenbadminton\scss/`) and recompile there, then re-copy the output — this repo's `public/css`
is a copied build artifact, not a source file.

## Layout

```
src/
  app/                Next.js App Router routes; layout.tsx loads legacy CSS + fonts globally
  components/
    site/             Public-site components ported from the legacy theme (Header, Footer,
                       MainVisual, Members, Matches, Partners, ...) — legacy class names, no Tailwind
    (admin components go in components/admin/ once the admin panel starts, following the
    Radix + Tailwind + react-hook-form + zod pattern from D:\OutSource\badminton's src/components/ui/*)
  types/home.ts        Typed shapes for ported WP data (Member, Match, Partner)
  lib/placeholder-data.ts  Stand-in data until Supabase tables exist
public/
  css/, images/, fonts/, favicon/   copied verbatim from the legacy repo, paths must stay in sync
```

## Conventions

- Path alias: `@/*` → `src/*`.
- Public-site components: plain legacy CSS class names, no Tailwind utility classes, no CSS
  modules — mixing systems on the same element defeats the point of reusing the compiled CSS.
- Admin components (once built): Tailwind + Radix, one shared primitive per visual pattern (mirror
  the "search before creating" / no-duplicate-Button-or-Dialog rule from `D:\OutSource\badminton`'s
  CLAUDE.md) rather than hand-rolled styled divs.
- Images: use `next/image`; several legacy asset paths contain spaces (`images/logo moi/...`) —
  keep them quoted/escaped as-is rather than renaming files, since the old repo and its CSS/PHP
  still reference the same filenames.
