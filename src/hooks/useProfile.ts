'use client'


import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/types'

type HotelStaff = Database['public']['Tables']['hotel_staff']['Row']

const fetcher = async () => {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get staff profile
  const { data: staffProfile, error } = await supabase
    .from('hotel_staff')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error) throw error
  
  // Return both profile and email together
  return {
    ...staffProfile,
    email: user.email
  }
}

export function useProfile() {
  const { data: profile, error, mutate } = useSWR(
    '/api/profile',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  const updateProfile = async (updates: Partial<HotelStaff>) => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      // Update staff profile
      const { data, error } = await supabase
        .from('hotel_staff')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      // Update local cache
      mutate(data)
      toast.success('Profile updated successfully')
      
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
      throw error
    }
  }

  return {
    profile,
    error,
    isLoading: !error && !profile,
    updateProfile,
    updatePassword,
    mutate
  }
}