import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Item } from '@//types/configuration'

type ItemChange = {
  type: 'create' | 'update' | 'delete'
  item: Partial<Item>
  originalId?: string
}

interface UseItemsOptions {
  enabled?: boolean
}

export function useItems(options: UseItemsOptions = {}) {
  const { enabled = true } = options
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [changes, setChanges] = useState<ItemChange[]>([])
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

  const fetchItems = useCallback(async () => {
    try {
      const currentHotelId = await ensureHotelId()
      const { data, error } = await supabase
        .from('items')
        // Select only JSON-serializable columns to avoid vector/extension serialization issues
        .select('id,hotel_id,item,description,department,is_active,updated_at')
        .eq('hotel_id', currentHotelId)
        .order('item', { ascending: true })

      if (error) {
        console.error('Error fetching items:', error)
        toast.error('Failed to load items')
        return
      }
      
      const mapped: Item[] = (data || []).map((row) => ({
        id: row.id,
        item: row.item,
        description: row.description,
        department: row.department,
        is_active: row.is_active,
        updated_at: row.updated_at,
        embedding: null,
      }))
      setItems(mapped)
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to load items')
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
            item: {
              item: change.item.item as string,
              description: (change.item.description || '') as string,
              department: (change.item.department || '') as string,
            },
          }
          const { error } = await supabase.functions.invoke('save-items', {
            body: payload,
          })
          if (error) throw error
        } else if (change.type === 'update' && change.originalId) {
          const payload = {
            hotelId: currentHotelId,
            item: {
              id: change.originalId,
              item: change.item.item as string,
              description: (change.item.description || '') as string,
              department: (change.item.department || '') as string,
            },
          }
          const { error } = await supabase.functions.invoke('save-items', {
            body: payload,
          })
          if (error) throw error
        } else if (change.type === 'delete' && change.item.id) {
          const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', change.item.id)
          if (error) throw error
        }
      }

      await fetchItems()
      setChanges([])
      toast.success(`${changes.length} item ${changes.length === 1 ? 'change' : 'changes'} saved successfully`)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save item changes - please try again')
    } finally {
      setIsSaving(false)
    }
  }

  const cancelChanges = () => {
    setChanges([])
    fetchItems()
    toast('Changes cancelled', { icon: 'ℹ️' })
  }

  const createItem = (item: Item) => {
    ;(async () => {
      try {
        const currentHotelId = await ensureHotelId()
        const { error } = await supabase.functions.invoke('save-items', {
          body: {
            hotelId: currentHotelId,
            item: {
              item: item.item,
              description: item.description || '',
              department: item.department || '',
            },
          },
        })
        if (error) throw error
        toast.success(`Item "${item.item}" created successfully`)
        await fetchItems()
      } catch (err) {
        console.error('Create Item failed', err)
        toast.error('Failed to create item - please check your input and try again')
      }
    })()
  }

  const updateItem = (item: Item) => {
    ;(async () => {
      try {
        const currentHotelId = await ensureHotelId()
        const { error } = await supabase.functions.invoke('save-items', {
          body: {
            hotelId: currentHotelId,
            item: {
              id: item.id,
              item: item.item,
              description: item.description || '',
              department: item.department || '',
            },
          },
        })
        if (error) throw error
        toast.success(`Item "${item.item}" updated successfully`)
        await fetchItems()
      } catch (err) {
        console.error('Update Item failed', err)
        toast.error('Failed to update item - please try again')
      }
    })()
  }

  const deleteItem = (item: Item) => {
    ;(async () => {
      try {
        const { error } = await supabase.from('items').delete().eq('id', item.id)
        if (error) throw error
        toast.success(`Item "${item.item}" deleted successfully`)
        await fetchItems()
      } catch (err) {
        console.error('Delete Item failed', err)
        toast.error('Failed to delete item - please try again')
      }
    })()
  }

  const toggleItemActive = (item: Item, isActive: boolean) => {
    ;(async () => {
      try {
        const { error } = await supabase
          .from('items')
          .update({ is_active: isActive })
          .eq('id', item.id)
        if (error) throw error
        toast.success(`Item ${isActive ? 'activated' : 'deactivated'}`)
        await fetchItems()
      } catch (err) {
        console.error('Toggle Item Active failed', err)
        toast.error('Failed to update item status')
      }
    })()
  }

  useEffect(() => {
    if (enabled) {
      fetchItems()
      ensureHotelId().catch(() => {})
    }
  }, [fetchItems, ensureHotelId, enabled])

  return {
    items,
    isLoading,
    changes,
    isSaving,
    saveChanges,
    cancelChanges,
    createItem,
    updateItem,
    deleteItem,
    toggleItemActive,
    refetch: fetchItems
  }
} 