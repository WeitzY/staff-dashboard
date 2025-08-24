'use client'

import { useState, useRef } from 'react'
import useSWR from 'swr'
import { requestsFetcher } from '@/services/requests-fetcher'
import { createRequest as createRequestService, updateRequest as updateRequestService } from '@/services/requests-operations'
import { useRequestsRealtime } from './useRequestsRealtime'
import type { UseRequestsOptions, CreateRequestData, StaffNote } from '@/types/requests'



export function useRequests(options: UseRequestsOptions = {}) {
  // State to track if current user is creating a request (to avoid duplicate toasts)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const isCreatingRequestRef = useRef(false)
  // Use a ref to store the mutate function to avoid dependency issues
  const mutateRef = useRef<(() => void) | null>(null)
  
  // Build the URL for SWR caching based on filters
  const cacheKey = `/api/staff-notes?${new URLSearchParams({
    status: options.status || 'all',
    department: options.department || 'all',
  }).toString()}`
  
  const {
    data: initialData,
    error,
    isLoading,
    mutate
  } = useSWR(cacheKey, requestsFetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds as fallback
    revalidateOnFocus: true,
  })
  
  // Store mutate function in ref
  mutateRef.current = mutate
  
  // Update isCreatingRequestRef whenever state changes
  isCreatingRequestRef.current = isCreatingRequest
  
  // Set up real-time subscription
  const { realtimeData, isConnected } = useRequestsRealtime(
    () => {},
    mutateRef,
    isCreatingRequestRef
  )
  
  // Combine initial data with real-time updates
  const data = initialData || realtimeData

  // Function to create a new request
  const createRequest = async (requestData: CreateRequestData) => {
    setIsCreatingRequest(true)
    try {
      await createRequestService(
        requestData,
        (optimisticRequest) => {
          // Optimistically update the UI immediately
          mutate([optimisticRequest, ...(data || [])], false)
        },
        (newRequest) => {
          // Replace optimistic update with real data
          mutate([newRequest, ...(data?.filter(item => !item.id.startsWith('temp-')) || [])], false)
        },
        () => {
          // Revert optimistic update on error
          mutate()
        }
      )
    } finally {
      // Reset the flag after a short delay to allow realtime to process
      setTimeout(() => setIsCreatingRequest(false), 1000)
    }
  }

  // Function to update a request status
  const updateRequest = async (id: string, updates: Partial<StaffNote>) => {
    await updateRequestService(id, updates, () => mutate())
  }
  
  return {
    data,
    error,
    isLoading,
    isConnected,
    realtimeData,
    mutate,
    updateRequest,
    createRequest,
  }
} 