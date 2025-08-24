'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Building2, User, Clock, ArrowUp, ArrowDown, X, Check, MessageSquare, MapPin, Info, RotateCcw } from 'lucide-react'
import { formatDepartmentName } from './department-utils'
import { formatDistanceToNow } from 'date-fns'

type SortDirection = 'asc' | 'desc'

interface RequestType {
  id: string
  room: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  guest_name?: string
  completedAt?: string
  department?: string
  intent_type?: string
  created_by_name?: string
}

interface RequestsTableProps {
  requests: RequestType[]
  isHistoryMode: boolean
  sortDirection: SortDirection
  onSort: () => void
  onStatusUpdate: (requestId: string, newStatus: string) => void
  onReactivate?: (requestId: string) => void
}



// utilities moved to requests/department-utils

const getSortIcon = (sortDirection: SortDirection) => {
  return sortDirection === 'asc' 
    ? <ArrowUp className="h-4 w-4 text-foreground" />
    : <ArrowDown className="h-4 w-4 text-foreground" />
}

export function RequestsTable({ 
  requests, 
  isHistoryMode, 
  sortDirection, 
  onSort, 
  onStatusUpdate,
  onReactivate 
}: RequestsTableProps) {
  const handleDecline = (requestId: string) => {
    onStatusUpdate(requestId, 'cancelled')
  }

  const handleComplete = (requestId: string) => {
    onStatusUpdate(requestId, 'completed')
  }

  const handleReactivate = (requestId: string) => {
    if (onReactivate) {
      onReactivate(requestId)
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="font-semibold w-[80px]">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Room</span>
                <span className="sm:hidden">Rm</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold w-[120px] hidden sm:table-cell">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Guest
              </div>
            </TableHead>
            <TableHead className="font-semibold w-[120px] hidden md:table-cell">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Department
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Message
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold w-[100px] text-right cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
              onClick={onSort}
            >
              <div className="flex items-center justify-end gap-1">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Time</span>
                {getSortIcon(sortDirection)}
              </div>
            </TableHead>
            <TableHead className="w-24 font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell 
                colSpan={6} 
                className="h-32 text-center"
              >
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No requests found
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    {isHistoryMode 
                      ? 'No completed or cancelled requests found'
                      : 'New guest requests will appear here in real-time'
                    }
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => {
              return (
                <TableRow 
                  key={request.id} 
                  className={`transition-colors ${
                    request.status === 'cancelled'
                      ? 'bg-amber-100/40 hover:bg-amber-100/60 dark:bg-amber-900/20 dark:hover:bg-amber-900/30'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <TableCell className="text-sm w-[80px] align-middle">
                    <div className="sm:hidden space-y-1">
                      <div className="text-foreground">{request.room}</div>
                      <div className="text-xs text-muted-foreground">{request.guest_name || '—'}</div>
                    </div>
                    <div className="hidden sm:block text-foreground">{request.room}</div>
                  </TableCell>
                  <TableCell className="text-sm w-[120px] align-middle hidden sm:table-cell">
                    <span className="text-foreground">{request.guest_name || '—'}</span>
                  </TableCell>
                  <TableCell className="text-sm capitalize w-[120px] align-middle hidden md:table-cell">
                    <span className="text-foreground">{formatDepartmentName(request.department || 'general')}</span>
                  </TableCell>
                  <TableCell className="min-w-0 align-middle">
                    <div>
                      {/* Wrap long text vertically like FAQs: preserve spaces, allow breaks, constrain width */}
                      <span className="block text-sm leading-5 text-foreground break-words whitespace-normal max-w-[60ch]">
                        {request.title}
                      </span>
                      <div className="md:hidden text-xs text-muted-foreground mt-0.5">
                        {formatDepartmentName(request.department || 'general')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm w-[100px] text-right align-middle">
                    <div className="sm:hidden text-xs">{formatDistanceToNow(new Date(request.created_at), { addSuffix: false })}</div>
                    <div className="hidden sm:block">{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</div>
                  </TableCell>
                  <TableCell className="w-24 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      {isHistoryMode ? (
                        <>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Request Status</h4>
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    <span className="font-medium">Status:</span> {request.status === 'completed' ? 'Completed' : 'Cancelled'}
                                  </p>
                                  {request.completedAt && (
                                    <p className="text-sm">
                                      <span className="font-medium">Date:</span> {request.completedAt}
                                    </p>
                                  )}
                                  {request.created_by_name && (
                                    <p className="text-sm">
                                      <span className="font-medium">By:</span> {request.created_by_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                            onClick={() => handleReactivate(request.id)}
                            title="Re-activate request"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => handleDecline(request.id)}
                            title="Decline request"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                            onClick={() => handleComplete(request.id)}
                            title="Mark as completed"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
} 