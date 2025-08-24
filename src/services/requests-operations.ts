import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { StaffNote, StaffNoteWithGuest, CreateRequestData } from '@/types/requests'

export const createRequest = async (
  requestData: CreateRequestData,
  onOptimisticUpdate: (optimisticRequest: StaffNoteWithGuest) => void,
  onSuccess: (newRequest: StaffNoteWithGuest) => void,
  onError: () => void
) => {
  const supabase = createClient()
  
  try {
    // Get current user and hotel_id from staff profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get hotel_id and name from the current user's staff profile
    const { data: staffProfile, error: profileError } = await supabase
      .from('hotel_staff')
      .select('hotel_id, name')
      .eq('user_id', user.id)
      .single()
    
    if (profileError || !staffProfile) throw new Error('Current user staff profile not found')
    const hotel_id = staffProfile.hotel_id

    // First, create or find the guest
    let guestId: string
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id')
      .eq('hotel_id', hotel_id)
      .eq('room_number', requestData.roomNumber)
      .eq('last_name', requestData.guestName)
      .single()

    if (existingGuest) {
      guestId = existingGuest.id
    } else {
      // Create new guest
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert({
          hotel_id: hotel_id,
          room_number: requestData.roomNumber,
          last_name: requestData.guestName,
          user_id: user.id // temporary user_id, should be guest's actual user_id
        })
        .select('id')
        .single()

      if (guestError || !newGuest) throw guestError || new Error('Failed to create guest')
      guestId = newGuest.id
    }

    // Create optimistic update object
    const optimisticRequest: StaffNoteWithGuest = {
      id: `temp-${Date.now()}`,
      hotel_id: hotel_id,
      guest_id: guestId,
      note_content: requestData.description,
      department: requestData.department,
      intent_type: requestData.department,
      priority: 'medium',
      status: 'in_progress',
      created_by_name: staffProfile.name,
      room_number: requestData.roomNumber,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by_staff_id: null,
      fulfilled_at: null,
      guests: {
        room_number: requestData.roomNumber,
        last_name: requestData.guestName
      }
    }

    // Optimistically update the UI immediately
    onOptimisticUpdate(optimisticRequest)

    // Create the staff note/request
    const { data: newRequest, error: noteError } = await supabase
      .from('staff_notes')
      .insert({
        hotel_id: hotel_id,
        guest_id: guestId,
        note_content: requestData.description,
        department: requestData.department,
        priority: 'medium',
        status: 'in_progress',
        created_by_name: staffProfile.name,
        room_number: requestData.roomNumber,
        is_active: true
      })
      .select(`
        *,
        guests:guest_id (
          room_number,
          last_name
        )
      `)
      .single()

    if (noteError) {
      // Revert optimistic update on error
      onError()
      throw noteError
    }

    // Replace optimistic update with real data
    onSuccess(newRequest as StaffNoteWithGuest)
    
    toast.success(`Request created successfully for Room ${requestData.roomNumber} (${requestData.guestName})`)
    
  } catch (error) {
    console.error('Error creating request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create request'
    toast.error(errorMessage)
    throw error
  }
}

export const updateRequest = async (id: string, updates: Partial<StaffNote>, onSuccess: () => void) => {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('staff_notes')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Update error:', error)
      toast.error(`Failed to update request: ${error.message}`)
      throw error
    }
    
    console.log('Update successful:', data)
    toast.success(`Request updated successfully`)
    // Trigger revalidation
    onSuccess()
  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update request'
    toast.error(errorMessage)
    throw error
  }
}
