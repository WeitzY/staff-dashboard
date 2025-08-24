'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import { StaffList } from './staff-list'
import type { Database } from '@/lib/supabase/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHotelManagement } from '@/hooks/useHotelManagement'
import { formatDepartmentName } from '@/components/dashboard/department-utils'

type HotelStaff = Database['public']['Tables']['hotel_staff']['Row']

interface StaffManagementSectionProps {
  staffMembers: (HotelStaff & { email?: string })[] | undefined
  isLoading: boolean
  onCreateStaff: () => void
  onEditStaff: (staff: HotelStaff) => void
  onDeleteStaff: (staff: HotelStaff) => void
}

export function StaffManagementSection({
  staffMembers,
  isLoading,
  onCreateStaff,
  onEditStaff,
  onDeleteStaff
}: StaffManagementSectionProps) {
  const { hotel } = useHotelManagement()
  const [departmentFilter, setDepartmentFilter] = useState<string | 'all'>('all')
  const filtered = (staffMembers || []).filter((s) => {
    if (departmentFilter === 'all') return true
    return (s.department || '') === departmentFilter
  })
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-card/50 backdrop-blur">
      <CardHeader className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="">
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Staff Management
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as typeof departmentFilter)}>
              <SelectTrigger className="h-10 rounded-xl w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {hotel?.departments?.map((dept) => (
                  <SelectItem key={dept} value={dept}>{formatDepartmentName(dept)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={onCreateStaff} 
              className="h-10 rounded-xl bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <StaffList
          staffMembers={filtered}
          isLoading={isLoading}
          onCreateStaff={onCreateStaff}
          onEditStaff={onEditStaff}
          onDeleteStaff={onDeleteStaff}
        />
      </CardContent>
    </Card>
  )
}