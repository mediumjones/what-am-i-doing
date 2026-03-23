export interface Entry {
  id: string
  created_at: string
  text: string
  is_now: boolean
  completed_at: string | null
  mood_emoji: string | null
  mood_note: string | null
  edited_at: string | null
}
