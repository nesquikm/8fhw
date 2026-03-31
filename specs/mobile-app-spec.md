# Mobile App Spec: AI Portfolio Companion

Visual implementation guide for screen layouts and component behavior. The specs (`requirements.md`, `technical-spec.md`, `design-system.md`) are the **source of truth** for features, scope, and design tokens. The Stitch mockups (`specs/screens/`) are **visual guidance** — they show how the app can look, not pixel-perfect rules. When in doubt, specs win over mockups.

## Design Tokens

All design tokens (colors, typography, spacing, border radius, elevation) are defined in **[`design-system.md`](design-system.md)** — the single source of truth for visual styling. This document references those tokens by name only. For values, see `design-system.md`.

## Screen: Portfolio Dashboard

### Layout (top to bottom)

1. **Hero Section** — gradient background (`--app-primary-gradient`), full-width
   - "TOTAL BALANCE" label (Label scale: 0.75rem/500, white, uppercase, 60% opacity)
   - Total value (Display scale: 2rem/700, white): `$125,430.50`
   - Change chip (`--radius-full`): gain → `--app-gain-bg` bg + `--app-gain` text; loss → `--app-loss-bg` bg + `--app-loss` text. Content: `+$1,250.30 (+1.01%)`
   - Padding: `--spacing-16` top, `--spacing-5` sides, `--spacing-6` bottom

2. **Asset Allocation Card** — white card on `--app-surface` background, `--radius-xl`
   - Header: "Asset Allocation" (Headline scale: 1.25rem/600)
   - Content: donut chart (left) + legend (right) in a row
   - Donut: `#003366` for stocks, `#78dc77` for crypto (per `design-system.md` §9 chart theming), centered number showing asset type count
   - Legend items: colored dot + label + percentage
   - Implementation: `ng2-charts` `DoughnutChart` with `cutout: '70%'`

3. **Portfolio Insights** — horizontal scrollable row
   - Header: "Portfolio Insights" (Headline scale: 1.25rem/600)
   - Cards: white bg, `--radius-xl`, `--spacing-4` padding, min-width ~280px
   - Each card: title (Body Large: 1rem, bold) + summary (Body: 0.875rem, `color="medium"`)
   - Scroll: CSS `overflow-x: auto` with `scroll-snap-type: x mandatory`, `--spacing-2` gap between cards
   - Dots indicator below (current card position)
   - Tapping a card: navigate to Chat tab with prompt pre-filled

4. **Holdings Sections** — one per asset type
   - Section header: "Stocks" / "Crypto" (Headline scale: 1.25rem/600)
   - List of holding rows (see Holding Row component below)
   - No dividers between rows — use `--spacing-3` vertical gap (per design-system rules)

5. **Bottom Tab Bar** — Ionic `ion-tab-bar` with glassmorphism styling (see `design-system.md` §7)
   - Two tabs: Dashboard (home icon) / Chat (chat bubble icon)
   - Active tab: `--ion-color-primary` icon + label
   - Inactive: `--ion-color-medium`

### Holding Row Component

Used in both Stocks and Crypto sections.

```
┌─────────────────────────────────────────────────┐
│  [AAPL]   Apple Inc.                  $8,925.00 │
│           50 SHARES • +70%    +$1,175.00(+15.16%)│
└─────────────────────────────────────────────────┘
```

- **Left column:** ticker badge (`--ion-color-primary` bg, `--ion-color-primary-contrast` text, `--radius-sm`, Label scale bold) + company name (Body Large) + secondary line (Body, `color="medium"`): "{quantity} SHARES • {dailyChange%}"
- **Right column (right-aligned):** current value (Body Large, bold) + gain/loss line (Body, `--app-gain` or `--app-loss` text): "+$1,175.00 (+15.16%)"
- Tappable: entire row navigates to Holding Detail
- Use `ion-item` with `lines="none"` for tap ripple effect

## Screen: AI Chat

### Layout (top to bottom)

1. **Header** — Ionic `ion-header` with `ion-toolbar` (`--ion-toolbar-background` navy, `--ion-toolbar-color` white)
   - Title: "AI Assistant" (Headline scale, white)
   - No hamburger menu (out of scope)

2. **Message List** — scrollable area, takes remaining vertical space
   - Scrolls to bottom on new messages and on initial load
   - Messages alternate alignment:
     - **User messages:** right-aligned, `--ion-color-primary` background, white text, `--radius-lg` (bottom-right corner squared: `border-bottom-right-radius: --spacing-1`)
     - **Assistant messages:** left-aligned, `--app-surface-container` background, `--ion-text-color` text, `--radius-lg` (bottom-left corner squared)
   - Spacing: `--spacing-2` between consecutive same-sender messages, `--spacing-4` between sender changes
   - Max-width: ~80% of screen width

3. **Thinking Indicator** — shown when chat state is `thinking`
   - Left-aligned assistant-style bubble with animated three dots
   - CSS animation: dots pulsing in sequence (opacity or scale)

4. **Holding Chips in Messages** (rendered from `[HOLDING:TICKER]` patterns)
   - Inline within message text flow
   - Style per `design-system.md` §8: `--app-surface-low` bg, `--ion-color-primary` text, `--radius-sm`, Label scale (0.75rem/600, uppercase, letter-spacing)
   - Tappable: navigates to Holding Detail

5. **Input Area** — fixed at bottom, above tab bar
   - Container: white bg, ghost border top (`1px solid rgba(195, 198, 209, 0.15)` per design-system ghost border rule)
   - Input field: `ion-input` or `ion-textarea`, `--radius-md`, `--app-surface-low` bg, placeholder "Ask about your portfolio..."
   - Send button: circular, `--ion-color-primary` background, white arrow icon, right of input
   - Send button disabled (reduced opacity) when input is empty or chat state is not `idle`
   - Padding: `--spacing-4` all around, safe-area bottom padding for notched devices

### Chat Markdown Rendering

Via `ngx-markdown` inside assistant message bubbles:
- **Bold** text renders as bold
- Lists render with proper indentation
- Tables render (may need horizontal scroll for wide tables)
- Code blocks render with monospace font and subtle background
- Links are tappable

## Screen: Holding Detail

### Layout (top to bottom)

1. **Header** — Ionic `ion-header` with back button, `ion-toolbar` (`--ion-toolbar-background` navy, white text)
   - Back arrow: navigates back to previous screen (Dashboard or Chat)
   - Title: company name (e.g., "Apple Inc."), white
   - Subtitle: "AAPL" (Label scale, white 60% opacity)

2. **Price Section** — below header
   - Current price (~1.75rem/700): `$178.50`
   - Change chip (`--radius-full`): gain → `--app-gain-bg` bg + `--app-gain` text; loss → `--app-loss-bg` bg + `--app-loss` text. "Today" label.
   - No "Trade" button (out of scope)
   - Padding: `--spacing-5` sides

3. **Price Chart** — TradingView lightweight-charts (see `design-system.md` §9)
   - Line chart with area fill: `lineColor: '#003366'`, `topColor: 'rgba(0, 51, 102, 0.2)'`, `bottomColor: 'rgba(0, 51, 102, 0.0)'`
   - Chart height: ~200px
   - Grid: vertical lines hidden, horizontal lines `--app-surface-low`
   - Crosshair: vertical line on touch with price tooltip
   - Range toggles below chart: row of buttons `1W | 1M | 3M | 1Y | All`
     - Active: `--ion-color-primary` background, white text
     - Inactive: transparent background, `color="medium"`
     - Shape: `--radius-sm`, `--spacing-1` gap between
     - Tapping a toggle: fetches new history data from backend, re-renders chart

4. **Position Summary Section** — white card, `--radius-xl`
   - Header: "YOUR POSITION" (Label scale: 0.75rem/500, uppercase, letter-spacing)
   - Two-column grid layout:
     - Current Value: (Body Large, bold)
     - Total Gain/Loss: colored `--app-gain` or `--app-loss`
   - Single-column rows below:
     - Quantity: `50.00 SHARES`
     - Avg Buy Price: `$155.00`
     - Portfolio Weight: `7.12%`
     - Sector: "Technology" (with icon/badge)

5. **About Section** — white card, `--radius-xl`
   - Header: "ABOUT {NAME}" (Label scale, uppercase)
   - Description text (Body Large, `color="medium"`): from `description` field in holding detail API
   - No tags (out of scope)

6. **No "Latest News" section** (out of scope)

## Loading & Empty States

### Loading States
- **Dashboard initial load:** skeleton screens — `--app-surface-high` pulsing rectangles matching the layout of hero section, chart, and holding rows
- **Holding detail chart loading:** skeleton rectangle in chart area, range toggles visible but disabled
- **Chat history loading:** centered spinner (`ion-spinner`)

### Empty States
- **Chat (no history):** centered text: "Ask me anything about your portfolio" with a suggested prompt below
- **No holdings (edge case):** "No holdings to display" in holdings section area

## Interaction Patterns

### Pull-to-Refresh
- Dashboard: `ion-refresher` at top — re-fetches portfolio data
- Not on Chat (messages are persisted, not refreshable)

### Navigation Transitions
- Tab switch: Ionic default (no animation, instant swap)
- Holding Detail push: Angular Router with Ionic `routerDirection="forward"` / `routerAnimation` — slide-in from right
- Back from Holding Detail: `ion-back-button` with slide-out to right

### Keyboard Behavior (Chat)
- Input field focused: keyboard pushes content up, message list remains scrolled to bottom
- Send on keyboard "return" or send button tap
- Keyboard dismisses on scroll up in message list

### Number Formatting
- Currency: `$1,234.56` (USD, 2 decimal places, comma thousands separator)
- Percentages: `+1.01%` or `-2.34%` (always show sign, 2 decimal places)
- Quantities: `50.00` (2 decimal places for stocks), crypto may vary (e.g., `0.5 BTC`, `4.25 ETH`)
- Gain/loss: always show sign (`+$1,175.00` or `-$500.00`), colored `--app-gain` / `--app-loss`

## Out-of-Scope Mockup Elements

The following elements appear in the Stitch mockups but are **not implemented** (not in requirements):

- "Trade" button on Holding Detail
- "SEE ALL" links on holdings sections
- "Latest News" section on Holding Detail
- Tags (S&P 500, Fortune 500, Hardware) on Holding Detail
- "LIVE BREAKDOWN" link on Asset Allocation
- Hamburger menu on Chat header
- User avatar icon on Dashboard header
