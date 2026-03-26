export type Note = {
  id: string
  user_id: string
  title: string
  content: string
  is_pinned?: boolean
  is_favorite?: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}
