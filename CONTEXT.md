# What Am I Doing? — Project Context

> Interstitial journal app: a low-friction "now" log that helps scattered people anchor attention by naming the thing they're doing, then going to do it.

## Philosophy

- **Log → see "Now" → go do the thing.** The app is a waypoint, not a destination.
- One-line entries, present-tense actions. No planners, streaks, gamification, or guilt.
- ADHD-informed but generalized. Forgiving by design — 1 entry/day or gaps of weeks are fine.
- Copy tone: clear, calm, a bit friendly. "Do the thing" / "did the thing" used sparingly and tied to real-world action.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19 + TypeScript | Fast iteration, strong ecosystem |
| Build | Vite 8 | HMR, fast builds, Tailwind plugin |
| Styling | Tailwind CSS 4 | Utility-first, custom theme via CSS variables |
| State | Zustand 5 + `persist` middleware | Minimal boilerplate, localStorage persistence |
| Animation | Framer Motion 12 | `AnimatePresence` for enter/exit, gesture support |
| Routing | React Router 7 | Minimal use (single page currently) |
| Font | Inter (Google Fonts) | Clean, variable-weight sans-serif |
| PWA | `manifest.json` + viewport meta | Standalone mode, safe-area support |

### Key Decisions

- **No backend yet.** All data lives in localStorage via Zustand persist. This keeps iteration fast but limits cross-device sync and data durability.
- **No service worker yet.** PWA manifest exists but offline support isn't implemented.
- **No native wrapper.** Web-first, tested primarily on iOS Safari PWA. Native apps are a future goal.
- **Tailwind 4 `@theme` block** for design tokens (colors, spacing, fonts) instead of `tailwind.config.js`.
- **Framer Motion over CSS animations** for coordinated enter/exit sequences (completion flow, toast stacking).
- **`crypto.randomUUID()`** for entry IDs with a fallback for non-secure contexts (HTTP on LAN during dev).

---

## Architecture

```
app/
├── src/
│   ├── components/        # Reusable UI (Checkbox, Dialog, FeelingPicker, Toast, Tooltip, StrikethroughText)
│   ├── constants/         # Static data (feelings, toasts, emoji palette)
│   ├── dev/               # Dev-only tools (DevMenu, ViewportDebug)
│   ├── hooks/             # useVisualViewport, useAppHeight
│   ├── pages/             # Home.tsx (single page)
│   ├── store/             # Zustand stores (entries, customFeelings)
│   ├── types/             # TypeScript interfaces (Entry)
│   ├── App.tsx            # Root router
│   ├── main.tsx           # React entry
│   └── index.css          # Theme + global styles
├── public/
│   └── manifest.json      # PWA config
├── index.html             # Entry HTML with viewport/PWA meta
└── package.json
```

### Data Model

```typescript
interface Entry {
  id: string              // crypto.randomUUID()
  created_at: string      // ISO timestamp
  text: string            // The one-line action
  is_now: boolean         // Only one entry can be active
  completed_at: string | null  // ISO timestamp when done
  feeling: string | null  // Emoji character
  edited_at: string | null     // Reserved, not yet used
}

interface CustomFeeling {
  emoji: string
  label: string
}
```

**Storage keys:**
- `waid-entries` — entry array (newest first)
- `waid-custom-feelings` — user-created feeling emoji+label pairs

### Entry Lifecycle

```
Input (draft) → Submit → Active "Now" (is_now=true)
                              ↓ (new entry submitted)
                         Timeline item (is_now=false, incomplete)
                              ↓ (checkbox tapped)
                         Completed (completed_at set)
                              ↓ (checkbox tapped again)
                         Dialog → Uncomplete (restored to "Now")
```

When the active entry is completed and no other entry is active, the app auto-promotes the most recent incomplete entry to "Now."

---

## Current Features (as of 2026-04-11)

### Core Loop
- [x] Single-line text input with rotating placeholder prompts (14 variants)
- [x] Active "Now" entry displayed sticky at top of scroll area
- [x] Timeline of past entries below (newest first, no reverse)
- [x] Checkbox completion with animated strikethrough (350ms clip)
- [x] Uncomplete with confirmation dialog when another entry is active
- [x] Auto-promote latest incomplete entry to "Now" when active slot is empty

### Feelings
- [x] 10 preset feelings: 😌😊⚡🎯😶‍🌫️🌀🔁😔😰😩
- [x] Custom emoji picker with search (1000+ emoji, keyword index)
- [x] Custom feelings saved per-user (emoji + label, max 20 chars)
- [x] Feeling-specific toast messages (8-12 per emotion)
- [x] FeelingPicker with auto/forced direction (above/below)

### UI & Polish
- [x] Toast notifications — contextual messages on create/complete/uncomplete/feeling
- [x] Stacking toasts (multiple visible, newest on top, auto-dismiss 3.75s)
- [x] Haptic feedback on completion (`navigator.vibrate`)
- [x] Completion animation: strikethrough → 600ms complete → 900ms promote
- [x] Welcome empty state with onboarding copy
- [x] Tooltips on checkbox and submit button

### Mobile / PWA
- [x] iOS keyboard handling via VisualViewport API (force-scroll-to-top strategy)
- [x] Safe area insets for notch/Dynamic Island
- [x] `position: fixed` on html/body to prevent iOS scroll
- [x] `overscroll-behavior: none`, `touch-action: manipulation`
- [x] PWA manifest (standalone, theme color)
- [x] Viewport meta: `viewport-fit=cover`, `user-scalable=no`, `interactive-widget=resizes-content`

### Dev Tools
- [x] DevMenu: clear demo data, generate 20 sample entries, reload
- [x] ViewportDebug: live viewport metrics overlay (`?debug=1`)

---

## Roadmap

### Phase 1: Timer (next)
- Start/finish time tracking on entries
- Elapsed time display on active "Now" entry
- Duration shown on completed entries
- Data: `started_at` field or derive from `created_at` → `completed_at`

### Phase 2: Categories & Tags
- Lightweight tagging system for entries (e.g., work, personal, errand)
- Needed before summaries can group meaningfully
- Could be freeform tags or predefined categories

### Phase 3: Storage Refactor
- Evaluate localStorage limits vs. needs (summaries query across time ranges)
- Options: IndexedDB, SQLite (via OPFS), or stay with localStorage
- Markdown export as a user-facing feature (not as primary storage)
- Decide data format before building summary queries

### Phase 4: Summaries
- Daily / weekly / monthly views
- Insights: task categories, mood patterns, time-of-day trends, task duration
- Requires timer data + categories + queryable storage

### Phase 5: User Profile & Preferences
- On-device profile (name, preferences)
- Theme preferences (light/dark, accent color)
- Notification settings
- Data stored locally alongside entries

### Phase 6: Branding & UI Polish
- Final color palette, typography, iconography
- App icon and splash screen for PWA
- Loading states, empty states, error states
- Micro-interaction refinements

### Phase 7: Cloud Sync
- Cross-device sync (iCloud, hosted accounts, or custom backend)
- Requires auth, conflict resolution, API design
- Consider offline-first with sync (CRDTs or last-write-wins)

### Backlog (from product vision)
- Public read-only API for "Now" state (`GET /v1/now/:userToken`)
- Embeddable widgets (browser, stream overlays, dashboards)
- Custom hardware display (e-ink/OLED showing current task)
- Voice capture (speech-to-text via OS APIs)
- Native apps: iOS widget, Mac menu bar, Android widget
- Pro tier: search, filters, CSV/JSON export, custom mood sets

---

## Design Tokens

```css
--color-fg:      #1a1a1a   /* Primary text */
--color-fg-2:    #737373   /* Secondary text */
--color-fg-3:    #a3a3a3   /* Tertiary text, placeholders */
--color-bg:      #fafafa   /* Background */
--color-border:  #e5e5e5   /* Borders, dividers */
--color-done:    #a3a3a3   /* Completed entry text */
--color-check:   #10b981   /* Emerald — checkmark */
--color-primary: #1a1a1a   /* Buttons, primary actions */
```

Font: Inter 300/400/500 with `-0.011em` letter spacing.

---

## iOS Keyboard Strategy

iOS Safari doesn't support `dvh` for keyboard detection, `interactive-widget=resizes-content`, or the VirtualKeyboard API. The working solution:

1. `html, body { position: fixed; overflow: hidden; }` — prevents page scroll
2. `useVisualViewport` hook monitors `visualViewport.height` for actual visible area
3. On every viewport resize/scroll, force `window.scrollTo(0, 0)` to prevent iOS from scrolling the layout viewport
4. Container sized to `visualViewport.height` with `top: 0`
5. Input `onFocus` fires staggered `scrollTo(0, 0)` at 50ms and 150ms as backup
6. `overscroll-behavior: none` and `touch-action: manipulation` on html

---

## Known Gaps & Tech Debt

- **No tests.** No unit or integration tests exist yet.
- **No service worker.** PWA is add-to-homescreen only, no offline caching.
- **No app icons.** Manifest `icons` array is empty.
- **`edited_at` field** defined in type but never set by any action.
- **`mood_note` field** in Core-UI spec but not in current data model (only `feeling` emoji exists).
- **`useAppHeight` hook** exists but isn't used — superseded by `useVisualViewport`.
- **No date grouping** in timeline (Today / Yesterday / Earlier per Core-UI spec).
- **No entry editing** — text is immutable after creation.
- **React Router** imported but only wraps a single `<Home />` route.
- **DevMenu always enabled** in builds (guarded by `DEV_MENU_ENABLED` const, currently `true`).
