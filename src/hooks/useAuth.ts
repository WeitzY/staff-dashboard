'use client'

import { createClient } from '@/lib/supabase/client'
import useSWR from 'swr'

const fetcher = async () => {
  const supabase = createClient()
  
  // Get current user 
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get staff profile to check role and hotel_id
  // RLS policies will automatically filter to the correct hotel
  const { data: staffProfile, error } = await supabase
    .from('hotel_staff')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error) throw error
  if (!staffProfile) throw new Error('Staff profile not found')
  
  return {
    user,
    staffProfile,
    hotel_id: staffProfile.hotel_id
  }
}

export function useAuth() {
  const { data, error, isLoading } = useSWR('/api/auth-user', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  const isAdmin = data?.staffProfile?.role === 'admin'
  const isOwner = data?.staffProfile?.role === 'owner'
  const isAdminOrOwner = isAdmin || isOwner

  return {
    user: data?.user,
    staffProfile: data?.staffProfile,
    hotel_id: data?.hotel_id,
    isLoading,
    error,
    isAdmin,
    isOwner,
    isAdminOrOwner
  }
}