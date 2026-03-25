export interface Entry {
  id: string
  created_at: string
  text: string
  is_now: boolean
  completed_at: string | null
  feeling: string | null
  edited_at: string | null
}
