'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useHotelManagement } from '@/hooks/useHotelManagement'
import { PasswordInput } from './password-input'
import { PasswordRequirements } from './password-requirements'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Database } from '@/lib/supabase/types'
import { sanitizeTextInput, sanitizeEmail } from '@/lib/utils'

type HotelStaff = Database['public']['Tables']['hotel_staff']['Row']

interface StaffManagementModalProps {
  isOpen: boolean
  onClose: () => void
  editingStaff: HotelStaff | null
  isCreating: boolean
  isUpdating: boolean
  onSave: (data: {
    name: string
    email: string
    password: string
    confirmPassword: string
    role: string
    department: string
  }) => Promise<void>
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
]

export function StaffManagementModal({
  isOpen,
  onClose,
  editingStaff,
  isCreating,
  isUpdating,
  onSave
}: StaffManagementModalProps) {
  const { hotel } = useHotelManagement()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    department: 'frontdesk'
  })

  // Ensure values are never undefined to prevent controlled/uncontrolled input errors
  const safeFormData = {
    name: formData.name || '',
    email: formData.email || '',
    password: formData.password || '',
    confirmPassword: formData.confirmPassword || '',
    role:         formData.role || 'staff',
        department: formData.department || (hotel?.departments?.[0] || 'frontdesk')
  }



  const isCreatingNew = !editingStaff

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        name: editingStaff.name || '',
        email: '',
        password: '',
        confirmPassword: '',
        role: editingStaff.role || 'staff',
        department: editingStaff.department || (hotel?.departments?.[0] || 'frontdesk')
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff',
        department: hotel?.departments?.[0] || 'frontdesk'
      })
    }

  }, [editingStaff, hotel?.departments])



  const staffSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Must include lowercase')
      .regex(/[A-Z]/, 'Must include uppercase')
      .regex(/\d/, 'Must include a digit'),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'staff']),
    department: z.string().min(2),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

  const handleSave = async () => {
    try {
      const sanitized = {
        name: sanitizeTextInput(formData.name, { maxLength: 100 }),
        email: sanitizeEmail(formData.email),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        department: sanitizeTextInput(formData.department, { maxLength: 50 })
      }
      // When editing, allow empty email/password (not updating credentials)
      if (isCreatingNew) {
        staffSchema.parse(sanitized)
      } else {
        z.object({
          name: z.string().min(2),
          role: z.enum(['admin', 'staff']),
          department: z.string().min(2)
        }).parse({ name: sanitized.name, role: sanitized.role as 'admin'|'staff', department: sanitized.department })
      }
      await onSave(sanitized)
    } catch (e) {
      if (e instanceof z.ZodError) {
        const issue = e.issues?.[0]
        alert((issue && issue.message) || 'Invalid input')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">
            {isCreatingNew ? 'Add New Staff Member' : 'Edit Staff Member'}
          </DialogTitle>
         
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
            <Input
              id="name"
              value={safeFormData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: sanitizeTextInput(e.target.value, { maxLength: 100 }) }))}
              onBlur={(e) => setFormData(p => ({ ...p, name: sanitizeTextInput(e.target.value, { maxLength: 100, trimEdges: true }) }))}
              placeholder="Enter full name"
              className="h-10 rounded-lg"
              autoFocus
              tabIndex={1}
            />
          </div>

          {isCreatingNew && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={safeFormData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: sanitizeEmail(e.target.value) }))}
                  placeholder="Enter email address"
                  className="h-10 rounded-lg"
                  tabIndex={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <PasswordInput
                  id="password"
                  value={safeFormData.password}
                  onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                  placeholder="Enter password"
                  tabIndex={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Re-enter Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={safeFormData.confirmPassword}
                  onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                  placeholder="Re-enter password"
                  tabIndex={4}
                  aria-label="Hide confirm password"
                />
              </div>

              {/* Password Requirements - Always visible when creating new staff */}
              <PasswordRequirements 
                password={safeFormData.password}
                confirmPassword={safeFormData.confirmPassword}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Role</Label>
              <Select 
                value={safeFormData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="h-10 rounded-lg" tabIndex={5}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">Department</Label>
              <Select 
                value={safeFormData.department} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="h-10 rounded-lg" tabIndex={6}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hotel?.departments?.map((dept) => {
                    // Find the department name from the available departments list
                    const AVAILABLE_DEPARTMENTS = [
                      { code: 'frontdesk', name: 'Front Desk' },
                      { code: 'housekeeping', name: 'Housekeeping' },
                      { code: 'maintenance', name: 'Maintenance' },
                      { code: 'food_beverage', name: 'Food & Beverage' },
                      { code: 'concierge', name: 'Concierge' },
                      { code: 'security', name: 'Security' },
                      { code: 'management', name: 'Management' },
                      { code: 'laundry', name: 'Laundry' },
                      { code: 'spa', name: 'Spa' }
                    ]
                    const departmentInfo = AVAILABLE_DEPARTMENTS.find(d => d.code === dept)
                    const displayName = departmentInfo ? departmentInfo.name : dept.charAt(0).toUpperCase() + dept.slice(1).replace('_', ' ')
                    
                    return (
                      <SelectItem key={dept} value={dept}>
                        {displayName}
                      </SelectItem>
                    )
                  }) || (
                    <SelectItem value="frontdesk">Front Desk</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="h-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            tabIndex={7}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isCreating || isUpdating}
            className="h-10 rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            tabIndex={8}
          >
            {(isCreating || isUpdating) ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isCreatingNew ? 'Create Staff' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 