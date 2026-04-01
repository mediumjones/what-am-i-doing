import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CustomFeeling {
  emoji: string
  label: string
}

interface CustomFeelingsState {
  feelings: CustomFeeling[]
  addFeeling: (feeling: CustomFeeling) => void
  removeFeeling: (emoji: string) => void
}

export const useCustomFeelings = create<CustomFeelingsState>()(
  persist(
    (set) => ({
      feelings: [],

      addFeeling: (feeling) =>
        set((state) => {
          // Replace if same emoji already exists
          const filtered = state.feelings.filter((f) => f.emoji !== feeling.emoji)
          return { feelings: [...filtered, feeling] }
        }),

      removeFeeling: (emoji) =>
        set((state) => ({
          feelings: state.feelings.filter((f) => f.emoji !== emoji),
        })),
    }),
    { name: 'waid-custom-feelings' },
  ),
)
