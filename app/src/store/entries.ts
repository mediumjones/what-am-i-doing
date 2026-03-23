import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Entry } from '../types/entry'

interface EntriesState {
  entries: Entry[]
  addEntry: (text: string) => void
  completeEntry: (id: string) => void
  updateText: (id: string, text: string) => void
  setMood: (id: string, emoji: string | null, note: string | null) => void
}

export const useEntries = create<EntriesState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (text) =>
        set((state) => {
          const now = new Date().toISOString()
          const updated = state.entries.map((e) =>
            e.is_now ? { ...e, is_now: false } : e,
          )
          const entry: Entry = {
            id: crypto.randomUUID(),
            created_at: now,
            text,
            is_now: true,
            completed_at: null,
            mood_emoji: null,
            mood_note: null,
            edited_at: null,
          }
          return { entries: [entry, ...updated] }
        }),

      completeEntry: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  completed_at: new Date().toISOString(),
                  is_now: false,
                }
              : e,
          ),
        })),

      updateText: (id, text) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, text, edited_at: new Date().toISOString() }
              : e,
          ),
        })),

      setMood: (id, emoji, note) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, mood_emoji: emoji, mood_note: note } : e,
          ),
        })),
    }),
    {
      name: 'waid-entries',
    },
  ),
)
