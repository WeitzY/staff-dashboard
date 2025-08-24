'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/types'

type Hotel = Database['public']['Tables']['hotels']['Row']

const fetcher = async () => {
  const supabase = createClient()
  
  try {
    // Get current user and hotel_id from staff profile
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Auth error:', userError)
      throw new Error('Authentication failed')
    }
    if (!user) throw new Error('Not authenticated')
    
    // Get hotel_id from the current user's staff profile
    const { data: staffProfile, error: profileError } = await supabase
      .from('hotel_staff')
      .select('hotel_id')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      console.error('Staff profile error:', profileError)
      throw new Error(`Staff profile not found: ${profileError.message}`)
    }
    if (!staffProfile) throw new Error('Current user staff profile not found')
    
    const hotel_id = staffProfile.hotel_id
    
    // Fetch hotel information
    const { data: hotel, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotel_id)
      .single()
    
    if (error) {
      console.error('Hotel fetch error:', error)
      throw new Error(`Failed to fetch hotel: ${error.message}`)
    }
    
    
    return hotel
  } catch (error) {
    console.error('Fetcher error:', error)
    throw error
  }
}

export function useHotelManagement() {
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: hotel, error, mutate } = useSWR<Hotel>(
    '/api/hotel-management',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  const updateHotel = async (updates: {
    departments?: string[]
    default_language?: string
    languages?: string[]
  }) => {
    setIsUpdating(true)
    try {
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
      
      const { data: updatedHotel, error } = await supabase
        .from('hotels')
        .update(updates)
        .eq('id', hotel_id)
        .select()
        .maybeSingle()
      
      if (error) throw error
      
      // Update local cache (guard against null from maybeSingle)
      if (updatedHotel) {
        mutate(updatedHotel)
      }
      
      toast.success('Hotel configuration updated successfully')
      return updatedHotel
    } catch (error) {
      console.error('Error updating hotel:', error)
      const message = error instanceof Error ? error.message : 'Failed to update hotel settings'
      toast.error(message)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    hotel,
    error,
    isLoading: !error && !hotel,
    isUpdating,
    updateHotel,
    mutate
  }
}
