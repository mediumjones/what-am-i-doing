import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Entry } from '../types/entry'

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Fallback for non-secure contexts (HTTP on LAN)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

interface EntriesState {
  entries: Entry[]
  addEntry: (text: string, feeling?: string | null) => void
  completeEntry: (id: string) => void
  uncompleteEntry: (id: string) => void
  setFeeling: (id: string, emoji: string | null) => void
}

export const useEntries = create<EntriesState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (text, feeling = null) =>
        set((state) => {
          const now = new Date().toISOString()
          const updated = state.entries.map((e) =>
            e.is_now ? { ...e, is_now: false } : e,
          )
          const entry: Entry = {
            id: genId(),
            created_at: now,
            text,
            is_now: true,
            completed_at: null,
            feeling,
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

      uncompleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, completed_at: null, is_now: true }
              : e.is_now
                ? { ...e, is_now: false }
                : e,
          ),
        })),

      setFeeling: (id, emoji) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, feeling: emoji } : e,
          ),
        })),
    }),
    {
      name: 'waid-entries',
    },
  ),
)
