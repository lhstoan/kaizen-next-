# CLAUDE.md

Kaizen Badminton club site — Next.js rebuild replacing legacy WP theme at `D:\Kaizenbadminton`
(that repo's HTML/PHP = markup/CSS source of truth when porting new sections; port, don't reimplement design).

## Token-efficiency rules (mandatory)
- Don't scan whole repo per task. Read only files directly relevant.
- Don't reread unchanged files. Don't rediscover architecture — it's below.
- Skip `node_modules`, `.next`, `public/images|fonts|favicon` unless task needs them.
- Minimal diff, no unrelated refactor, no full-file rewrites for small edits.
- Reuse existing component/hook/util/type before creating new one.
- Don't install deps unless necessary.

## Tech stack
Next.js App Router, React 19, TypeScript. Path alias `@/*` → `src/*`.
- **Public site**: legacy compiled CSS as-is (no Tailwind). `next/image` is used in Partners/Members/MatchItem; keep plain `<img>` only where legacy CSS needs the aspect-ratio placeholder trick (`ProductCard`).
- **Admin**: Tailwind v4 + shadcn/ui (radix-ui + class-variance-authority), react-hook-form + zod, framer-motion (entrance anim + `Reorder` for drag-and-drop), sonner (toasts), lucide-react (icons).
- **Shared**: swiper (public Members carousel; admin per-color image gallery via `Thumbs` module).
- **Backend**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — Postgres + Auth + RLS. No separate API server.

Commands: `npm run dev`, `npm run build`, `npm run lint`. No test runner.

## Project map
```
src/
  app/
    (site)/            → public routes: page.tsx (home), matches/, products/
                          (site)/layout.tsx injects legacy <link> CSS/fonts, wraps Header/Footer
    admin/
      login/           → public login page (Supabase signInWithPassword)
      (protected)/     → auth-gated (layout.tsx redirects to /admin/login if no user)
        partners/      → full CRUD (simplest reference — copy for a flat list section)
        products/      → full CRUD (richest reference — color variants, per-color image gallery)
        members/ matches/  → placeholder "Coming soon" (ComingSoon component), NOT built
      loading.tsx, (protected)/loading.tsx → branded spinner
    api/admin/images/route.ts → recursive fs readdir of public/images, feeds image picker
    layout.tsx         → root layout, minimal (font only) — do not add site chrome here
  components/
    site/     → public components, legacy class names, NO Tailwind (Header, Footer, MainVisual,
                Members, Matches, MatchItem, Partners, ProductCard, ProductGrid, SectionHeading, BodyAttrs)
    admin/    → admin-only: admin-sidebar, admin-loading, coming-soon, partners-manager,
                products-manager, image-picker-dialog, sign-out-button
    ui/       → shadcn primitives (button, input, label, dialog, table, checkbox, card, badge, sonner)
                — reuse these, don't hand-roll new primitives
  lib/
    supabase/client.ts (browser), supabase/server.ts (server, async cookies)
    partners.ts         → getPartnerGroups() server query (main/international/other split)
    products.ts         → getProducts() server query (snake_case row → camelCase Product)
    placeholder-data.ts → mock Members/Matches data, still used by home + /matches
  types/home.ts (Member, Match, Partner), product.ts (Product, ProductColor, PRODUCT_CATEGORIES)
src/middleware.ts        → refreshes Supabase session cookie, matcher: /admin/:path*
public/css, images, fonts, favicon  → copied verbatim from legacy repo; keep filenames in sync
                           (some contain spaces, e.g. "images/logo moi/..." — quote in CSS url())
                           EXCEPT css/site-overrides.css → hand-written, not compiled from legacy scss
```

## Feature boundaries
Work on one, don't touch others unless direct dependency:
- **Partners** — done (CRUD + drag-reorder). Reference for a flat list section.
- **Products** — done (CRUD + drag-reorder + inline active toggle + color variants). Reference for anything with nested/array fields. Public `/products` reads Supabase.
- **Members / Matches (admin)** — not built, currently `ComingSoon` placeholder only; public home + `/matches` still read `placeholder-data.ts`.
- **Public site pages** (home/matches/products) — independent of admin; only share `types/` and, once wired, Supabase tables.
- **Auth/middleware** — only touch when changing admin session/login behavior.
- **Image picker** (`api/admin/images` + `image-picker-dialog.tsx`) — shared by any admin form needing an image field; reuse, don't duplicate.

## Public site rules (critical)
- Keep legacy class names exactly (`iHeader`, `iMainvisual`, `iMember--list`, `en`/`jp` spans, ...) — legacy CSS selects on them.
- No Tailwind utility classes, no CSS modules on public-site components.
- Don't hand-edit `public/css/*.css` — recompile from `.scss` in `D:\Kaizenbadminton\scss/` and re-copy.
- When porting a new section: read `kaizen/*.php` in the legacy repo first (PHP is authoritative over root static `.html`, which may be stale). Split repeated markup into small reusable components (e.g. `MatchItem`/`TeamBlock` pattern) — don't inline-duplicate JSX across pages.
- Legacy CSS relies on a "transparent placeholder `<img>` + background-image sibling" trick for aspect ratio — don't swap plain `<img>` for `next/image fill` on these.

## Admin rules
- Use shadcn/ui primitives in `components/ui/`; extend via `className`/cva variants, don't fork a new dialog/button/table.
- Brand color `#e00327` for primary actions (buttons, active nav, badges).
- New CRUD section (Members/Matches) → copy `partners-manager.tsx` + `lib/partners.ts` (flat fields) or `products-manager.tsx` + `lib/products.ts` (array/nested fields via `useFieldArray`): server component fetches, client component owns form (react-hook-form+zod) + table + Supabase mutations + toast.
- New Supabase table → SQL migration file at repo root (`supabase_migration_<name>.sql`), public SELECT RLS + authenticated write RLS, matching pattern in existing `supabase_migration_partners*.sql`.
- Reorder features → framer-motion `Reorder.Group`/`Reorder.Item` (`as="tbody"`/`as="tr"`), persist `sort_order` via `Promise.all` of per-row updates, not a batch RPC (none exists yet).

## Coding workflow
1. Understand request. 2. Identify minimum files (use map above). 3. Read only those. 4. Smallest safe change. 5. Verify affected feature only (browser check for UI). 6. Stop.

## Debugging workflow
1. Symptom. 2. Trace smallest relevant path (site vs admin vs lib vs Supabase). 3. Read only required files. 4. Root cause. 5. Minimal fix. 6. Verify.
Known recurring env issue: stale Turbopack cache on Windows shows already-fixed code as errors — kill port 3000 process + `rm -rf .next` + restart, don't debug further before ruling this out.

## Response format
Implementation:
```
DONE
- Changed: `file`
- Result: one sentence
- Verify: one sentence
```
Bug:
```
ROOT CAUSE: one sentence
FIX: `file`
VERIFY: one sentence
```
No long summaries unless asked.
