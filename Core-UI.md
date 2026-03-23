# Core UI

## Core UI

- Top: always‑visible **Now** line
    - Examples:
        - “Now: writing project brief”
        - “You’re doing the thing: replying to Jess”
    - Empty state: “Now: not set yet” until first entry.
- Middle: main input
    - Label/prompt: “What am I doing?”
    - Optional helper text: “Name the next tiny step to do the thing.”
    - On submit: input clears, “Now” updates, status text appears briefly.
- Status / feedback microcopy
    - Neutral/primary:
        - “Saved · 11:24”
        - “Updated just now”
        - “Logged this moment”
    - Occasional intention nudges:
        - “Logged · 11:24 — now go do the thing.”
        - “Clear. Time to do the thing.”
    - Completion feedback (on checkbox):
        - “You did the thing. Nice.”
        - “Did the thing · 3:07 pm.”
- Bottom: timeline of past entries
    - Structure: chronological list grouped by date (Today, Yesterday, Earlier / by month/year).
    - Per‑entry row:
        - [checkbox] [time] [editable text] [mood emoji]
        - Checkbox: marks `completed`; visually dims/strikes through but does not remove or reorder.
        - Emoji: default neutral icon; click opens popover with emoji grid + optional note field.
    - Sits directly below the input; the most recent non‑Now entry is at the top of the list.

## Emoji + mood popover

- Trigger: click the emoji icon on a row.
- Popover contents:
    - Grid of common moods (🙂 😐 😣 😌 😡 etc.) for one‑tap selection.
    - Below grid: small field labeled “Optional note” for a short feeling/context line.
- Behavior: setting emoji or note does not change state (only metadata), and is entirely optional.

## Motion and feedback

- On submit:
    - Old “Now” slides/fades down into the top of the timeline (100–150ms, ease‑out).
    - New “Now” text crossfades in with a slight scale 0.98 → 1.0 (80–120ms).
    - Status text (“Saved · 11:24”) fades in under input and auto‑fades after ~1.5–2s.
- On checkbox tick:
    - Quick checkmark draw (90–120ms).
    - Row text opacity drops slightly; optional light strike‑through animates in.
- Overall: quiet, minimal, no sound, no gamified effects.

## States (per entry)

- A: Draft in input (not yet an entry).
- B: Active “Now” entry.
- C: Logged in timeline (incomplete).
- D: Logged in timeline (completed).

## Entry fields

- `id`
- `created_at` (on submit)
- `text`
- `is_now` (boolean; only one true globally)
- `completed_at` (nullable timestamp)
- `mood_emoji` (nullable)
- `mood_note` (nullable)
- `edited_at` (nullable; set when text edited after creation)

## Transitions

1. Input → submit
    - Create new entry with `is_now = true`.
    - Previous `is_now` entry (if any): set `is_now = false` → becomes State C.
    - New entry is State B.
2. Edit “Now” text
    - Update State B’s `text` (and `edited_at` if you track edits).
    - State remains B.
3. Submit another entry later
    - Current State B → State C (`is_now = false`).
    - New entry → State B (`is_now = true`).
4. Check checkbox on any logged entry
    - State C → State D (`completed_at` set).
    - If you allow completion on the current “Now”, State B → State D and `is_now` becomes false (you may then have no current Now until next entry).
5. Set/change emoji or mood note
    - Update `mood_emoji`/`mood_note`; state (C or D) unchanged.
6. Edit text of a logged entry
    - Update `text`, set `edited_at`; state (C or D) unchanged.