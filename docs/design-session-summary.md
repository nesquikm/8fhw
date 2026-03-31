# Design Session Summary

How the AI Portfolio Companion was designed — from blank slate to implementation-ready specs in a single session.

## 1. Brainstorm

Started by reading the assessment (`specs/assessment.md`). Then worked through feature decisions **one question at a time**, each building on the previous answer:

- **AI provider** — OpenAI-compatible configurable endpoint (url, token, model name) for maximum flexibility
- **Insight cards** — generated on backend from the mock portfolio's current values (e.g., real allocation percentages from PRNG-generated holdings), tap navigates to chat with pre-filled prompt
- **Asset types** — stocks AND crypto in the same portfolio
- **Dashboard layout** — top to bottom: portfolio summary, donut chart, insight cards, grouped holdings list
- **Allocation chart** — breakdown by asset type (stocks vs. crypto)
- **Holdings list** — grouped by type, each row includes % of portfolio
- **Holding detail** — header, historical price chart with time range toggles (1W/1M/3M/1Y/All), position summary
- **Chart data** — all mock data generated on backend using seeded PRNG
- **Navigation** — tab-based (Dashboard, Chat), holding detail as stack push
- **Chat persistence** — backend SQLite (not local storage), with PowerSync noted for production sync
- **Chat UX** — single continuous conversation, markdown rendering, streaming responses
- **Holding deep links** — LLM outputs `[HOLDING:TICKER]` format, rendered as tappable chips navigating to holding detail
- **Backend stack** — Node/Express, better-sqlite3, seedrandom
- **API design** — 6 endpoints, holdings detail separated from history
- **Streaming** — SSE for now, WebSocket noted as future alternative for proactive conversations

## 2. Spec Write — Requirements, Technical Spec, README

Drafted and saved three files based on brainstorm decisions:
- `specs/requirements.md` — 6 functional requirements with acceptance criteria, 3 NFRs, explicit out-of-scope list
- `specs/technical-spec.md` — architecture, component structure, API contracts, data model, design decisions
- `README.md` — setup instructions, architecture overview, future improvements (RAG, rolling summarization, WebSocket, PowerSync)

## 3. First Duck Review

Both rubber duck LLMs (GPT and Gemini) reviewed all three specs simultaneously. Web research also ran in parallel to verify latest library versions. Found 10 issues:

1. **Version numbers outdated** — Angular should be 21 (not 20+), Capacitor 8 (not 6+), Ionic 8
2. **POST + EventSource mismatch** — EventSource only supports GET; switched to fetch + ReadableStream
3. **Ticker vs ID inconsistency** — API used `:id` with lowercase but LLM outputs uppercase; unified to ticker as canonical ID
4. **Bracket buffering fragile** — buffering on `[` during streaming breaks on normal markdown; switched to post-process regex
5. **Missing chat context limit** — no cap on messages sent to LLM; added MAX_HISTORY_MESSAGES
6. **"Survives app reinstall" misleading** — no auth means no user identity; reworded to "persists across app restarts on same backend instance"
7. **Cross-tab navigation undefined** — holding detail only in dashboard stack; made it a shared route
8. **Insight card behavior undefined** — what happens to existing chat; specified: pre-fill input, no auto-send, no clear history
9. **API_BASE_URL missing for mobile** — localhost doesn't work on device; added Angular environment config + device networking docs
10. **PRNG date determinism** — daily change inconsistent across restarts; seed now incorporates current date

All three files updated with fixes.

## 4. Manual Cross-Check

After automated duck reviews, did a manual line-by-line cross-check. Found one more inconsistency: design decisions table said "Lowercase ticker" but tickers are uppercase everywhere in API responses and LLM output. Fixed.

## 5. Spec Write — Testing Spec and Plan

Drafted two more files:
- `specs/testing-spec.md` — test stack (Vitest + supertest backend, Jasmine + Karma frontend), coverage targets, what to test and what NOT to test, mocking strategy
- `specs/plan.md` — 7 milestones with dependency graph, each milestone has explicit tasks, acceptance criteria mapped to requirement ACs, and gate commands

## 6. Second Duck Review (Plan)

Both ducks reviewed the plan against all three specs. Found 12 additional issues:

1. Chat state signal missing `error` state (spec says idle/thinking/streaming/error)
2. Streaming wire format (`data: {"content":"..."}` / `data: [DONE]`) not specified in plan tasks
3. Ticker normalization (case-insensitive API, uppercase responses) missing from plan
4. NFR-3 (no dark mode) not addressed — Ionic defaults to system theme
5. Insight card "no auto-send, no clear history" constraints not explicit in plan ACs
6. Frontend coverage targets (services 70%+, components 50%+) missing from milestone ACs
7. Exact range toggles (1W/1M/3M/1Y/All) and "All = 5 years" not explicit
8. Testing tools (supertest, in-memory SQLite, HttpTestingController) not mentioned in plan
9. AI provider env var configuration not explicit in M4
10. Backend routes 70%+ coverage target missing
11. seedrandom library not named in plan
12. API_BASE_URL mechanism ambiguous — should specify Angular environment files

Plan rewritten with all fixes.

## 7. Final Cross-Check

Systematic verification of every single acceptance criterion, every technical decision, and every testing target against the plan. Created a full mapping table:
- All 26 ACs from requirements.md mapped to specific milestone tasks and ACs
- All 15 technical spec decisions mapped to plan tasks
- All 8 testing spec points mapped to plan tasks
- Confirmed 100% consistency across all four spec files + README

## 8. Spec Enrichment

Enriched all specs with implementation details discovered during duck reviews:
- Ionic 8 / Angular 21 compatibility notes (peer dependency verification)
- ngx-markdown v21 breaking change (sanitization via `SANITIZE` injection token)
- better-sqlite3 Vitest ESM interop config note
- Error handling details: stream failure states, partial message cleanup, fail-fast on missing env vars
- Ticker format constraints (1-5 uppercase ASCII letters)
- Chat context management details (count by total messages, current message always included)
- Generator seed override parameter for deterministic testing
- Expanded testing spec with per-component test cases for all frontend components
- Chat input behavior (disabled when not idle, accepts pre-fill without auto-send)
- SSE framing details (events separated by `\n\n`, `Content-Type: text/event-stream`)

## 9. Screen Design (Google Stitch)

Created screen mockups using **Google Stitch** via MCP integration (project: [stitch.withgoogle.com/projects/8897956044003170225](https://stitch.withgoogle.com/projects/8897956044003170225)).

### Process

1. **Generated 3 screens** (Dashboard, Chat, Holding Detail) in parallel — all timed out but completed asynchronously on Stitch's side
2. **Duplicate cleanup** — parallel generation created duplicate chat screens. Stitch has no delete API, so duplicates were removed manually in the web UI
3. **Chat screen iteration** — initial chat screen was missing: ticker chips (NVDA/BTC/TSLA as tappable badges), text input field with placeholder, typing indicator (three dots). Stitch's `edit_screens` API creates new screens instead of modifying in-place. After multiple attempts via API, provided a prompt for manual editing in the Stitch web UI — all three fixes applied successfully
4. **Audit against specs** — fetched HTML of each screen via WebFetch and compared against every acceptance criterion. Dashboard and Holding Detail were solid; Chat needed the fixes above. Holding Detail had extras not in spec (Trade button, Latest News) — harmless for visual reference
5. **Screenshots saved** — initial downloads were 140px thumbnails; appended `=s0` to Google's image URLs to get full 780px resolution. Saved to `specs/screens/`
6. **Added to technical spec** — linked screenshots in a table at the top of `technical-spec.md` with a note that mockups define visual direction but specs are authoritative for scope

### Design System

Stitch auto-generated a design system ("Equitas Blue") when editing the chat screen. Extracted and rewrote it for Ionic 8 compatibility:

- **Original issues:** Used Tailwind classes (not in our stack), Material Design 3 tokens (not Ionic's variable system), inconsistent gain/loss colors (#4CAF50 vs #006e1c), vague spacing scale
- **Resolution:** Read Ionic 8 theming docs (CSS variables, colors, dark mode, component APIs for ion-card, ion-item, ion-tab-bar). Rewrote entire design system using proper Ionic CSS custom properties with correct base/contrast/shade/tint/RGB format
- **Saved as** `specs/design-system.md`

### Deliverables

| File | Content |
|------|---------|
| `specs/screens/dashboard.png` | Portfolio dashboard mockup (780x2850) |
| `specs/screens/chat.png` | AI chat mockup with ticker chips, input, typing indicator (780x1768) |
| `specs/screens/holding-detail.png` | Holding detail with price chart and position summary (780x3350) |
| `specs/design-system.md` | Ionic 8-native design system: colors, typography, spacing, component overrides, chart theming |

## 10. Spec Consistency Verification (3 rounds)

Ran exhaustive cross-document consistency checks using the **rubber duck council** (GPT + Gemini reviewing all specs simultaneously) and **code review agents**. Three rounds of progressively deeper analysis.

### Round 1 — Duck Council + Web Research (12 issues)

Sent all spec documents to both ducks with 10 targeted consistency questions. In parallel, ran web searches to verify tech stack versions. Found:

1. **Ionic 8 + Angular 21 compatibility risk** — forum posts only confirm Angular 20.x support; added verification step
2. **Case-insensitive ticker** — testing spec required it, but requirements and tech spec were silent. Added everywhere.
3. **"Predefined" vs "computed" insight cards** — AC-5.4 said "predefined" while AC-3.2 said "computed from portfolio data." Contradiction.
4. **Test seed injection missing** — testing spec assumed a fixed seed, but tech spec had no override parameter. Added seed/date overrides.
5. **Error state undertested** — tech spec defined 4 chat states but testing spec only covered 3 transitions
6. **6 missing component tests** — testing spec only covered 3 of 9 frontend components
7. **ngx-markdown v21 sanitization** — breaking change not mentioned anywhere. Added XSS prevention config.
8. **History range "All" mixed casing** — no case-insensitive parsing specified
9. **MAX_HISTORY_MESSAGES ambiguous** — "last 50 messages" but 50 what? Clarified: total regardless of role.
10. **SSE framing underspecified** — missing Content-Type, separator rules, delta vs accumulated
11. **Streaming error recovery undefined** — what happens if LLM stream dies mid-response?
12. **Vitest + better-sqlite3 ESM interop** — native module needs special config

### Round 2 — Code Review Agent (8 more issues)

After fixing round 1, deployed a code review agent to systematically trace every AC through all 4 documents. Found:

13. **Holding detail page group entirely missing from testing spec** — 3 components (page, price-chart, position-summary) had zero tests
14. **message-list component untested** — listed in tech spec but absent from testing spec
15. **Frontend insights.service.ts untested** — backend version tested, frontend version missing
16. **`createdAt` camelCase mapping unverified** — tech spec documents the mapping, testing spec didn't validate it
17. **Fail-fast for missing env vars** — testing spec specified it, tech spec didn't. Added to AI Proxy section.
18. **AC-4.1 unmapped in plan** — chat tab accessibility not referenced by AC number in any milestone
19. **POST request body `content` field** — contract defined but not validated in route tests
20. **Single-conversation constraint (AC-4.8)** — no explicit test scenario

### Round 3 — Duck Council Final Pass (4 more issues)

Targeted the ducks at the specific areas I suspected still had problems. They confirmed all 3 of my hunches plus found a 4th:

21. **AC-5.4 still said "predefined"** — contradicted the fixed AC-3.2 "computed from portfolio data." Fixed.
22. **Tech spec streaming transitions only showed happy path** — defined 4 states but only documented `idle → thinking → streaming → idle`. Added error transitions and recovery.
23. **Plan M2 task 3 listed `dailyChange` as per-holding field** — tech spec API contract has it at portfolio level only. Fixed.
24. **"asset type" vs "type" naming** — data generation prose said "asset type" but API contract uses `type`. Aligned to `type`.

**Total: 24 issues found and fixed across 3 verification rounds.**

## 11. Mobile App Spec

Reviewed all three Stitch mockups pixel by pixel and created `specs/mobile-app-spec.md` — a screen-by-screen implementation guide.

### Process

1. **Mockup analysis** — documented every visual element on each screen: layouts, colors, typography, spacing, component arrangement
2. **Scope decisions** — identified 7 mockup elements not in requirements (Trade button, Latest News, tags, SEE ALL links, hamburger menu, user avatar, LIVE BREAKDOWN link). Decided to **skip all** — mockups define visual style, specs define features.
3. **Added scope note to tech spec** — "mockups define visual style and layout direction but are not the source of truth for features or scope"
4. **Design token extraction** — extracted colors, typography scale, spacing scale, border radius from mockups into CSS custom property definitions
5. **Screen-by-screen spec** — detailed layout (top to bottom), component specs, interaction patterns for Dashboard, Chat, and Holding Detail
6. **Cross-cutting concerns** — loading states (skeleton screens), empty states, number formatting rules, Ionic theme configuration, keyboard behavior

### Deliverable

`specs/mobile-app-spec.md` — design tokens, 3 screen layouts, component specs, interaction patterns, loading/empty states, Ionic theme config, out-of-scope list.

## 12. Plan Decomposition

The original plan had 7 milestones, two of which (M3: 17 tasks, M5: 13 tasks) were too large and mixed concerns.

### Decomposition decisions

1. **Split M3 into M3a/M3b/M3c** — separated plumbing (services, models, navigation) from screen UI (dashboard, holding detail). Each screen became its own milestone.
2. **Split M5 into M5a/M5b** — separated streaming logic (service, state machine, SSE parsing) from chat screen UI (bubbles, input, holding links).
3. **Parallelized backend and frontend tracks** — M3a no longer depends on M2. Both tracks start after M1 and converge at M6 for integration.
4. **Result:** 9 focused milestones (5-12 tasks each), maximum parallelism, each independently testable.

### Mocking strategy simplification

Originally planned broad mocking (HttpTestingController for frontend, mocked SQLite, etc.). Simplified to: **only mock the outbound LLM API call**. Everything else is real — real SQLite (in-memory for tests), real Express routes, real frontend HTTP to running backend. Simpler, more honest, catches more integration bugs.

## Final Deliverables

| File | Content |
|------|---------|
| `specs/requirements.md` | 6 FRs with 24 acceptance criteria, 3 NFRs, explicit out-of-scope list |
| `specs/technical-spec.md` | Architecture, component structure, API contracts, screen mockups, design decisions |
| `specs/design-system.md` | Ionic 8-native design system: colors, typography, spacing, component overrides |
| `specs/mobile-app-spec.md` | Screen-by-screen implementation guide: design tokens, layouts, interactions, loading states |
| `specs/testing-spec.md` | Test stack, coverage targets, per-component test cases, mocking strategy (LLM API only) |
| `specs/plan.md` | 9 milestones with parallel backend/frontend tracks, dependency graph, gate commands |
| `specs/screens/*.png` | 3 full-resolution screen mockups (Dashboard, Chat, Holding Detail) |
| `README.md` | Setup instructions, architecture overview, future improvements |
| `docs/design-session-summary.md` | This file — full design process narrative |
