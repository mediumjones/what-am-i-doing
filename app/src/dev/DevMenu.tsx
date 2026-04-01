/**
 * Dev-only floating menu for testing.
 * Enable/disable via the DEV_MENU flag below.
 */

import { useState } from 'react'

// ── Toggle this flag to show/hide the dev menu ──
export const DEV_MENU_ENABLED = true

const SAMPLE_TEXTS = [
  'Reply to the email from Sarah',
  'Fix the login bug on staging',
  'Water the plants',
  'Review the pull request',
  'Write tests for the API',
  'Book the dentist appointment',
  'Update the README',
  'Sketch the new settings page',
  'Call Mom back',
  'Refactor the auth middleware',
  'Submit the expense report',
  'Pick up groceries on the way home',
  'Debug the mobile layout issue',
  'Send the invoice to the client',
  'Clean up the Figma file',
  'Take the dog for a walk',
  'Set up the CI pipeline',
  'Read that article about RSCs',
  'Move the laundry to the dryer',
  'Prep slides for tomorrow',
  'Cancel the unused subscription',
  'Pair with Jules on the migration',
  'File the tax extension',
  'Reorganize the component folder',
  'Order more coffee beans',
  'Write the changelog for v2',
  'Schedule the team retro',
  'Fix the flaky test in CI',
  'Back up the database',
  'Reply to the Slack thread',
]

const SAMPLE_FEELINGS = [
  '😌', '⚡', '😊', '🎯', '😶‍🌫️', '🌀', '🔁', '😔', '😰', '😩',
  '🔥', '☕', '💪', '🧠', '✨', '😎', '🤔', '😤', '🥱', null,
  null, null, null, null, null, // some with no feeling
]

function generateEntries(count: number) {
  const now = Date.now()
  const entries = []

  for (let i = 0; i < count; i++) {
    const minutesAgo = (count - i) * 12 + Math.floor(Math.random() * 8)
    const created = new Date(now - minutesAgo * 60000).toISOString()
    const isDone = i < count - 1 // last one is active
    const doneMinutesLater = 4 + Math.floor(Math.random() * 10)
    const completed = isDone
      ? new Date(now - (minutesAgo - doneMinutesLater) * 60000).toISOString()
      : null

    entries.push({
      id: `dev-${now}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      created_at: created,
      text: SAMPLE_TEXTS[i % SAMPLE_TEXTS.length],
      is_now: i === count - 1,
      completed_at: completed,
      feeling: SAMPLE_FEELINGS[i % SAMPLE_FEELINGS.length],
      edited_at: null,
    })
  }

  return entries
}

export default function DevMenu() {
  const [open, setOpen] = useState(false)

  const clearDemo = () => {
    localStorage.clear()
    sessionStorage.clear()
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister())
      })
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name))
      })
    }
    location.reload()
  }

  const refresh = () => {
    location.reload()
  }

  const addEntries = () => {
    const raw = localStorage.getItem('waid-entries')
    const existing = raw ? JSON.parse(raw)?.state?.entries ?? [] : []
    const newEntries = generateEntries(20)

    // If there's an existing active entry, deactivate it
    const updated = existing.map((e: { is_now: boolean }) =>
      e.is_now ? { ...e, is_now: false } : e
    )

    const merged = [...newEntries.slice(0, -1), ...updated, newEntries[newEntries.length - 1]]
    localStorage.setItem(
      'waid-entries',
      JSON.stringify({ state: { entries: merged }, version: 0 })
    )
    location.reload()
  }

  return (
    <div className="fixed top-0 left-0 z-[100] pt-[calc(var(--spacing-safe-top)+0.5rem)] pl-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 active:bg-black/15 flex items-center justify-center text-fg-3 text-xs font-mono transition-colors"
        title="Dev menu"
      >
        ⚙
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setOpen(false)}
          />
          {/* Menu */}
          <div className="mt-1 bg-white rounded-xl shadow-lg border border-border py-1 min-w-[180px]">
            <button
              type="button"
              onClick={() => { clearDemo(); setOpen(false) }}
              className="w-full text-left px-3.5 py-2.5 text-sm text-fg hover:bg-border/30 active:bg-border/50 transition-colors"
            >
              Clear demo
            </button>
            <button
              type="button"
              onClick={() => { addEntries(); setOpen(false) }}
              className="w-full text-left px-3.5 py-2.5 text-sm text-fg hover:bg-border/30 active:bg-border/50 transition-colors"
            >
              Add 20 entries
            </button>
            <div className="border-t border-border my-1" />
            <button
              type="button"
              onClick={() => { refresh(); setOpen(false) }}
              className="w-full text-left px-3.5 py-2.5 text-sm text-fg hover:bg-border/30 active:bg-border/50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </>
      )}
    </div>
  )
}
