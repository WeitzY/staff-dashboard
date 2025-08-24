'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/types'

type HotelStaff = Database['public']['Tables']['hotel_staff']['Row']
type HotelStaffInsert = Database['public']['Tables']['hotel_staff']['Insert']

const fetcher = async () => {
  const supabase = createClient()
  
  // Get current user 
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  
  
  // RLS policies will automatically filter to only show staff from the same hotel
  const { data: staffMembers, error } = await supabase
    .from('hotel_staff')
    .select('*')
    .order('created_at', { ascending: false })
  
  
  
  if (error) throw error
  
  return staffMembers
}

export function useStaffManagement() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: staffMembers, error, mutate } = useSWR<(HotelStaff & { email?: string })[]>(
    '/api/staff-management',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  const createStaffMember = async (staffData: {
    email: string
    password: string
    confirmPassword: string
    name: string
    role: string
    department: string
  }) => {
    setIsCreating(true)
    try {
      const supabase = createClient()
      
      // Get current user and hotel_id from staff profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      // Get hotel_id from the current user's staff profile
      const { data: currentStaffProfile, error: profileError } = await supabase
        .from('hotel_staff')
        .select('hotel_id')
        .eq('user_id', user.id)
        .single()
      
      if (profileError || !currentStaffProfile) throw new Error('Current user staff profile not found')
      const hotel_id = currentStaffProfile.hotel_id

      // Validate password confirmation
      if (staffData.password !== staffData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Basic email validation
      if (!staffData.email.includes('@') || staffData.email.length < 3) {
        throw new Error('Please enter an email address with @ symbol')
      }

      // Capitalize each word in the name
      const capitalizedName = staffData.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      // Store current session to restore after signup
      const currentSession = await supabase.auth.getSession()
      const adminSession = currentSession.data.session

      // Create auth user with hotel_id in metadata 
      const { data: newUser, error: authError } = await supabase.auth.signUp({
        email: staffData.email,
        password: staffData.password,
        options: {
          data: {
            hotel_id: hotel_id,
            name: capitalizedName
          },
          // Skip email confirmation for demo purposes
          emailRedirectTo: undefined
        }
      })

      // Restore admin session immediately after signup
      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token
        })
      }

      // Handle common auth errors more gracefully for demo
      if (authError) {
        console.error('Auth error details:', authError)
        if (authError.message?.includes('invalid email')) {
          throw new Error('Please enter a valid email format (e.g., user@domain.com)')
        } else if (authError.message?.includes('signup is disabled')) {
          throw new Error('User registration is currently disabled. Please check your Supabase settings.')
        } else if (authError.message?.includes('email address already registered')) {
          throw new Error('This email address is already registered. Please use a different email.')
        } else {
          throw new Error(`Authentication error: ${authError.message}`)
        }
      }
      if (!newUser.user) throw new Error('Failed to create user')

      // Create staff profile
      const staffProfile: HotelStaffInsert = {
        user_id: newUser.user.id,
        hotel_id: hotel_id,
        name: capitalizedName,
        role: staffData.role,
        department: staffData.department,
        email: staffData.email, // Add email field (required by table)
      }
      

      const { data: createdStaff, error: staffError } = await supabase
        .from('hotel_staff')
        .insert([staffProfile])
        .select()
        .single()

      if (staffError) {
        // Note: Cannot clean up auth user from client-side without admin privileges
        // In production, consider implementing server-side cleanup via webhook or cron job
        throw staffError
      }

      // Update local cache
      mutate([createdStaff, ...(staffMembers || [])])
      toast.success(`Staff member "${capitalizedName}" created successfully`)
      
      return createdStaff
    } catch (error: unknown) {
      console.error('Error creating staff member:', error)
      const message = error instanceof Error ? error.message : 'Failed to create staff member'
      toast.error(message)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const updateStaffMember = async (staffId: string, updates: {
    name?: string
    role?: string
    department?: string
  }) => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      
      const { data: updatedStaff, error } = await supabase
        .from('hotel_staff')
        .update(updates)
        .eq('id', staffId)
        .select()
        .single()
      
      if (error) throw error
      
      // Update local cache
      mutate(
        staffMembers?.map(staff => 
          staff.id === staffId ? updatedStaff : staff
        ) || []
      )
      
      toast.success(`${updatedStaff.name}'s profile updated successfully`)
      return updatedStaff
    } catch (error) {
      console.error('Error updating staff member:', error)
      toast.error('Failed to update staff member - please try again')
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteStaffMember = async (staffId: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('hotel_staff')
        .delete()
        .eq('id', staffId)
      
      if (error) throw error
      
      // Update local cache
      mutate(staffMembers?.filter(staff => staff.id !== staffId) || [])
      toast.success('Staff member removed from hotel successfully')
    } catch (error) {
      console.error('Error deleting staff member:', error)
      toast.error('Failed to remove staff member - please try again')
      throw error
    }
  }

  return {
    staffMembers,
    error,
    isLoading: !error && !staffMembers,
    isCreating,
    isUpdating,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
    mutate
  }
} 