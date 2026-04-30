# Frontend Product Contract

## Product intent
The gctl frontend is the consumer-facing control plane for policy-constrained autonomous execution. It must make trust and reliability visible while keeping the happy path fast for first-time operators.

## Primary personas
- **Treasury operator (new):** wants guided setup and confidence that actions are safe.
- **Protocol operator (advanced):** needs quick status scanning, filtering, and direct evidence drill-down.
- **Compliance reviewer:** needs policy and execution proof artifacts without deep code context.

## Core journeys
1. **Onboarding and readiness**
   - User lands on dashboard and runs environment readiness checks.
   - User sees pass/fail status for indexer connectivity and data freshness.
2. **Policy understanding**
   - User browses active policies, hashes, and URIs.
   - User can identify stale or inactive policy records quickly.
3. **Run monitoring**
   - User reviews deterministic and swarm run outcomes with terminal states.
   - User sees fail-closed alerts and can pivot to run details.
4. **Evidence review**
   - User inspects identity and attestation surfaces in one place.
   - User can trace from a run to its audit path and proof metadata.
5. **Operations and settings**
   - User configures endpoints and operating mode with clear defaults.
   - User can tell whether the environment is in demo-safe or production mode.

## Information architecture
- **Dashboard:** high-signal overview, alerts, and status cards.
- **Onboarding:** environment checks and guided first-run workflow.
- **Policies:** policy inventory and integrity context.
- **Runs:** deterministic and swarm run center with status timelines.
- **Swarm:** role-wise view of planner/researcher/critic/executor loop.
- **Evidence:** trust artifacts (identity, audit, attestation pointers).
- **Settings:** endpoint and product behavior configuration.

## UX principles
- **Trust is visible:** every decision view includes reason and source.
- **Progressive disclosure:** simple defaults first, deep details on demand.
- **Fast operations:** filterable lists, consistent state colors, keyboard-friendly controls.
- **Graceful failure:** explicit fail-closed messaging with recovery actions.

## Ops API trust envelope contract
- Every `/api/ops/*` payload returns:
  - `source`: `live` or `fallback`
  - `trustStatus`: `healthy`, `degraded`, or `fallback`
  - `reasonCode`: stable machine-readable cause when not healthy
  - `recoveryAction`: operator action text to restore healthy state
- `source=fallback` and `trustStatus=fallback` must never be rendered as production-live telemetry.
- `trustStatus=degraded` is reserved for partial trust conditions (for example stale data) where connectivity exists but evidence confidence is reduced.

## Visual system contract
- **Aesthetic direction:** calm institutional cockpit. The brand voice is "policy-constrained autonomy you can prove" — confident, never decorative.
- **Foundation:** Tailwind v4 (CSS-first `@theme` tokens in `apps/web/app/globals.css`, no `tailwind.config`) targeted only at `apps/web`, paired with shadcn/ui (New York, slate base) primitives in `apps/web/components/ui/*`. The `cn` helper in `apps/web/lib/cn.ts` is the single class composer.
- **Brand assets:** `apps/web/components/brand/logo.tsx` ships an inline-SVG wordmark + policy-lattice glyph that adapts via `currentColor`. No raster brand assets in components.
- **Color tokens (semantic, both themes):** `bg`, `surface`, `surface-strong`, `border`, `border-strong`, `text`, `text-muted`, `primary`, `accent`, `good`, `warn`, `bad`, `info` plus `*-soft` companions and `chart-1..5`. Tokens are declared in `oklch` for perceptual uniformity. No hardcoded hex/rgba colors are allowed in components.
- **Type & spacing:** Geist Sans for display + body, JetBrains Mono for hashes/IDs, type scale 12/13/14/15/16/18/20/24/30/36/48/60 with display variants for hero numbers. Spacing follows Tailwind's default 4px scale; radii are `sm 6 / md 10 / lg 14 / xl 20`.
- **Elevation:** three-layer shadow system (`shadow-card`, `shadow-popover`, `shadow-overlay`) defined in `@theme` and reused across cards, popovers, and modals/sheets.
- **Iconography & charts:** `lucide-react` is the canonical icon set (no ASCII fallbacks like `OK`/`!`/`X`); status iconography lives in `components/status-pill.tsx`. Trends use Recharts via `components/charts/{sparkline,area-trend,donut-status}.tsx`.
- **Information architecture:** `/` is the marketing landing page; everything authenticated lives under `/app/*` (dashboard, runs, policies, swarm, evidence, onboarding, settings, about) and is wrapped by `AppShell`.
- **App shell:** every authenticated screen renders inside `components/shell/app-shell.tsx` with a sticky top bar, collapsible icon-aware side nav (state persisted under `gctl.ui.desktopNavCollapsed`), and a Radix Sheet drawer on mobile (focus trap, escape close, scroll lock).
- **Command palette:** `Ctrl/Cmd+K` opens `components/shell/command-palette.tsx` (cmdk + shadcn) with Navigate / Search runs / Actions / Help groups.
- **Keyboard shortcuts:** `g d` → dashboard, `g r` → runs, `g p` → policies, `g e` → evidence, `g s` → settings, `?` → opens the keyboard shortcut help dialog. Shortcuts are inert while focus is in editable text.
- **Theming:** `components/theme-provider.tsx` exposes `light` / `dark` / `system` via React Context. Theme resolution happens before paint via the static `/public/theme-init.js` script (avoids inline-script CSP exceptions and FOUC). Both themes ship full token coverage.
- **Motion:** framer-motion drives a subtle page-enter fade and a card stagger on the dashboard. All motion respects `prefers-reduced-motion` via the `useMotionPreference` hook.
- **Accessibility:** Radix primitives provide focus trap, escape-close, and ARIA roles; the skip link in `apps/web/app/layout.tsx` is preserved; both themes are validated for WCAG AA contrast on text and interactive states.
- **Hierarchy contract:** strong page headers (`components/page-header.tsx`), semantic KPI cards with sparklines and 24h deltas, consistent content rhythm on Tailwind's 4px spacing grid.
- **Control contract:** shared button/input/select/table/checkbox/radio/switch/tabs/tooltip/popover/dialog/sheet/dropdown/command/scroll-area/slider/separator/skeleton primitives are mandatory for all routes; no raw browser-default form controls on primary flows.
- **Evidence contract:** policy IDs, hashes, ENS subnames, attestations, and audit paths are rendered in monospace with `copy-text-button` affordances and `sonner` toast feedback (success + clipboard-failure paths covered).
- **Data source contract:** whenever fallback snapshots are shown, pages must display explicit disclosure (`components/fallback-banner.tsx` with the diagonal stripe pattern + "Demo data" badge, plus per-row `Demo` chips on `source=fallback` rows) so synthetic data is never mistaken for live state.

## Success metrics
- **Activation:** first successful onboarding completion under 2 minutes.
- **Comprehension:** users can explain allow/deny outcomes from UI without logs.
- **Operational speed:** median time to locate a failed run under 30 seconds.
- **Reliability perception:** no ambiguous terminal-state messaging in critical views.
