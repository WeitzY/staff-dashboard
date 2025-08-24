// Shared UI-facing types for Configuration features (FAQs and Items)
// These types decouple the UI from the exact database schema, allowing
// us to evolve backend structures without breaking the frontend.

export interface FAQ {
  id: string
  title: string
  content: string
  // DB-backed fields
  is_active?: boolean | null
  hotel_id?: string
  updated_at?: string
  embedding?: string | null
  token_count?: number | null
  // UI-only convenience fields
  category?: string | null
  language?: string | null
  metadata?: unknown
}

export interface Item {
  id: string
  item: string
  description?: string | null
  // DB-backed fields
  department?: string | null
  is_active?: boolean | null
  updated_at?: string | null
  embedding?: string | null
  // UI-only convenience fields
  category?: string | null
  is_paid?: boolean
  price?: number | null
  currency?: string
}


