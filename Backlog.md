# Backlog

## **Live “Now” everywhere**

- Public, read‑only API endpoint for current “Now” entry per user (e.g., `GET /v1/now/:userToken`).
- Simple JSON payload: text, timestamp, completed flag, mood.
- Tiny embeddable widgets/snippets for: browser overlays, stream overlays, dashboards, TVs, e‑ink/mini displays.

## **Custom hardware display**

- Open spec for a “Now display” (Wi‑Fi or Bluetooth) that polls the public API and shows the current “doing”.
- Reference implementation: small open‑source firmware + enclosure (e.g., e‑ink or OLED, single line + time).
- Hooks for others to build alternative firmwares or use the device for other status data.

## **Voice capture**

- In‑app voice capture button (web + native) using OS‑level speech‑to‑text APIs to fill “What am I doing?” and auto‑submit.
- Optional “push‑to‑talk” mode: press/hold, speak, release → entry created.
- Voice shortcuts integration (Siri/Google/Alexa) for “Log what I’m doing” that routes through a minimal API endpoint.

## **“Pro Do‑er” tier**

- Enhanced filters and search: by date ranges, completed vs not, mood, text search.
- Insight views:
    - When you most often log “doing the thing”.
    - Completion rate (intent → did the thing).
    - Light mood trends around key types of work.
- Export: CSV/JSON of entries; scheduled email summaries.
- Maybe: custom mood sets, extra themes, more granular widgets.

## **Native and widget experiences**

- iOS/Android apps with:
    - Home screen widget showing current “Now” and last 1–3 entries.
    - One‑tap quick entry from widget (opens a minimal compose or logs a prefilled micro‑step).
- Mac app:
    - Menu‑bar mini‑view with “Now”, input, last few entries.
    - Optional desktop widget (Sonoma) showing “Now” only.
- Later: Windows tray app and simple web‑extension button for instant capture.