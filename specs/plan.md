# Implementation Plan: AI Portfolio Companion

## Milestone Dependency Graph

```
Backend track:  M1 ──→ M2 ──→ M4 ──────────────────┐
                                                   │
Frontend track: M1 ──→ M3a ──→ M3b ───────────┐    │
                         │                    ├──→ M6 ──→ M7
                         ├──→ M3c ──→ M5b ────┘
                         │             ↑
                         └──→ M5a ─────┘
```

**Two parallel tracks from M1:**

- **Backend track:** M2 (core endpoints) → M4 (chat + AI streaming)
- **Frontend track:** M3a (foundation) → M3b/M3c/M5a in parallel → M5b

**Development is parallel, testing has a dependency.** Frontend code in M3a–M5b is developed in parallel with the backend. However, frontend service tests (which hit real API endpoints) can only pass once the backend endpoints exist. In practice: develop M3a alongside M2, but **run M3a's gate after M2's gate passes**. The dependency graph shows the development flow; the gate ordering is: M2 gate → then M3a gate → then M3b/M3c/M5a gates.

**Convergence at M6:** first time the full app is verified end-to-end. Both tracks (including M4) must complete before M6.

**Mocking strategy:** Only the outbound LLM API call (`POST /chat/completions`) is mocked in tests. Everything else is real — backend tests use real SQLite (in-memory), frontend service tests run against the real backend dev server. Frontend *component* tests use Angular TestBed with injected test data (not HTTP mocks — the services are provided with pre-set signal values).

**Design tokens:** All color, typography, spacing, and radius values reference `design-system.md` (the single source of truth for visual styling). `mobile-app-spec.md` defines screen layouts and component behavior using those tokens.

---

## M1: Project Setup

**Goal:** Monorepo scaffolding, both apps runnable with hello-world state.

### Tasks

1. Init monorepo root with shared config (`.gitignore`, `package.json` workspace)
2. Scaffold Angular 21 + Ionic 8 app in `frontend/` (compatibility verified: `@ionic/angular@8.8.x` peer-requires `@angular/core >=16.0.0`)
3. Scaffold Node/Express + TypeScript app in `backend/`
4. Configure TypeScript strict mode in both projects
5. Force single light theme (NFR-3). Apply design tokens from `design-system.md` in `src/theme/variables.scss`: all Ionic theme colors (§2), application-level variables (`--app-surface`, `--app-gain`, `--app-loss`, spacing, radius, etc.), and Ionic component overrides (§7). Do **not** import `dark.always.css`, `dark.system.css`, or `dark.class.css` in `angular.json`
6. Generate stepped colors from background (`#f9f9fe`) to text (`#1a1c1f`) using the [Ionic Stepped Color Generator](https://ionicframework.com/docs/theming/themes#stepped-color-generator) and add to `variables.scss`
7. Load Inter font via Google Fonts `<link>` in `index.html` (or bundle locally). Verify `--ion-font-family` is set to `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
8. Set up backend dev server (`npm run dev` with ts-node or tsx)
9. Set up frontend dev server (`ng serve`)
10. Verify both apps start and serve a hello-world response
11. Add `.env.example` with all environment variables: PORT, AI_API_URL, AI_API_KEY, AI_MODEL, MAX_HISTORY_MESSAGES, CORS_ORIGIN
12. Set up Vitest + supertest in backend, verify a trivial test passes. Configure Vitest for better-sqlite3 native module ESM interop (`deps.interopDefault` or `deps.inline`). Add coverage thresholds in `vitest.config.ts`: services 80%, routes 70%.
13. Set up Jasmine/Karma in frontend (Angular default), verify a trivial test passes. Add coverage thresholds in Karma/angular.json config: services 70%, components 50%.

### Acceptance Criteria

- [x] `cd backend && npm run dev` starts Express on port 3000
- [x] `cd frontend && ng serve` opens Ionic app in browser (single light theme, design-system.md tokens applied)
- [x] `cd backend && npm test` runs Vitest and passes
- [x] `cd frontend && ng test` runs Jasmine/Karma and passes
- [x] TypeScript strict mode enabled in both `tsconfig.json`

### Gate

```bash
cd backend && npm run dev & sleep 3 && curl -s http://localhost:3000 && kill %1
cd frontend && ng build --configuration=production
cd backend && npm test
cd frontend && ng test --watch=false
```

---

## M2: Backend Core

**Goal:** Portfolio, holdings, and insights endpoints with seeded mock data.
**Depends on:** M1

### Tasks

1. Implement seeded PRNG data generator (`data/generator.ts`) using **seedrandom** library with date-based seed (base seed + YYYY-MM-DD). Generator must accept optional `seed` and `date` override parameters for deterministic testing.
2. Define TypeScript models for portfolio, holding, insight
3. Implement portfolio service — generates ~8-12 holdings (stocks + crypto). Per-holding fields: ticker, name, type, quantity, currentPrice, currentValue, avgBuyPrice, gainLoss, gainLossPercent, portfolioPercent. Portfolio-level fields: totalValue, dailyChange, dailyChangePercent
4. Implement holdings service — detail endpoint returns additional fields (sector, description) not in portfolio list; history endpoint supports ranges: **1W, 1M, 3M, 1Y, All (All = 5 years of daily data)**
5. Implement ticker normalization: API routes are **case-insensitive** (accept `aapl` or `AAPL`), responses always return **uppercase** tickers
6. Implement insights service — cards computed from current portfolio data, served from backend (not hardcoded in app). Each card: id, title, summary, prompt
7. Implement routes: `GET /api/portfolio`, `GET /api/holdings/:ticker`, `GET /api/holdings/:ticker/history?range=`, `GET /api/insights`
8. Add CORS middleware — allow `http://localhost:4200` (dev), `capacitor://localhost` (iOS), `http://localhost` (Android). Accept a `CORS_ORIGIN` env var for additional origins.
9. Write tests using **Vitest + supertest**: data generator determinism, services, route integration tests. Use **in-memory SQLite** (`:memory:`) for any DB tests

### Acceptance Criteria (maps to FR-1, FR-2, FR-3, FR-5)

- [x] `GET /api/portfolio` returns valid portfolio with holdings matching API contract (AC-5.1)
- [x] Portfolio response includes `totalValue`, `dailyChange`, `dailyChangePercent` (AC-1.1)
- [x] Each holding includes: ticker, name, type, quantity, currentPrice, currentValue, avgBuyPrice, gainLoss, gainLossPercent, portfolioPercent (AC-1.4)
- [x] `GET /api/holdings/AAPL` returns holding with sector and description (AC-5.2)
- [x] `GET /api/holdings/aapl` returns same result as `GET /api/holdings/AAPL` (case-insensitive)
- [x] `GET /api/holdings/AAPL/history?range=1M` returns date-sorted price data (AC-5.3)
- [x] `GET /api/holdings/AAPL/history?range=All` returns ~5 years of daily data (AC-2.2)
- [x] `GET /api/holdings/UNKNOWN` returns 404
- [x] `GET /api/insights` returns insight cards with id, title, summary, prompt (AC-5.4)
- [x] Insight card summaries and prompts reference actual values from the generated portfolio (e.g., real allocation percentages, actual top holdings) — not static text (AC-3.2)
- [x] Same request on same calendar day returns identical data — PRNG determinism (AC-5.7)
- [x] Backend tests pass: **services 80%+ coverage, routes 70%+ coverage**

### Gate

```bash
cd backend && npm test -- --coverage
curl -s http://localhost:3000/api/portfolio | jq '.holdings | length'
curl -s http://localhost:3000/api/holdings/AAPL | jq '.sector'
curl -s http://localhost:3000/api/holdings/aapl | jq '.ticker'
curl -s http://localhost:3000/api/holdings/AAPL/history?range=1W | jq '.data | length'
curl -s http://localhost:3000/api/holdings/AAPL/history?range=1M | jq '.data | length'
curl -s http://localhost:3000/api/holdings/AAPL/history?range=3M | jq '.data | length'
curl -s http://localhost:3000/api/holdings/AAPL/history?range=1Y | jq '.data | length'
curl -s http://localhost:3000/api/holdings/AAPL/history?range=All | jq '.data | length'
curl -s http://localhost:3000/api/insights | jq '.insights[0].summary'  # verify dynamic content, not static text
```

---

## M3a: Frontend Foundation

**Goal:** Navigation shell, services, models, and shared utilities — no screen UI yet.
**Depends on:** M1 (runs in parallel with M2/M4 backend track)

### Tasks

1. Set up Ionic tab navigation (Dashboard, Chat — two bottom tabs). Active tab: `--ion-color-primary` icon + label; inactive: `--ion-color-medium`. Use `ion-tab-bar` with `ion-tab-button` and glassmorphism styling per `design-system.md` §7. Dashboard and Chat tabs render placeholder content.
2. Define frontend TypeScript models (portfolio, holding, holdingDetail, insight, chatMessage, chatState)
3. Implement `api.service.ts` with `API_BASE_URL` from **Angular environment files** (`environment.ts`, `environment.prod.ts`)
4. Implement `portfolio.service.ts` — fetch portfolio via `GET /api/portfolio`, expose signals for portfolio data and holdings grouped by type (`{ stocks: Holding[], crypto: Holding[] }`)
5. Implement `insights.service.ts` — fetch insight cards via `GET /api/insights`, expose insights via signal
6. Set up shared route for Holding Detail: `/holding/:ticker`, accessible from any tab (not tied to a tab stack). Use Angular Router with Ionic `routerDirection="forward"` and `routerAnimation` for slide-in/slide-out transitions (not `ion-nav` — it's imperative and incompatible with Angular Router).
7. Implement **number formatting** utility: currency (`$1,234.56`), percentages (`+1.01%` / `-2.34%` always with sign), quantities (2 decimal places), gain/loss (always with sign, colored). Use Angular pipes or standalone utility functions.
8. Write tests: portfolio.service (fetch + transform + grouping), insights.service (fetch + signal), number formatting utility. Service tests run against the real backend dev server (requires M2 backend running).

### Acceptance Criteria

- Two-tab navigation works: tapping Dashboard/Chat switches content
- Portfolio service fetches data and exposes grouped holdings signal
- Insights service fetches and exposes insight cards signal
- Holding detail route `/holding/:ticker` is registered and navigable
- Number formatting utility produces correct output for positive/negative values, large numbers, zero
- Frontend builds and tests pass

### Gate (run after M2 gate passes)

```bash
cd frontend && ng build --configuration=production
cd backend && npm run dev &
sleep 3
cd frontend && ng test --watch=false
kill %1
```

---

## M3b: Dashboard Screen

**Goal:** Complete Dashboard tab UI with all components.
**Depends on:** M3a
**Visual reference:** `mobile-app-spec.md` Dashboard section (layout), `design-system.md` (tokens), `specs/screens/dashboard.png` (visual guidance — not pixel-perfect)

### Tasks

1. Build **portfolio-summary** (hero section): gradient (`--app-primary-gradient`) full-width background, "TOTAL BALANCE" label (Label scale, white, uppercase, 60% opacity), total value in Display scale (white), change chip with `--radius-full` (`--app-gain-bg`/`--app-gain` for positive, `--app-loss-bg`/`--app-loss` for negative) (AC-1.1)
2. Build **allocation-chart**: white card (`--radius-xl`), "Asset Allocation" header (Headline scale), `ng2-charts` doughnut with `cutout: '70%'`, stocks segment (`#003366`) vs crypto segment (`#78dc77`) per `design-system.md` §9, legend with colored dots + label + percentage to the right of donut (AC-1.2)
3. Build **insight-cards**: "Portfolio Insights" header (Headline scale), horizontal scroll with `scroll-snap-type: x mandatory` and `--spacing-2` gap, cards with white bg / `--radius-xl` / min-width ~280px, title (bold) + summary (`color="medium"`), dot indicators below carousel. Tapping a card: navigate to Chat tab + pre-fill input (AC-3.1, AC-3.3)
4. Build **holdings-list**: section per asset type ("Stocks", "Crypto" headers in Headline scale), `--spacing-3` gap between rows (no dividers). Each **holding row** via `ion-item` with `lines="none"`: left = ticker badge (`--ion-color-primary` bg, white text, `--radius-sm`, Label scale) + company name + secondary line (quantity + daily change %); right = current value (bold) + gain/loss (`--app-gain`/`--app-loss`). Entire row tappable → navigates to Holding Detail. (AC-1.3, AC-1.4, AC-1.5)
5. Assemble **dashboard page**: hero → allocation chart → insight cards → holdings sections. Background: `--app-surface`. Content in `ion-content` with scrollable overflow.
6. Add `ion-refresher` for pull-to-refresh — re-fetches portfolio data on pull-down
7. Implement **skeleton loading states**: pulsing gray rectangles matching layout of hero section, chart area, and holding rows. Shown while portfolio data loads. Use `ion-skeleton-text`.
8. Wire insight card tap → Chat tab with **pre-filled prompt (no auto-send, no clear history)** (AC-3.4)
9. Write component tests: portfolio-summary (renders values, color for positive/negative), allocation-chart (renders segments), insight-cards (renders cards, emits prompt on tap), holdings-list (groups by type, navigates on tap)

### Acceptance Criteria (maps to FR-1, FR-3)

- Dashboard shows portfolio summary with total value and daily change in $ and % (AC-1.1)
- Donut chart renders allocation by asset type — stocks vs. crypto (AC-1.2)
- Holdings listed grouped by type with section headers (AC-1.3)
- Each holding row shows ticker badge, name, quantity, value, gain/loss colored (AC-1.4)
- Tapping a holding navigates to Holding Detail with slide-in transition (AC-1.5)
- Insight cards scroll horizontally with dot indicators, each shows title and summary (AC-3.1–3.3)
- Tapping insight card switches to Chat tab and pre-fills prompt — does NOT auto-send, does NOT clear history (AC-3.4)
- Skeleton loading screens shown while data loads
- Pull-to-refresh re-fetches portfolio data
- Visual style matches `specs/screens/dashboard.png` and `design-system.md` (navy gradient hero, green/blue accents, white cards on `--app-surface` bg)
- Component tests pass

### Gate (run after M2 gate passes)

```bash
cd frontend && ng build --configuration=production
cd backend && npm run dev &
sleep 3
cd frontend && ng test --watch=false
kill %1
```

---

## M3c: Holding Detail Screen

**Goal:** Complete Holding Detail page with price chart and position summary.
**Depends on:** M3a
**Visual reference:** `mobile-app-spec.md` Holding Detail section (layout), `design-system.md` (tokens), `specs/screens/holding-detail.png` (visual guidance — not pixel-perfect)

### Tasks

1. Build **holding-detail page**: `ion-header` with `ion-back-button` + company name title + ticker subtitle (Label scale, white 60% opacity). `ion-toolbar` uses `design-system.md` toolbar theming (navy bg, white text). Fetch holding detail via `GET /api/holdings/:ticker` using route param. (AC-2.1, AC-2.5)
2. Build **price section**: current price (~1.75rem/700) + change chip (`--radius-full`, `--app-gain-bg`/`--app-loss-bg` bg, `--app-gain`/`--app-loss` text) + "Today" label.
3. Build **price-chart**: TradingView `lightweight-charts` line chart per `design-system.md` §9. Line color: `#003366`. Area fill: `rgba(0, 51, 102, 0.2)` → transparent. Height: ~200px. Grid: vertical lines hidden, horizontal `--app-surface-low`. Crosshair on touch with price tooltip. (AC-2.2)
4. Build **range toggles**: row of buttons below chart — 1W, 1M, 3M, 1Y, All. Active state: `--ion-color-primary` bg + white text. Inactive: transparent bg + `color="medium"`. `--radius-sm`, `--spacing-1` gap. Tapping a toggle fetches `GET /api/holdings/:ticker/history?range=X` and re-renders chart. Default: 1M. (AC-2.3)
5. Build **position-summary**: white card (`--radius-xl`), "YOUR POSITION" header (Label scale, uppercase, letter-spacing). Two-column grid top row: current value + total gain/loss (`--app-gain`/`--app-loss`). Single-column rows: quantity, avg buy price, portfolio weight, sector with icon/badge. (AC-2.4)
6. Build **about section**: "ABOUT {NAME}" header (Label scale, uppercase), description text from API (`color="medium"`).
7. Implement **skeleton loading**: skeleton rectangle in chart area while history loads, skeleton lines in position summary while detail loads. Range toggles visible but disabled during load.
8. Back navigation: `ion-back-button` triggers slide-out-right transition
9. Write component tests: holding-detail (fetches by ticker), price-chart (renders with data, handles range switch), position-summary (displays fields)

### Acceptance Criteria (maps to FR-2)

- Header shows company name, ticker (AC-2.1)
- Price chart renders with gradient fill and range toggles (AC-2.2)
- Switching range reloads chart data from backend (AC-2.3)
- Position summary shows quantity, avg buy price, current value, gain/loss, portfolio weight, sector (AC-2.4)
- Holding Detail accessible from Dashboard via shared route with slide-in transition (AC-2.5)
- About section shows description text
- Skeleton loading shown while data loads
- Back button navigates back with slide-out transition
- Visual style follows `design-system.md` tokens and `specs/screens/holding-detail.png` as reference
- Component tests pass

### Gate (run after M2 gate passes)

```bash
cd frontend && ng build --configuration=production
cd backend && npm run dev &
sleep 3
cd frontend && ng test --watch=false
kill %1
```

---

## M4: AI Chat Backend

**Goal:** Chat persistence and AI streaming proxy.
**Depends on:** M2

### Tasks

1. Set up better-sqlite3 with messages table schema (id, role, content, created_at as ISO 8601 UTC)
2. Implement chat service — persist messages, load history, respect **MAX_HISTORY_MESSAGES (default: 50)** when building LLM context (counted as total messages regardless of role; current user message always included even if it exceeds the limit; full history still returned to client)
3. Implement AI service — configurable via **env vars: AI_API_URL, AI_API_KEY, AI_MODEL** (AC-5.8); calls `POST /chat/completions` with `stream: true` on **OpenAI-compatible endpoint**; constructs system prompt with current portfolio data (**CAG approach**); system prompt instructs `[HOLDING:TICKER]` format. Fails fast on startup if `AI_API_URL` or `AI_API_KEY` are missing.
4. Implement routes: `GET /api/chat/messages` (returns all messages chronologically, mapped to camelCase `createdAt`), `POST /api/chat/messages` (streaming response using **chunked transfer encoding with `Content-Type: text/event-stream`, `\n\n` event separators, `data: {"content":"..."}` delta tokens / `data: [DONE]` format**). Validate request body: return 400 if `content` is missing, empty, or not a string.
5. Store user message in SQLite **immediately before** LLM call; store assistant message **after streaming completes** (final accumulated content). Partial assistant message **discarded** if stream fails.
6. Write tests using **Vitest + supertest, in-memory SQLite (`:memory:`)**: chat persistence, message ordering, MAX_HISTORY_MESSAGES context truncation, AI service prompt construction, stream failure handling. **Mock only the outbound LLM API call** (POST /chat/completions) — return canned SSE streaming response. Everything else (SQLite, routes, services) is real.

### Acceptance Criteria (maps to FR-4, FR-5)

- [x] `GET /api/chat/messages` returns persisted messages in chronological order with `createdAt` timestamps (AC-5.5)
- [x] `POST /api/chat/messages` streams response chunks in `data: {"content":"..."}` / `data: [DONE]` format (AC-5.6)
- [x] Messages persist across server restarts (SQLite file on disk)
- [x] Only last 50 messages (MAX_HISTORY_MESSAGES) sent to LLM; full history returned to client (AC-4.9)
- [x] System prompt includes current portfolio data via CAG
- [x] System prompt instructs `[HOLDING:TICKER]` format
- [x] AI provider configured via env vars: AI_API_URL, AI_API_KEY, AI_MODEL (AC-5.8)
- [x] Backend tests pass: **services 80%+ coverage, routes 70%+ coverage**

### Gate

```bash
cd backend && npm test -- --coverage
curl -s http://localhost:3000/api/chat/messages | jq '.messages'
curl -N -X POST http://localhost:3000/api/chat/messages \
  -H 'Content-Type: application/json' \
  -d '{"content":"How is my portfolio?"}'
```

---

## M5a: Chat Service & Streaming

**Goal:** Frontend chat service with streaming logic, state machine, and SSE parsing — no UI yet.
**Depends on:** M3a (unit tests are self-contained; manual integration testing benefits from M4 backend running alongside)

### Tasks

1. Implement `chat.service.ts` — fetch history via `GET /api/chat/messages` on init; expose messages signal
2. Implement send method: `POST /api/chat/messages` with streaming using **fetch + ReadableStream** (NOT EventSource). Parse SSE-formatted response: buffer incomplete lines across chunk boundaries, extract `data: {"content":"..."}` delta tokens, detect `data: [DONE]` completion.
3. Implement chat state signal: **idle | thinking | streaming | error**. Transitions:
   - Happy path: `idle → thinking → streaming → idle`
   - Error (before first token): `idle → thinking → error`
   - Error (mid-stream): `idle → thinking → streaming → error`
   - Recovery: `error → idle` (on retry/dismiss)
4. Accumulate delta tokens into a streaming message signal. On completion (`[DONE]`), finalize message and append to messages list.
5. Handle incomplete stream (no `[DONE]` received — connection dropped): transition to `error`, clear partial text.
6. Implement `[HOLDING:TICKER]` detection via **post-process regex on accumulated text** (not bracket buffering during streaming). Expose detected tickers for UI rendering.
7. Write tests: streaming state transitions (all 4 states + error paths), SSE parsing (complete events, split chunks, missing `[DONE]`), holding link regex detection, history loading, single-conversation constraint

### Acceptance Criteria

- Chat service fetches and exposes message history via signal
- Streaming parses SSE format correctly, including cross-chunk buffering
- State machine transitions through all 4 states correctly on happy path and error paths
- `[HOLDING:TICKER]` patterns detected in accumulated text
- Delta tokens accumulate into streaming message signal
- Service tests pass with full state machine coverage

### Gate (run after M4 gate passes)

```bash
cd frontend && ng build --configuration=production
cd backend && npm run dev &
sleep 3
cd frontend && ng test --watch=false
kill %1
```

---

## M5b: Chat Screen UI

**Goal:** Complete Chat tab UI with messages, input, streaming display, and holding links.
**Depends on:** M5a, M3c (holding detail route must exist for holding link navigation)
**Visual reference:** `mobile-app-spec.md` Chat section (layout), `design-system.md` (tokens), `specs/screens/chat.png` (visual guidance — not pixel-perfect)

### Tasks

1. Build **message-list** component: scrollable area between header and input (`ion-content`). Auto-scroll to bottom on new messages and initial load. Spacing: `--spacing-2` between same-sender messages, `--spacing-4` between sender changes.
2. Build **message-bubble** component: user messages right-aligned (`--ion-color-primary` bg, white text, `--radius-lg` with bottom-right corner squared), assistant messages left-aligned (`--app-surface-container` bg, `--ion-text-color` text, `--radius-lg` with bottom-left corner squared). Max-width ~80%. Markdown rendering via **ngx-markdown**. Configure ngx-markdown v21 `SANITIZE` injection token to prevent XSS.
3. Build **holding-link component**: inline chip per `design-system.md` §8 (`--app-surface-low` bg, `--ion-color-primary` text, `--radius-sm`, Label scale uppercase). Tappable → navigates to `/holding/:ticker` via shared route.
4. Integrate `[HOLDING:TICKER]` rendering in message bubbles: use a custom component that splits the message text by the `[HOLDING:TICKER]` regex, rendering text segments via `ngx-markdown` and matched tickers as `holding-link` components. Do not use `innerHTML` with Angular components (they won't bootstrap). Use structural iteration (`@for`) over the split segments instead.
5. Build **chat-input** component: fixed at bottom above tab bar. White container with ghost border top (`1px solid rgba(195, 198, 209, 0.15)`). Input field: `--radius-md`, `--app-surface-low` bg, placeholder "Ask about your portfolio...". Circular send button: `--ion-color-primary` bg, white arrow icon. Disabled (reduced opacity) when input empty or chat state not `idle`. Safe-area bottom padding for notched devices.
6. Build **thinking indicator**: left-aligned assistant-style bubble with three animated dots (CSS pulse/opacity animation in sequence). Shown while chat state is `thinking`.
7. Build **chat header**: `ion-header` with `ion-toolbar` (navy bg per `design-system.md` toolbar theming), "AI Assistant" title (Headline scale, white)
8. Wire insight card pre-fill: receive prompt from dashboard navigation (via route state or service), populate input field — **no auto-send, no clear history** (AC-3.4)
9. Handle **error state**: dismissible error banner or inline message below last message. "Retry" button transitions state `error → idle` and re-sends. Partial streamed text cleared.
10. **Keyboard behavior**: input focus pushes content up (Ionic `ion-content` resize mode), message list stays scrolled to bottom. Keyboard dismisses on scroll-up. Send on keyboard "return" key or send button tap.
11. **Empty state**: when no chat history, show centered text "Ask me anything about your portfolio" with a suggested prompt chip
12. Write component tests: message-bubble (markdown rendering, holding link detection), chat-input (send/disable states, pre-fill), holding-link (renders chip, navigates), message-list (auto-scroll)

### Acceptance Criteria (maps to FR-4)

- Chat is accessible via the second bottom tab (AC-4.1)
- Chat tab loads conversation history from backend on init (AC-4.7)
- User can type and send messages (AC-4.2)
- AI responses stream token-by-token with visible text accumulation (AC-4.3)
- Thinking indicator (animated dots) shown before first token while state is `thinking` (AC-4.4)
- Markdown renders correctly in assistant bubbles — bold, lists, tables (AC-4.5)
- `[HOLDING:TICKER]` renders as tappable holding chip (per `design-system.md` §8) → navigates to holding detail (AC-4.6, AC-2.5)
- Single continuous conversation — no thread management (AC-4.8)
- Error state: error message shown, retry available, partial text cleared
- Insight card pre-fill works: prompt appears in input, no auto-send, no clear (AC-3.4)
- Empty state shown when no history
- Visual style follows `design-system.md` tokens and `specs/screens/chat.png` as reference (navy user bubbles, `--app-surface-container` assistant bubbles, navy send button)
- Component tests pass
- Frontend tests pass: **services 70%+ coverage, components 50%+ coverage** (cumulative across M3a–M5b)

### Gate (run after M4 gate passes)

```bash
cd frontend && ng build --configuration=production
cd backend && npm run dev &
sleep 3
cd frontend && ng test --watch=false --code-coverage
kill %1
```

---

## M6: Integration & Polish

**Goal:** End-to-end flow works, verify all ACs, final polish.
**Depends on:** M3b, M4, M5b

### Tasks

1. End-to-end smoke test: dashboard → insight card → chat (prompt pre-filled, not sent) → send → streaming response → holding link → detail → back → dashboard
2. Verify streaming in browser: token-by-token rendering, thinking indicator, completion, error recovery
3. Verify all **loading/empty states**: dashboard skeleton, holding detail skeleton, chat spinner, empty chat
4. Verify **number formatting** consistency across all screens: currency with commas, percentages with sign, gain/loss colored
5. Mobile-first responsive layout check (NFR-1)
6. Verify single light theme, no dark mode across all screens (NFR-3)
7. Verify all acceptance criteria from requirements.md FR-1 through FR-5 (checklist walkthrough)
8. Run full test suites and verify **coverage targets**: backend services 80%+, routes 70%+, frontend services 70%+, components 50%+

### Acceptance Criteria

- Full user flow works end-to-end without errors
- Numbers formatted consistently ($1,234.56, +2.34%, -1.23%)
- Empty/loading states handled gracefully on all screens
- Single light theme across all screens
- All FR-1 through FR-5 acceptance criteria pass
- All coverage targets met (enforced by threshold config in Vitest and Karma)

### Gate

```bash
cd backend && npm test -- --coverage
cd backend && npm run dev &
sleep 3
cd frontend && ng build --configuration=production
cd frontend && ng test --watch=false --code-coverage
kill %1
```

---

## M7: Mobile Deployment

**Goal:** App runs on iOS or Android device/simulator.
**Depends on:** M6

### Tasks

1. Add Capacitor 8 to frontend project
2. Configure Capacitor for iOS and/or Android
3. Build and sync: `ionic build && ionic cap sync`
4. Test on simulator/device
5. Verify `API_BASE_URL` works with LAN IP (set in Angular environment file)
6. Update README with: device/simulator build instructions, API_BASE_URL configuration for device networking (AC-6.2)
7. Final verification of all features on device: dashboard, charts, insight cards, chat streaming, holding links, holding detail

### Acceptance Criteria (maps to FR-6)

- App builds and runs on iOS or Android via Capacitor 8 (AC-6.1)
- README includes clear device/simulator instructions and API_BASE_URL configuration (AC-6.2)
- All features work on device (dashboard, chat, holding detail, streaming, navigation)

### Gate

```bash
cd frontend && ionic build && ionic cap sync
# For iOS:
ionic cap open ios
# Manual: build and run on simulator in Xcode, verify all features
# For Android:
# ionic cap open android
# Manual: build and run on emulator in Android Studio, verify all features
```
