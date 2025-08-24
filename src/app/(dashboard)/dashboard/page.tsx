'use client'

import { useState, useMemo } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { RequestsTable } from '@/components/dashboard/requests-table'
import { useRequests } from '@/hooks/useRequests'
import { Loader2, AlertCircle } from 'lucide-react'

type SortDirection = 'asc' | 'desc'

export default function DashboardPage() {
  const [isHistoryMode, setIsHistoryMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string[]>(['pending', 'in_progress'])

  // Fetch requests based on history mode
  const {
    data: requestsData,
    error,
    isLoading,
    updateRequest
  } = useRequests({
    status: isHistoryMode ? undefined : 'in_progress' // Only active requests for live mode
  })

  // Filter requests based on history mode
  const currentRequests = useMemo(() => {
    if (!requestsData) return []
    
    return requestsData.filter(request => {
      if (isHistoryMode) {
        return request.status === 'completed' || request.status === 'cancelled'
      } else {
        return request.status !== 'completed' && request.status !== 'cancelled'
      }
    })
  }, [requestsData, isHistoryMode])

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    const filtered = currentRequests.filter(request => {
      const searchLower = searchTerm.toLowerCase()
      const room = request.guests?.room_number || request.room_number || ''
      const guestName = request.guests?.last_name || ''
      
      const matchesSearch = (
        room.toLowerCase().includes(searchLower) ||
        request.note_content.toLowerCase().includes(searchLower) ||
        guestName.toLowerCase().includes(searchLower)
      )
      
      const matchesStatus = statusFilter.includes(request.status)
      
      return matchesSearch && matchesStatus
    })

    // Sort by time
    filtered.sort((a, b) => {
      const aTime = new Date(a.created_at).getTime()
      const bTime = new Date(b.created_at).getTime()
      return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
    })

    return filtered
  }, [currentRequests, searchTerm, statusFilter, sortDirection])

  // Transform data for the table component
  const transformedRequests = filteredAndSortedRequests.map(request => ({
    id: request.id,
    room: request.guests?.room_number || request.room_number || 'Unknown',
    title: request.note_content,
    status: request.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    created_at: request.created_at,
    guest_name: request.guests?.last_name || undefined,
    completedAt: request.fulfilled_at ? new Date(request.fulfilled_at).toLocaleString() : undefined,
    department: request.department,
    intent_type: request.intent_type || undefined,
    created_by_name: request.created_by_name || undefined
  }))

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
  }

  const toggleHistoryMode = () => {
    setIsHistoryMode(!isHistoryMode)
    setSearchTerm('')
    // Reset status filter based on mode
    setStatusFilter(isHistoryMode ? ['pending', 'in_progress'] : ['completed', 'cancelled'])
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await updateRequest(requestId, { 
        status: newStatus,
        fulfilled_at: newStatus === 'completed' || newStatus === 'cancelled' ? new Date().toISOString() : null
      })
    } catch (error) {
      console.error('Failed to update request:', error)
    }
  }

  const handleReactivate = async (requestId: string) => {
    try {
      await updateRequest(requestId, { 
        status: 'in_progress',
        fulfilled_at: null
      })
    } catch (error) {
      console.error('Failed to reactivate request:', error)
    }
  }

  const handleStatusFilterChange = (statuses: string[]) => {
    setStatusFilter(statuses)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="text-lg font-medium text-red-600">Failed to load requests</p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Floating Header */}
      <DashboardHeader
        isHistoryMode={isHistoryMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onToggleHistory={toggleHistoryMode}
      />
      
      {/* Flowing rows - remove card background/border */}
      <div>
        <RequestsTable
          requests={transformedRequests}
          isHistoryMode={isHistoryMode}
          sortDirection={sortDirection}
          onSort={handleSort}
          onStatusUpdate={handleStatusUpdate}
          onReactivate={handleReactivate}
        />
      </div>
    </div>
  )
} 