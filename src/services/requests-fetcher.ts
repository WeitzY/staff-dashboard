import { createClient } from '@/lib/supabase/client'
import type { StaffNoteWithGuest } from '@/types/requests'

export const requestsFetcher = async (url: string): Promise<StaffNoteWithGuest[]> => {
  const supabase = createClient()
  
  // Get current user and hotel_id from staff profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get hotel_id from the current user's staff profile
  const { data: staffProfile, error: profileError } = await supabase
    .from('hotel_staff')
    .select('hotel_id')
    .eq('user_id', user.id)
    .single()
  
  if (profileError || !staffProfile) throw new Error('Current user staff profile not found')
  const hotel_id = staffProfile.hotel_id
  
  // Parse filters from URL
  const urlObj = new URL(url, 'http://localhost')
  const status = urlObj.searchParams.get('status')
  const department = urlObj.searchParams.get('department')
  
  let query = supabase
    .from('staff_notes')
    .select(`
      *,
      guests:guest_id (
        room_number,
        last_name
      )
    `)
    .eq('hotel_id', hotel_id)
    .order('created_at', { ascending: false })
  
  // Apply filters
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  
  if (department && department !== 'all') {
    query = query.eq('department', department)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as StaffNoteWithGuest[]
}
