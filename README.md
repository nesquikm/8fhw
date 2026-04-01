# AI Portfolio Companion

A mobile-first AI portfolio companion app for viewing investment portfolios (stocks and crypto), chatting with an AI assistant about holdings, and receiving contextual portfolio insights.

Built with **Angular 21 / Ionic 8 / Capacitor 8** (frontend) and **Node.js / Express** (backend).

> **AI Pipeline:** This project uses [Claude Code](https://docs.anthropic.com/en/docs/build-with-claude/claude-code/overview) with the [dev-process-toolkit](https://github.com/nesquikm/dev-process-toolkit) plugin for structured development workflows (gate checks, TDD cycles, spec reviews, debugging protocols). The plugin is configured in `.claude/settings.json`. Additional MCP integrations: [rubber-duck](https://github.com/nesquikm/rubber-duck) for multi-LLM review councils (GPT + Gemini), and [Google Stitch](https://stitch.withgoogle.com) for screen mockup generation. Rubber-duck and Stitch require API keys and are configured in the user-level Claude Code config (`~/.claude/settings.json`), not in the project repo.

## Features

- **Portfolio Dashboard** — total value, daily change, allocation chart, grouped holdings list
- **AI Chat** — streaming conversation with portfolio-aware AI assistant, markdown rendering, tappable holding references
- **Insight Cards** — contextual portfolio insights that bridge into AI chat
- **Holding Detail** — historical price charts (TradingView lightweight-charts), position summary

## Design Process

Full design narrative: [`docs/design-session-summary.md`](docs/design-session-summary.md) — covers brainstorming, spec writing, 3 rounds of AI-assisted consistency verification (24 issues found and fixed), screen design via Google Stitch, mobile app spec creation, and plan decomposition into parallel tracks.

Screen mockups: [Google Stitch Project](https://stitch.withgoogle.com/projects/8897956044003170225)

## Project Structure

```
├── frontend/       # Angular 21 / Ionic 8 / Capacitor 8
├── backend/        # Node.js / Express / TypeScript
├── docs/           # Design process documentation
└── specs/          # Requirements, technical spec, assessment
```

## Prerequisites

- Node.js 20+
- npm 10+
- Xcode (for iOS) or Android Studio (for Android)
- An OpenAI-compatible API key

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your AI provider config
npm run dev
```

#### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `AI_API_URL` | OpenAI-compatible API base URL | `https://api.openai.com/v1` |
| `AI_API_KEY` | API authentication token | `sk-...` |
| `AI_MODEL` | Model name | `gpt-4o` |
| `MAX_HISTORY_MESSAGES` | Chat messages sent to LLM | `50` |
| `CORS_ORIGIN` | Additional allowed origin (optional) | `http://192.168.1.100:4200` |

The backend uses any **OpenAI-compatible API** (`POST /chat/completions` with `stream: true`) — works with OpenAI, Gemini, Ollama, or any compatible provider.

### Frontend

```bash
cd frontend
npm install
ng serve
# App runs at http://localhost:4200
```

### Mobile (iOS)

```bash
cd frontend
ionic build
ionic cap sync ios
ionic cap open ios
# Build and run from Xcode
```

### Mobile (Android)

```bash
cd frontend
ionic build
ionic cap sync android
ionic cap open android
# Build and run from Android Studio
```

### Running on a Device / Simulator

When running on a physical device or simulator, the app cannot reach `localhost` on your dev machine. Configure `API_BASE_URL` in the frontend Angular environment to point to your machine's LAN IP:

```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://192.168.1.XXX:3000'  // your LAN IP
};
```

Make sure the backend is accessible on your local network (no firewall blocking port 3000).

## API

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/portfolio` | Full portfolio (value, change, allocations, holdings) |
| GET | `/api/holdings/:ticker` | Holding detail by ticker (case-insensitive) |
| GET | `/api/holdings/:ticker/history?range=` | Price history — range: `1W`, `1M`, `3M`, `1Y`, `All` |
| GET | `/api/insights` | Portfolio insight cards |
| GET | `/api/chat/messages` | Chat message history |
| POST | `/api/chat/messages` | Send message, streams AI response (SSE) |

## Architecture

### AI Integration: Context-Augmented Generation (CAG)

The AI chat uses **Context-Augmented Generation** — on every chat request, the backend injects the user's current portfolio data directly into the LLM system prompt. This ensures the AI always has up-to-date context about holdings, values, and allocations without needing a vector database or retrieval pipeline.

This approach works because portfolio data is small enough to fit entirely in the LLM context window. The backend sends the last `MAX_HISTORY_MESSAGES` messages as conversation history to maintain context without overflow.

### Mock Data

All financial data (holdings, prices, history) is generated using a **seeded pseudorandom number generator** (seedrandom). The seed incorporates the current date, so data is deterministic within a calendar day but evolves naturally over time — no JSON fixtures needed.

### Streaming

AI responses stream via `fetch` + `ReadableStream` consuming a POST-based chunked response with SSE-formatted data lines. This provides token-by-token rendering for a polished chat experience. Standard `EventSource` is not used because it only supports GET requests.

## Claude Code Usage Stats

Built entirely with Claude Code over 2 days (March 31 – April 1, 2026).

| Metric | Value |
|---|---|
| Sessions | 21 |
| Assistant messages | 2,195 |
| Model | Claude Opus 4.6 |
| Output tokens | 492K |
| Cache read tokens | 160.15M |
| Cache creation tokens | 6.64M |
| **Total tokens** | **167.3M** |
| **Estimated cost** | **~$462** |
| Tests | 252 (85 backend + 167 frontend) |
| Coverage (lines) | 97% backend / 89% frontend |

## Future Improvements

### Rolling Summarization
For unlimited conversation length without losing context, implement rolling summarization — compress older messages into a summary while keeping recent turns intact. See: https://dev.to/nesquikm/how-i-fit-50-turn-stories-into-6k-tokens-1pe

### WebSocket Support
The current streaming is one-directional (server to client). For proactive server-initiated conversations (e.g., real-time alerts when a holding moves significantly), WebSockets would be needed. Trade-off: higher backend resource usage due to persistent connections.

### Offline-First with Sync
Currently, chat history is persisted only on the backend (SQLite). A production app should persist and sync on the frontend too, using a synchronization protocol like **PowerSync** (purpose-built for SQLite sync between client and server). This enables offline usage and faster UI with optimistic updates.

### RAG with Embeddings
As user data grows beyond what fits in a single LLM context window — transaction history, market news, research notes, documents — the CAG approach should graduate to proper **Retrieval-Augmented Generation (RAG)**. This involves embedding documents into a vector database, retrieving relevant chunks per query, and injecting only the most relevant context. This enables scaling to large portfolios with rich historical data while keeping AI responses grounded and accurate.

## License

[MIT](LICENSE)
