# Design System: Equitas Blue

## 1. Overview

A clean, professional financial app aesthetic. Authoritative and stable, yet airy and modern.

**Key principles:**

- **Editorial White Space** — negative space is structural, not empty
- **Tonal Layering** — depth via background color shifts, not borders
- **High-contrast typography** — important numbers dominate the screen

---

## 2. Colors

### Ionic Theme Colors

Each Ionic color requires base, contrast, shade, tint, and RGB variants. Define in `src/theme/variables.scss`:

```scss
:root {
  // --- Primary (Navy) ---
  --ion-color-primary: #001e40;
  --ion-color-primary-rgb: 0, 30, 64;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #001a38;
  --ion-color-primary-tint: #1a3553;

  // --- Secondary (Gains Green) ---
  --ion-color-secondary: #006e1c;
  --ion-color-secondary-rgb: 0, 110, 28;
  --ion-color-secondary-contrast: #ffffff;
  --ion-color-secondary-contrast-rgb: 255, 255, 255;
  --ion-color-secondary-shade: #006119;
  --ion-color-secondary-tint: #1a7d33;

  // --- Tertiary (Accent Blue) ---
  --ion-color-tertiary: #3a5f94;
  --ion-color-tertiary-rgb: 58, 95, 148;
  --ion-color-tertiary-contrast: #ffffff;
  --ion-color-tertiary-contrast-rgb: 255, 255, 255;
  --ion-color-tertiary-shade: #335482;
  --ion-color-tertiary-tint: #4e6f9f;

  // --- Success (same as secondary for consistency) ---
  --ion-color-success: #006e1c;
  --ion-color-success-rgb: 0, 110, 28;
  --ion-color-success-contrast: #ffffff;
  --ion-color-success-contrast-rgb: 255, 255, 255;
  --ion-color-success-shade: #006119;
  --ion-color-success-tint: #1a7d33;

  // --- Danger (Losses Red) ---
  --ion-color-danger: #ba1a1a;
  --ion-color-danger-rgb: 186, 26, 26;
  --ion-color-danger-contrast: #ffffff;
  --ion-color-danger-contrast-rgb: 255, 255, 255;
  --ion-color-danger-shade: #a41717;
  --ion-color-danger-tint: #c13131;

  // --- Medium (Secondary text) ---
  --ion-color-medium: #43474f;
  --ion-color-medium-rgb: 67, 71, 79;
  --ion-color-medium-contrast: #ffffff;
  --ion-color-medium-contrast-rgb: 255, 255, 255;
  --ion-color-medium-shade: #3b3e46;
  --ion-color-medium-tint: #565961;

  // --- Light ---
  --ion-color-light: #f4f3f8;
  --ion-color-light-rgb: 244, 243, 248;
  --ion-color-light-contrast: #1a1c1f;
  --ion-color-light-contrast-rgb: 26, 28, 31;
  --ion-color-light-shade: #d7d6da;
  --ion-color-light-tint: #f5f4f9;
}
```

### Application-Level Variables

```scss
:root {
  // --- Backgrounds ---
  --ion-background-color: #f9f9fe;
  --ion-background-color-rgb: 249, 249, 254;
  --ion-text-color: #1a1c1f;
  --ion-text-color-rgb: 26, 28, 31;
  --ion-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --ion-toolbar-background: #001e40;
  --ion-toolbar-color: #ffffff;

  // --- App-specific custom properties ---
  --app-surface: #f9f9fe;
  --app-surface-low: #f4f3f8;
  --app-surface-container: #eeedf2;
  --app-surface-high: #e8e8ed;
  --app-primary-gradient: linear-gradient(135deg, #001e40, #003366);
  --app-gain: #006e1c;
  --app-gain-bg: #91f78e;
  --app-loss: #ba1a1a;
  --app-loss-bg: #ffdad6;
  --app-outline: #737780;
  --app-outline-variant: #c3c6d1;
  --app-shadow: 0px 12px 32px rgba(26, 28, 31, 0.06);
}
```

### Stepped Colors

Ionic uses stepped colors for component depth. Generate from background (#f9f9fe) to text (#1a1c1f) using the [Ionic Stepped Color Generator](https://ionicframework.com/docs/theming/themes#stepped-color-generator) and paste into `variables.scss`.

### Theme: Single Light Mode

The app ships with **one theme only** — the light palette defined above. There is no dark mode.

**Implementation:** Do not import `dark.always.css`, `dark.system.css`, or `dark.class.css` in `angular.json` styles. The absence of these imports enforces light-only mode. No `@media (prefers-color-scheme: dark)` overrides are needed — without the dark CSS imports, Ionic components remain light regardless of OS setting.

### Usage Rules

- **Gains** — text: `var(--app-gain)`, chip background: `var(--app-gain-bg)`
- **Losses** — text: `var(--app-loss)`, chip background: `var(--app-loss-bg)`
- **Never use** `#000000`. All "black" text via `var(--ion-text-color)` (#1a1c1f).
- **No 1px borders** for content separation. Use background shifts between `--app-surface`, `--app-surface-low`, and `--ion-background-color`.
- **Ghost borders** only for accessibility: `1px solid rgba(195, 198, 209, 0.15)`.

---

## 3. Typography

**Font:** Inter (load via Google Fonts or bundle locally).

### Scale

| Role | Size | Weight | Usage |
|---|---|---|---|
| Display | 2rem (32px) | 700 | Portfolio total value |
| Headline | 1.25rem (20px) | 600 | Section titles ("Stocks", "Crypto") |
| Body Large | 1rem (16px) | 400 | Primary content |
| Body | 0.875rem (14px) | 400 | Secondary content, descriptions |
| Label | 0.75rem (12px) | 500, uppercase, `letter-spacing: 0.05rem` | Tickers, chart legends |

### Rules

- The most important number on any screen should be at least 2 size-steps larger than surrounding text.
- Secondary text uses `color="medium"` or `var(--ion-color-medium)` (#43474f).

---

## 4. Spacing

4px grid system. Define as CSS custom properties:

```scss
:root {
  --spacing-1: 0.25rem;   // 4px
  --spacing-2: 0.5rem;    // 8px — between chips
  --spacing-3: 0.75rem;   // 12px — between list items (replaces dividers)
  --spacing-4: 1rem;      // 16px — standard padding
  --spacing-5: 1.25rem;   // 20px — minimum side margins
  --spacing-6: 1.5rem;    // 24px — section spacing
  --spacing-8: 2rem;      // 32px — between major sections
  --spacing-10: 2.5rem;   // 40px — above section headlines
  --spacing-16: 4rem;     // 64px — top-of-page padding
}
```

### Rules

- Minimum side margin: `var(--spacing-5)` for all main content.
- List items separated by `var(--spacing-3)` vertical gap — **no divider lines**.
- Scrollable card trays: `var(--spacing-2)` gap between cards.

---

## 5. Border Radius

```scss
:root {
  --radius-sm: 0.375rem;   // 6px — chips, badges
  --radius-md: 0.5rem;     // 8px — inputs, small cards
  --radius-lg: 0.75rem;    // 12px — cards, containers
  --radius-xl: 1rem;       // 16px — large dashboard cards
  --radius-full: 9999px;   // pill buttons, circular elements
}
```

---

## 6. Elevation & Depth

### Surface Hierarchy (Tonal Layering)

| Layer | Variable | Hex | Usage |
|---|---|---|---|
| Base | `--app-surface` | #f9f9fe | Page background |
| Section | `--app-surface-low` | #f4f3f8 | Section backgrounds |
| Card | `--ion-background-color` | #ffffff | Cards, list items |
| Raised | `--app-surface-high` | #e8e8ed | Active/selected states |

### Shadows

Only when an element must visually float (modals, FABs):

```scss
box-shadow: var(--app-shadow); // 0px 12px 32px rgba(26, 28, 31, 0.06)
```

Do **not** use standard Material Design drop shadows.

### Hero Gradient

Portfolio summary header:

```scss
.portfolio-header {
  background: var(--app-primary-gradient); // 135deg, #001e40 → #003366
  color: #ffffff;
}
```

---

## 7. Ionic Component Overrides

### Removing Borders (`global.scss`)

```scss
// Remove default item lines/borders
ion-item {
  --border-color: transparent;
  --inner-border-width: 0;
}

// Or use the lines attribute on individual items:
// <ion-item lines="none">
```

### ion-card

```scss
ion-card {
  --background: #ffffff;
  --color: var(--ion-text-color);
  border-radius: var(--radius-xl);
  box-shadow: none;
  margin: 0;
}
```

### ion-tab-bar (Glassmorphism)

```scss
ion-tab-bar {
  --background: rgba(255, 255, 255, 0.8);
  --border: none;
  --color: var(--ion-color-medium);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

### ion-toolbar

```scss
ion-toolbar {
  --background: var(--ion-toolbar-background);
  --color: var(--ion-toolbar-color);
  --border-width: 0;
}
```

### ion-list

```scss
ion-list {
  background: transparent;
}
```

---

## 8. App-Specific Components

### Holding Chip (`[HOLDING:TICKER]` links)

Use `ion-chip` with custom styling:

```html
<ion-chip class="holding-chip" (click)="goToHolding(ticker)">
  <ion-label>{{ ticker }}</ion-label>
</ion-chip>
```

```scss
.holding-chip {
  --background: var(--app-surface-low);
  --color: var(--ion-color-primary);
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.05rem;
  text-transform: uppercase;
  border-radius: var(--radius-sm);
}
```

### Gain/Loss Chips

```scss
.chip-gain {
  --background: var(--app-gain-bg);
  --color: var(--app-gain);
  font-weight: 600;
}

.chip-loss {
  --background: var(--app-loss-bg);
  --color: var(--app-loss);
  font-weight: 600;
}
```

---

## 9. Chart Theming

### Donut Chart (Chart.js via ng2-charts)

```typescript
colors: [
  '#003366',  // primary — stocks
  '#78dc77',  // secondary dim — crypto
]
// No border on segments
// Place directly on card surface, no containing box
```

### Price Chart (TradingView Lightweight Charts)

```typescript
{
  layout: {
    background: { color: '#ffffff' },
    textColor: '#43474f',
    fontFamily: 'Inter',
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: '#f4f3f8' },
  },
  // Area series options:
  lineColor: '#003366',
  topColor: 'rgba(0, 51, 102, 0.2)',
  bottomColor: 'rgba(0, 51, 102, 0.0)',
}
```

---

## 10. Do's and Don'ts

### Do:

- Use generous top padding (`var(--spacing-16)`) for editorial feel
- Use `var(--radius-xl)` for large dashboard cards
- Make the most important number 2 font-steps larger than surroundings
- Show partial next card in horizontal scroll to signal scrollability
- Use `var(--app-primary-gradient)` for portfolio summary header
- Use `lines="none"` on `ion-item` to remove default borders

### Don't:

- Use `#000000` — always `var(--ion-text-color)` (#1a1c1f)
- Use 1px dividers between list items — use `var(--spacing-3)` gaps
- Use standard Material Design drop shadows — only `var(--app-shadow)`
- Crowd edges — minimum side margin `var(--spacing-5)`
- Import dark palette CSS files (`dark.always.css`, `dark.system.css`, `dark.class.css`)
