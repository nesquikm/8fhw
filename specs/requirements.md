# Requirements: AI Portfolio Companion

## Overview
A mobile-first AI portfolio companion app for viewing investment portfolios
(stocks and crypto), chatting with an AI assistant about holdings, and
receiving contextual portfolio insights. Built with Angular 21, Ionic 8,
Capacitor 8, backed by Node/Express.

## Target User
Individual investor who wants a quick overview of their portfolio and
AI-powered analysis of their holdings on mobile.

## Functional Requirements

### FR-1: Portfolio Dashboard
The user can view a portfolio overview on the Dashboard tab.

- **AC-1.1:** Total portfolio value is displayed with daily change in $ and %
- **AC-1.2:** A donut chart shows allocation breakdown by asset type (stocks vs. crypto)
- **AC-1.3:** Holdings are listed grouped by asset type (Stocks section, Crypto section)
- **AC-1.4:** Each holding row shows: name, ticker, quantity, current value, gain/loss ($, %), % of portfolio
- **AC-1.5:** Tapping a holding navigates to the Holding Detail screen

### FR-2: Holding Detail
The user can view detailed information about a single holding.

- **AC-2.1:** Header displays asset name, ticker, and current price
- **AC-2.2:** A historical price chart is displayed with time range toggles: 1W, 1M, 3M, 1Y, All (All = 5 years)
- **AC-2.3:** Switching time range reloads chart data from the backend
- **AC-2.4:** Position summary shows: quantity, average buy price, current value, total gain/loss ($, %), % of portfolio
- **AC-2.5:** Holding Detail is accessible from both Dashboard (tapping a holding) and Chat (tapping a holding link) via shared route

### FR-3: Insight Cards
The user sees contextual insight cards on the dashboard that bridge to the chat.

- **AC-3.1:** Insight cards are displayed in a horizontal scrollable row on the dashboard
- **AC-3.2:** Cards are served from the backend (not hardcoded in the app). Card content is derived from the generated mock portfolio (e.g., actual allocation percentages and top holdings from the PRNG-generated data), not static text.
- **AC-3.3:** Each card has a title, summary text, and a pre-filled prompt
- **AC-3.4:** Tapping a card navigates to the Chat tab and pre-fills the prompt in the input field (does not auto-send, does not clear existing conversation)

### FR-4: AI Chat
The user can have a streaming conversation with an AI assistant about their portfolio.

- **AC-4.1:** Chat is accessible via the second bottom tab
- **AC-4.2:** User can type and send messages
- **AC-4.3:** AI responses stream token-by-token via fetch + ReadableStream (POST-based streaming)
- **AC-4.4:** A thinking/typing indicator is shown before the first token arrives
- **AC-4.5:** AI responses render markdown (bold, lists, tables, etc.)
- **AC-4.6:** When the AI references a holding using `[HOLDING:TICKER]` format, it renders as a tappable element that navigates to Holding Detail via shared route
- **AC-4.7:** Conversation history is persisted on the backend (SQLite) and loaded on app open. History persists across app restarts on the same backend instance.
- **AC-4.8:** Single continuous conversation (no multiple chat threads)
- **AC-4.9:** Backend sends a limited number of recent messages to the LLM (MAX_HISTORY_MESSAGES) to prevent context overflow

### FR-5: Backend API
A lightweight Node/Express API serves data and proxies AI requests.

- **AC-5.1:** `GET /api/portfolio` returns portfolio summary and all holdings (list-level data)
- **AC-5.2:** `GET /api/holdings/:ticker` returns single holding detail (includes additional data: sector, description). Ticker lookup is case-insensitive (`/api/holdings/aapl` and `/api/holdings/AAPL` return the same result).
- **AC-5.3:** `GET /api/holdings/:ticker/history?range=1M` returns historical price data for the given range
- **AC-5.4:** `GET /api/insights` returns insight cards derived from the generated mock portfolio (each containing id, title, summary, prompt)
- **AC-5.5:** `GET /api/chat/messages` returns persisted conversation history
- **AC-5.6:** `POST /api/chat/messages` accepts a user message and returns streaming AI response (chunked transfer encoding with SSE-like format)
- **AC-5.7:** All financial mock data is generated using a seeded PRNG (deterministic within the same calendar day — seed incorporates current date)
- **AC-5.8:** AI provider is configurable via environment variables: API URL, token, model name (OpenAI-compatible)

### FR-6: Mobile Deployment
The app runs on at least one mobile platform.

- **AC-6.1:** App builds and runs on iOS or Android via Capacitor
- **AC-6.2:** README includes clear instructions for running on a device/simulator, including API_BASE_URL configuration for device networking

## Non-Functional Requirements

- **NFR-1:** Mobile-first responsive design
- **NFR-2:** TypeScript strict mode
- **NFR-3:** Single theme (no dark mode)

## Out of Scope

- User authentication
- Real financial data / third-party market APIs
- Multiple chat conversations
- Rolling summarization (documented as future improvement)
- Offline-first sync (documented as future improvement, reference PowerSync)
- Dark mode
- WebSocket support (documented as future alternative to SSE)
