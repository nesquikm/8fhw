# Testing Spec: AI Portfolio Companion

## Test Stack

### Frontend
- **Framework:** Jasmine + Karma (Angular default)
- **Component testing:** Angular TestBed
- **E2E:** None for this assessment (documented as future improvement)

### Backend
- **Framework:** Vitest (fast, TypeScript-native, ESM support)
- **HTTP testing:** supertest
- **E2E:** None for this assessment

## Coverage Targets

| Layer | Target | Rationale |
|---|---|---|
| Backend services | 80%+ | Core business logic — data generation, chat persistence, AI proxy |
| Backend routes | 70%+ | Integration tests for API contracts |
| Frontend services | 70%+ | API calls, streaming parsing, state management |
| Frontend components | 50%+ | Key interactions only — not visual pixel tests |

## What to Test

### Backend

#### Data Generator (`data/generator.ts`)
- Seeded PRNG produces identical output for same seed + date
- Different dates produce different but valid data
- Generated portfolio has mix of stocks and crypto
- All holdings have valid fields (positive quantities, prices, etc.)
- Historical price data covers correct date ranges per range param (1W, 1M, 3M, 1Y, All)
- "All" produces ~5 years of daily data points

#### Portfolio Service (`services/portfolio.service.ts`)
- Returns complete portfolio with totalValue, dailyChange, dailyChangePercent
- Holdings include all required fields (ticker, name, type, quantity, etc.)
- portfolioPercent values sum to ~100%
- Holdings are correctly typed as "stock" or "crypto"

#### Holdings Service (`services/holdings.service.ts`)
- Returns holding by ticker (case-insensitive)
- Returns 404 for unknown ticker
- Detail includes sector and description (not present in portfolio list)
- History endpoint returns correct data shape per range
- History data points are sorted by date ascending

#### Insights Service (`services/insights.service.ts`)
- Returns array of insight cards derived from the generated mock portfolio
- Each card has id, title, summary, prompt
- Summaries and prompts reference actual values from the PRNG-generated portfolio (e.g., real allocation percentages, actual top holdings)

#### Chat Service (`services/chat.service.ts`)
- Stores user message in SQLite before LLM call
- Stores assistant message after streaming completes
- Does NOT store partial assistant message if stream fails mid-response
- GET returns messages in chronological order
- Respects MAX_HISTORY_MESSAGES when building LLM context (counted as total messages regardless of role; current user message always included)
- Full history still returned to the client (not truncated)

#### AI Service (`services/ai.service.ts`)
- Constructs correct system prompt with portfolio data
- Calls OpenAI-compatible endpoint with correct headers and body
- Streams response chunks to caller (content field is a delta token, not accumulated text)
- Handles missing/invalid env vars gracefully (fail fast on startup if AI_API_URL or AI_API_KEY are missing)
- Handles upstream stream failure: closes cleanly without storing partial assistant message

#### Route Integration Tests
- Each endpoint returns correct status codes and response shapes
- Portfolio endpoint matches API contract
- Holdings detail returns extra fields vs portfolio list
- Holdings ticker lookup is case-insensitive (`/api/holdings/aapl` returns same as `/api/holdings/AAPL`)
- Holdings unknown ticker returns 404
- History endpoint validates range param (case-insensitive; invalid range returns 400)
- Chat GET returns persisted messages with `createdAt` camelCase field (mapped from SQLite `created_at`)
- Chat POST accepts request body with `content` field and returns chunked streaming response with `Content-Type: text/event-stream`
- Chat POST returns 400 if `content` is missing, empty, or not a string
- Chat POST stream events are separated by `\n\n` (standard SSE framing)

### Frontend

#### Portfolio Service (`services/portfolio.service.ts`)
- Fetches and transforms portfolio data from API
- Exposes holdings grouped by type via signal

#### Insights Service (`services/insights.service.ts`)
- Fetches insight cards from API
- Exposes insights via signal

#### Chat Service (`services/chat.service.ts`)
- Sends message via POST and consumes streaming response
- Accumulates delta tokens into message signal
- State transitions: idle → thinking → streaming → idle (all four states verified)
- State transitions on error: idle → thinking → error (stream failure before first token) or idle → thinking → streaming → error (stream failure mid-response)
- On error: partial streamed text is cleared, error message available via signal
- Handles stream completion (data: [DONE])
- Handles incomplete stream (no [DONE] received — connection dropped)
- Loads history on init
- Buffers incomplete SSE lines across chunk boundaries
- Operates as a single continuous conversation (no thread management, all messages in one timeline)

#### Holding Link Component (`components/holding-link/`)
- Renders ticker as tappable Ionic chip
- Navigates to correct holding detail route on tap

#### Message Bubble Component (`tabs/chat/message-bubble/`)
- Renders markdown content
- Detects and replaces [HOLDING:TICKER] patterns with holding-link components

#### Portfolio Summary Component (`tabs/dashboard/portfolio-summary/`)
- Renders total portfolio value with currency formatting
- Renders daily change in $ and % with positive/negative styling

#### Allocation Chart Component (`tabs/dashboard/allocation-chart/`)
- Renders donut chart with stocks vs. crypto segments
- Segment values reflect actual portfolio allocation percentages

#### Insight Cards Component (`tabs/dashboard/insight-cards/`)
- Renders insight cards in horizontal scrollable row
- Each card displays title and summary
- Tapping a card emits the card's prompt for navigation to Chat tab

#### Holdings List Component (`tabs/dashboard/holdings-list/`)
- Renders holdings grouped by type (stocks section, crypto section)
- Tapping a holding navigates to holding detail

#### Holding Detail Page (`pages/holding-detail/`)
- Displays header with asset name, ticker, and current price
- Fetches holding detail by ticker from route param
- Accessible via shared route from both Dashboard and Chat tabs

#### Price Chart Component (`pages/holding-detail/price-chart/`)
- Renders price history chart via lightweight-charts
- Displays range toggle buttons: 1W, 1M, 3M, 1Y, All
- Switching range triggers a new backend request and re-renders chart data

#### Position Summary Component (`pages/holding-detail/position-summary/`)
- Displays quantity, average buy price, current value, total gain/loss ($, %), % of portfolio

#### Message List Component (`tabs/chat/message-list/`)
- Renders list of message bubbles
- Auto-scrolls to bottom when new messages are added

#### Chat Input Component (`tabs/chat/chat-input/`)
- Send button dispatches message and clears input
- Send button is disabled when input is empty or chat state is not idle
- Accepts pre-filled text (from insight card navigation) without auto-sending

## What NOT to Test

- Ionic/Capacitor native internals
- Chart.js / lightweight-charts rendering (third-party)
- ngx-markdown rendering internals
- Angular framework behavior (routing, DI, etc.)
- Visual/pixel-level appearance
- LLM response quality

## Test Data Strategy

- **Backend:** Seeded PRNG with a fixed test seed passed via the generator's `seed` override parameter (different from production's date-based seed) ensures deterministic test data without fixtures
- **Backend:** SQLite uses in-memory database (`:memory:`) in tests — real better-sqlite3, no mock. Vitest config may need `deps.interopDefault` or `deps.inline` for native module ESM interop.
- **Frontend service tests:** Run against the real backend dev server (no HttpTestingController mocking). Start backend before running frontend tests. This means frontend gates depend on the backend being built and running.
- **Frontend component tests:** Use Angular TestBed with services provided via pre-set signal values (not HTTP mocks — services are real but initialized with test data).
- **Timestamps:** Use fixed dates in tests to ensure deterministic PRNG output

## Mocking Strategy

Only the **LLM API** is mocked. Everything else (SQLite, data generator, Express routes, frontend HTTP calls) uses real implementations.

### What is mocked
- **AI service outbound HTTP call:** mock the `POST /chat/completions` call to the OpenAI-compatible endpoint. No real LLM calls in tests — they cost money, are non-deterministic, slow, and require credentials the CI/reviewer won't have. Return a canned streaming response that matches the SSE format (`data: {"content":"..."}` / `data: [DONE]`).

### What is NOT mocked
- SQLite (real in-memory database via better-sqlite3 `:memory:`)
- Data generator (real seeded PRNG with fixed test seed)
- Express routes and middleware (real via supertest)
- Frontend HTTP calls (real requests to running backend dev server)
- Angular Router navigation (real routing)
