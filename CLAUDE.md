# AI Portfolio Companion

Mobile-first AI portfolio companion app — Angular 21 / Ionic 8 / Capacitor 8 frontend, Node/Express backend.

## Tech Stack

- **Frontend:** Angular 21, Ionic 8, Capacitor 8, TypeScript (strict)
- **Backend:** Node.js, Express, TypeScript (strict), better-sqlite3, seedrandom
- **Charts:** ng2-charts 10 (donut), lightweight-charts 5 (price history)
- **Chat:** ngx-markdown 21, fetch + ReadableStream (SSE streaming)
- **Testing:** Vitest + supertest (backend), Jasmine + Karma (frontend)

## Architecture

Monorepo with two packages:

```
frontend/          # Angular 21 / Ionic 8 / Capacitor 8
├── src/app/
│   ├── tabs/      # Dashboard, Chat (tab pages + components)
│   ├── pages/     # Holding Detail (shared route)
│   ├── services/  # portfolio, insights, chat, api
│   ├── models/    # TypeScript interfaces
│   └── components/# Shared (holding-link)
backend/           # Node.js / Express / TypeScript
├── src/
│   ├── routes/    # portfolio, holdings, insights, chat
│   ├── services/  # portfolio, holdings, insights, chat, ai
│   ├── data/      # Seeded PRNG generator
│   ├── db/        # SQLite setup
│   └── models/    # TypeScript interfaces
specs/             # Requirements, technical spec, design system, plan
```

## Key Commands

```bash
# Backend
cd backend && npm run dev          # Express on port 3000
cd backend && npm test             # Vitest
cd backend && npm run test:coverage # Vitest with coverage
cd backend && npx tsc --noEmit     # Typecheck

# Frontend
cd frontend && ng serve            # Dev server on port 4200
cd frontend && ng build --configuration=production
cd frontend && ng test --watch=false
cd frontend && ng test --watch=false --code-coverage

# Mobile
cd frontend && ionic build && ionic cap sync
```

**Gate check (both packages must pass):**

```bash
cd backend && npx tsc --noEmit && npm test
cd frontend && ng build --configuration=production && ng test --watch=false
```

Frontend tests require the backend dev server running (`cd backend && npm run dev`).

## Key Patterns

- **Signals, not RxJS:** Angular Signals for all reactive state. No external state management library.
- **Seeded PRNG:** All mock data generated via seedrandom with date-based seed. Same day = same data. Generator accepts `seed` and `date` overrides for testing.
- **SSE streaming:** Chat uses `fetch` + `ReadableStream` (NOT `EventSource` — it only supports GET). Format: `data: {"content":"..."}\n\n` deltas, `data: [DONE]\n\n` completion.
- **Chat state machine:** `idle → thinking → streaming → idle` (happy path). Error states: `thinking → error`, `streaming → error`. Recovery: `error → idle`.
- **CAG, not RAG:** Portfolio data injected directly into LLM system prompt (small enough to fit).
- **Holding links:** LLM outputs `[HOLDING:TICKER]`, post-processed via regex on accumulated text. Rendered by splitting text into segments with `@for`, not `innerHTML`.
- **Shared route:** Holding detail at `/holding/:ticker`, accessible from both tabs. Angular Router with Ionic `routerDirection="forward"` for slide transitions. NOT `ion-nav`.
- **Design tokens:** All visual values come from `design-system.md` via CSS custom properties in `variables.scss`. Single light theme — no dark mode CSS imports.
- **Ticker normalization:** API routes are case-insensitive, responses always return uppercase.
- **Mock only LLM:** Tests mock only the outbound `POST /chat/completions` call. Everything else is real — real SQLite (in-memory), real Express routes, real frontend HTTP to running backend.

## Testing Conventions

- **Backend framework:** Vitest + supertest
- **Backend DB in tests:** In-memory SQLite (`:memory:`)
- **Frontend framework:** Jasmine + Karma (Angular default)
- **Frontend service tests:** Run against real backend dev server (no HttpTestingController)
- **Frontend component tests:** Angular TestBed with services provided via pre-set signal values
- **File naming:** `*.test.ts` (backend), `*.spec.ts` (frontend, Angular convention)
- **Coverage targets:** Backend services 80%+, routes 70%. Frontend services 70%+, components 50%+.

## Specs

Source of truth for what to build:

- `specs/requirements.md` — 6 FRs, 26 ACs, 3 NFRs
- `specs/technical-spec.md` — Architecture, API contracts, streaming format
- `specs/design-system.md` — Colors, typography, spacing, component overrides
- `specs/mobile-app-spec.md` — Screen layouts, interaction patterns
- `specs/testing-spec.md` — Test strategy, coverage targets, mocking rules
- `specs/plan.md` — 9 milestones (M1–M7, M3a/b/c, M5a/b) with dependency graph

## DO NOT

- Do not commit without user approval
- Do not add features not in the specs
- Do not import dark mode CSS (`dark.always.css`, `dark.system.css`, `dark.class.css`)
- Do not use `ion-nav` for navigation — use Angular Router with Ionic animation directives
- Do not use `EventSource` for streaming — use `fetch` + `ReadableStream`
- Do not mock SQLite or Express routes in tests — only mock the outbound LLM API call
- Do not use `#000000` for text — use `var(--ion-text-color)` (#1a1c1f)
- Do not use 1px border dividers — use spacing gaps per design-system.md
- Do not use `innerHTML` to render Angular components — use `@for` over split segments
