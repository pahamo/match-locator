Hand‑Off Guide for AI Coding Agents (Claude Code)

Overview
- Stack: React 19 + TypeScript + CRA 5, React Router, Supabase JS v2.
- Purpose: UK Premier League TV schedule (consumer pages + lightweight admin).
- Hosting: Netlify. Build uses a prebuild step for sitemap generation.

Environment
- Node: 20.x LTS recommended (use `.nvmrc`). Node 22 emits extra deprecation warnings.
- Package manager: npm.
- Required env (create `.env` in repo root or export before build):
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`
  - Optional: `REACT_APP_CANONICAL_BASE` (defaults to fixturesapp.netlify.app)

Quick Start
- `npm ci` (or `npm install`)
- `npm start` → dev server at http://localhost:3000
- `npm run build` → production build to `build/`
- Type check: `./node_modules/.bin/tsc -p tsconfig.json --noEmit`

Scripts
- `prebuild`: runs `scripts/generate_sitemaps.mjs` to emit `public/sitemaps/*` and update `public/sitemap.xml`.
- `build`: CRA build via `react-scripts build`.

Project Map
- `src/components/` → UI components (e.g., `Header.tsx`).
- `src/pages/` → Routes (Home, Fixtures, Clubs, Match, Provider, Admin).
- `src/services/` → Supabase access (`supabase.ts`, `supabase-simple.ts`).
- `src/utils/seo.ts` → SEO/metadata helpers.
- `public/` → static assets; sitemap index is written here.
- `netlify.toml` → redirects, headers, indexing controls.

Conventions
- React function components with TypeScript interfaces for props.
- External links that open in a new tab must include `rel="noreferrer noopener"`.
- Effects invoking local async functions should use `useCallback` for stable deps (see `AdminPage`).
- Keep changes minimal and focused; avoid mass refactors without tests.

Quality Checklist (before committing)
- Type-check passes: `tsc --noEmit`.
- Production build passes: `npm run build`.
- No new ESLint warnings related to `react-hooks/exhaustive-deps` or insecure links.
- Netlify headers/redirects unchanged unless intentionally modified.

Netlify / Deploy
- Indexing is disabled for production, preview, and branch deploys in `netlify.toml` via `X-Robots-Tag = "noindex"` while staging.
- For go‑live, remove that context block (or use the `release/go-live` branch, which is prepared to lift noindex).
- Typical deployment is via pushing to the configured branch; Netlify builds automatically.

Data / Supabase
- Uses anon key for read operations and a simple admin write. Rotate keys as needed.
- Import sample data: see `scripts/import_sample_fixtures.mjs` (requires env vars).
- Security: `config/.env` is ignored; do not commit any secrets. If any keys were pushed historically, rotate them in Supabase.

Known Notes
- A previous build error was fixed by adding optional `title` to `HeaderProps` and using it where pages pass a title.
- Admin page had a missing dependency warning; now uses `useCallback` helpers.
- Node 22 may show `fs.F_OK` deprecation warnings from dependencies; prefer Node 20 LTS.

Branching
- Working branch: `feature/sitemaps-canonical` (sitemaps + canonical links).
- Release prep: `release/go-live` (removes production noindex for launch).
- Main: production default branch.

Agent Tips
- Prefer `rg` for fast search, small targeted edits, and incremental commits.
- Validate with `tsc` and a full `npm run build` when changing component props, hooks, or SEO scripts.
- Keep `netlify.toml` coherent: don’t loosen CSP unless necessary.
