'use client'

import { Button } from '@/components/ui/button'
import { Users, Plus, MoreHorizontal, Loader2, User, Shield, Building, Mail, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Database } from '@/lib/supabase/types'
import { useAuth } from '@/hooks/useAuth'
import { formatDepartmentName } from '@/components/dashboard/department-utils'

type HotelStaff = Database['public']['Tables']['hotel_staff']['Row']

interface StaffListProps {
  staffMembers: (HotelStaff & { email?: string })[] | undefined
  isLoading: boolean
  onCreateStaff: () => void
  onEditStaff: (staff: HotelStaff) => void
  onDeleteStaff: (staff: HotelStaff) => void
}

export function StaffList({
  staffMembers,
  isLoading,
  onCreateStaff,
  onEditStaff,
  onDeleteStaff
}: StaffListProps) {
  const { user } = useAuth()
  const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID
  const isDemoUser = (user?.email === 'resume@test.com') || Boolean(demoUserId && user?.id === demoUserId)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (staffMembers?.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No staff members</h3>
        <p className="text-muted-foreground mb-6">
          Get started by adding your first staff member
        </p>
        <Button 
          onClick={onCreateStaff} 
          className="h-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Staff Member
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Name
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Department
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </div>
            </TableHead>
            <TableHead className="w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffMembers?.map((staff) => (
            <TableRow key={staff.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{staff.name || 'Unknown'}</TableCell>
              <TableCell>
                <span className="font-medium">
                  {(staff.role || 'staff').charAt(0).toUpperCase() + (staff.role || 'staff').slice(1)}
                </span>
              </TableCell>
              <TableCell className="capitalize">
                {formatDepartmentName(staff.department || 'Unknown')}
              </TableCell>
              <TableCell>
                <span className="text-sm">{staff.email || 'Not available'}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(staff.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Staff actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-lg">
                    <DropdownMenuItem 
                      onClick={() => onEditStaff(staff)}
                      disabled={isDemoUser || staff.role === 'owner'}
                    >
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteStaff(staff)}
                      className="text-destructive"
                      disabled={isDemoUser || staff.role === 'owner'}
                    >
                      Remove Staff
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}