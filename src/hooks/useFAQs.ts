import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { FAQ } from '@//types/configuration'

type FAQChange = {
  type: 'create' | 'update' | 'delete'
  faq: Partial<FAQ>
  originalId?: string
}

interface UseFAQsOptions {
  enabled?: boolean
}

export function useFAQs(options: UseFAQsOptions = {}) {
  const { enabled = true } = options
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [changes, setChanges] = useState<FAQChange[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hotelId, setHotelId] = useState<string | null>(null)
  
  const supabase = createClient()

  const ensureHotelId = useCallback(async () => {
    if (hotelId) return hotelId
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data: staff, error } = await supabase
      .from('hotel_staff')
      .select('hotel_id')
      .eq('user_id', user.id)
      .single()
    if (error) throw error
    setHotelId(staff.hotel_id)
    return staff.hotel_id as string
  }, [hotelId, supabase])

  const fetchFaqs = useCallback(async () => {
    try {
      const currentHotelId = await ensureHotelId()
      const { data, error } = await supabase
        .from('faq_info')
        .select('*')
        .eq('hotel_id', currentHotelId)
        .order('title', { ascending: true })

      if (error) {
        console.error('Error fetching FAQs:', error)
        toast.error('Failed to load FAQs')
        return
      }
      
      // Map DB rows to UI type (category/language optional)
      const mapped: FAQ[] = (data || []).map((row) => ({
        id: row.id,
        title: row.title || '',
        content: row.content,
        is_active: row.is_active,
        hotel_id: row.hotel_id,
        updated_at: row.updated_at,
        embedding: row.embedding,
      }))
      setFaqs(mapped)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      toast.error('Failed to load FAQs')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, ensureHotelId])



  const saveChanges = async () => {
    setIsSaving(true)
    try {
      const currentHotelId = await ensureHotelId()
      for (const change of changes) {
        if (change.type === 'create') {
          const payload = {
            hotelId: currentHotelId,
            faq: {
              title: change.faq.title as string,
              content: change.faq.content as string,
            },
          }
          const { error } = await supabase.functions.invoke('save-faq', {
            body: payload,
          })
          if (error) throw error
        } else if (change.type === 'update' && change.originalId) {
          const payload = {
            hotelId: currentHotelId,
            faq: {
              id: change.originalId,
              title: change.faq.title as string,
              content: change.faq.content as string,
            },
          }
          const { error } = await supabase.functions.invoke('save-faq', {
            body: payload,
          })
          if (error) throw error
        } else if (change.type === 'delete' && change.faq.id) {
          const { error } = await supabase
            .from('faq_info')
            .delete()
            .eq('id', change.faq.id)
          if (error) throw error
        }
      }

      await fetchFaqs()
      setChanges([])
      toast.success(`${changes.length} FAQ ${changes.length === 1 ? 'change' : 'changes'} saved successfully`)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save FAQ changes - please try again')
    } finally {
      setIsSaving(false)
    }
  }

  const cancelChanges = () => {
    setChanges([])
    fetchFaqs()
    toast('Changes cancelled', { icon: 'ℹ️' })
  }

  const createFaq = (faq: FAQ) => {
    // Immediately persist via Edge Function
    ;(async () => {
      try {
        const currentHotelId = await ensureHotelId()
        const { error } = await supabase.functions.invoke('save-faq', {
          body: {
            hotelId: currentHotelId,
            faq: { title: faq.title, content: faq.content },
          },
        })
        if (error) throw error
        toast.success(`FAQ "${faq.title || 'Untitled'}" created successfully`)
        await fetchFaqs()
      } catch (err) {
        console.error('Create FAQ failed', err)
        toast.error('Failed to create FAQ - please check your input and try again')
      }
    })()
  }

  const updateFaq = (faq: FAQ) => {
    ;(async () => {
      try {
        const currentHotelId = await ensureHotelId()
        const { error } = await supabase.functions.invoke('save-faq', {
          body: {
            hotelId: currentHotelId,
            faq: { id: faq.id, title: faq.title, content: faq.content },
          },
        })
        if (error) throw error
        toast.success(`FAQ "${faq.title || 'Untitled'}" updated successfully`)
        await fetchFaqs()
      } catch (err) {
        console.error('Update FAQ failed', err)
        toast.error('Failed to update FAQ - please try again')
      }
    })()
  }

  const deleteFaq = (faq: FAQ) => {
    ;(async () => {
      try {
        const { error } = await supabase.from('faq_info').delete().eq('id', faq.id)
        if (error) throw error
        toast.success(`FAQ "${faq.title || 'Untitled'}" deleted successfully`)
        await fetchFaqs()
      } catch (err) {
        console.error('Delete FAQ failed', err)
        toast.error('Failed to delete FAQ - please try again')
      }
    })()
  }

  const toggleFaqActive = (faq: FAQ, isActive: boolean) => {
    ;(async () => {
      try {
        const { error } = await supabase
          .from('faq_info')
          .update({ is_active: isActive })
          .eq('id', faq.id)
        if (error) throw error
        toast.success(`FAQ ${isActive ? 'activated' : 'deactivated'}`)
        await fetchFaqs()
      } catch (err) {
        console.error('Toggle FAQ Active failed', err)
        toast.error('Failed to update FAQ status')
      }
    })()
  }

  useEffect(() => {
    if (enabled) {
      fetchFaqs()
      // Best-effort fetch of hotel id
      ensureHotelId().catch(() => {})
    }
  }, [fetchFaqs, ensureHotelId, enabled])

  return {
    faqs,
    isLoading,
    changes,
    isSaving,
    saveChanges,
    cancelChanges,
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaqActive,
    refetch: fetchFaqs
  }
} 