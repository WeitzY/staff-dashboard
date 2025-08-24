'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreateRequestModal } from './create-request-modal'
import { StatusFilter } from './status-filter'
import { Search, History, ArrowLeft, Plus } from 'lucide-react'

interface DashboardHeaderProps {
  isHistoryMode: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string[]
  onStatusFilterChange: (statuses: string[]) => void
  onToggleHistory: () => void
}

export function DashboardHeader({
  isHistoryMode,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onToggleHistory
}: DashboardHeaderProps) {
  const statusOptions = isHistoryMode 
    ? [
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    : [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' }
      ]

  return (
    <div className="space-y-4 md:space-y-0 px-1 py-2">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold truncate flex-1">
            {isHistoryMode ? 'Requests History' : 'Active Requests'}
          </h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 w-9 rounded-xl p-0 flex-shrink-0"
            onClick={onToggleHistory}
            title={isHistoryMode ? "Back to Live Dashboard" : "View History"}
          >
            {isHistoryMode ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <History className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={isHistoryMode ? "Search..." : "Search requests..."}
              className="h-10 pl-10 rounded-xl border-border/50"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {!isHistoryMode && (
              <CreateRequestModal 
                trigger={
                  <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 px-4">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">New Request</span>
                  </Button>
                }
              />
            )}
            
            {isHistoryMode && (
              <StatusFilter
                value={statusFilter}
                onChange={onStatusFilterChange}
                options={statusOptions}
              />
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isHistoryMode ? 'Requests History' : 'Active Requests'}
        </h1>
        
        <div className="flex items-center gap-4">
          {!isHistoryMode && <CreateRequestModal />}
          
          {isHistoryMode && (
            <StatusFilter
              value={statusFilter}
              onChange={onStatusFilterChange}
              options={statusOptions}
            />
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={isHistoryMode ? "Search history..." : "Search requests..."}
              className="h-10 w-64 pl-10 rounded-xl border-border/50"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 w-10 rounded-xl p-0"
            onClick={onToggleHistory}
            title={isHistoryMode ? "Back to Live Dashboard" : "View History"}
          >
            {isHistoryMode ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <History className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 