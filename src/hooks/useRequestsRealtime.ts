import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { StaffNote, StaffNoteWithGuest } from '@//types/requests'

export function useRequestsRealtime(
  onRealtimeUpdate: (data: StaffNoteWithGuest[]) => void,
  mutateRef: React.MutableRefObject<(() => void) | null>,
  isCreatingRequestRef: React.MutableRefObject<boolean>
) {
  const [realtimeData, setRealtimeData] = useState<StaffNoteWithGuest[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let didSubscribe = false
    
    const setupRealtime = async () => {
      try {
        // Get user's hotel_id from staff profile
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        // Get hotel_id from the current user's staff profile
        const { data: staffProfile, error: profileError } = await supabase
          .from('hotel_staff')
          .select('hotel_id')
          .eq('user_id', user.id)
          .single()
        
        if (profileError || !staffProfile) return
        const hotel_id = staffProfile.hotel_id
        
        // Use a stable, scoped channel name (avoid reserved prefixes)
        const channelName = `staff_notes:${hotel_id}`

        // Global initialization lock to avoid duplicate subscribe in Strict Mode / HMR
        const globalForRealtime = globalThis as unknown as {
          __velin_realtime_init__?: Set<string>
        }
        if (!globalForRealtime.__velin_realtime_init__) {
          globalForRealtime.__velin_realtime_init__ = new Set<string>()
        }
        if (globalForRealtime.__velin_realtime_init__!.has(channelName)) {
          return
        }
        // Acquire topic-level lock BEFORE checking existing channels to prevent race
        globalForRealtime.__velin_realtime_init__!.add(channelName)
        
        // Check if channel already exists
        const existingChannels = supabase.getChannels()
        const existingChannel = existingChannels.find(ch => ch.topic === channelName)
        
        if (existingChannel) {
          // Channel already exists, just update connection status
          setIsConnected(existingChannel.state === 'joined')
          // Ensure we do not resubscribe in Strict Mode
          globalForRealtime.__velin_realtime_init__!.delete(channelName)
          return
        }

        // Create new channel only if it doesn't exist
        channel = supabase
          .channel(channelName)
          // INSERT
          .on('postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'staff_notes',
              filter: `hotel_id=eq.${hotel_id}`,
            },
            async (payload: RealtimePostgresChangesPayload<StaffNote>) => {
              
              // Fetch the new record with guest info
              const { data: newRecord } = await supabase
                .from('staff_notes')
                .select(`
                  *,
                  guests:guest_id (
                    room_number,
                    last_name
                  )
                `)
                .eq('id', (payload.new as StaffNote).id)
                .single()
              
              if (newRecord) {
                setRealtimeData(prev => [newRecord as StaffNoteWithGuest, ...prev])
                if (!isCreatingRequestRef.current) {
                  toast.success('New request received!')
                }
              }
              
              // Also trigger SWR revalidation
              mutateRef.current?.()
            }
          )
          // UPDATE
          .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'staff_notes',
              filter: `hotel_id=eq.${hotel_id}`,
            },
            (payload: RealtimePostgresChangesPayload<StaffNote>) => {
              setRealtimeData(prev =>
                prev.map(item =>
                  item.id === (payload.new as StaffNote).id
                    ? { ...item, ...(payload.new as StaffNote) }
                    : item
                )
              )
              mutateRef.current?.()
            }
          )
          // DELETE
          .on('postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'staff_notes',
              filter: `hotel_id=eq.${hotel_id}`,
            },
            (payload: RealtimePostgresChangesPayload<StaffNote>) => {
              setRealtimeData(prev => 
                prev.filter(item => item.id !== (payload.old as StaffNote).id)
              )
              mutateRef.current?.()
            }
          )

        // Only subscribe if this instance isn't already joined/subscribing
        const channelState = (channel as unknown as { state?: string }).state
        if (channelState !== 'joined' && channelState !== 'subscribing') {
          channel.subscribe((status) => {
            setIsConnected(status === 'SUBSCRIBED')
            didSubscribe = status === 'SUBSCRIBED'
          })
        } else {
          setIsConnected(true)
        }
      } catch (err) {
        console.error('Error setting up realtime:', err)
        // Release lock on failure
        try {
          const { data: { user } } = await createClient().auth.getUser()
          if (user) {
            const { data: sp } = await createClient()
              .from('hotel_staff')
              .select('hotel_id')
              .eq('user_id', user.id)
              .single()
            if (sp?.hotel_id) {
              const topic = `staff_notes:${sp.hotel_id}`
              const g = globalThis as unknown as { __velin_realtime_init__?: Set<string> }
              g.__velin_realtime_init__?.delete(topic)
            }
          }
        } catch {}
      }
    }
    
    setupRealtime()
    
    return () => {
      // Clean up only if we created and joined the channel in this effect
      if (channel && didSubscribe) {
        supabase.removeChannel(channel)
        const g = globalThis as unknown as { __velin_realtime_init__?: Set<string> }
        const topic = (channel as { topic?: string }).topic
        if (topic) g.__velin_realtime_init__?.delete(topic)
      }
    }
  }, [mutateRef, isCreatingRequestRef]) // Remove all dependencies to prevent re-subscription

  // Update callback whenever realtime data changes
  useEffect(() => {
    onRealtimeUpdate(realtimeData)
  }, [realtimeData, onRealtimeUpdate])

  return { realtimeData, isConnected }
}
