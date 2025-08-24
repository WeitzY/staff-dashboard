import type { Database } from '@/lib/supabase/types'

export type StaffNote = Database['public']['Tables']['staff_notes']['Row']
export type StaffNoteWithGuest = StaffNote & {
  guests: {
    room_number: string | null
    last_name: string | null
  } | null
}

export interface UseRequestsOptions {
  status?: string
  department?: string
}

export interface CreateRequestData {
  guestName: string
  roomNumber: string
  department: string
  description: string
}
