'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useRequests } from '@/hooks/useRequests'
import { useHotelManagement } from '@/hooks/useHotelManagement'
import { formatDepartmentName } from './department-utils'
import { sanitizeTextInput, sanitizeDigits } from '@/lib/utils'

interface CreateRequestModalProps {
  trigger?: React.ReactNode
}

export function CreateRequestModal({ trigger }: CreateRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    roomNumber: '',
    department: '',
    description: '',
  })

  const { createRequest } = useRequests()
  const { hotel } = useHotelManagement()

  // Get available departments for this hotel
  const availableDepartments = hotel?.departments || ['front_desk', 'housekeeping', 'maintenance']
  
  const schema = z.object({
    guestName: z.string().min(1, 'Guest name is required').max(100),
    roomNumber: z.string().regex(/^\d{1,4}$/, 'Room number must be 1-4 digits'),
    department: z.enum(availableDepartments as [string, ...string[]], 'Please select a department'),
    description: z.string().min(5, 'Description too short').max(1000),
  })

  const handleSubmit = async () => {
    // Sanitize before validation and submission
    const sanitized = {
      guestName: sanitizeTextInput(formData.guestName, { maxLength: 100 }),
      roomNumber: sanitizeDigits(formData.roomNumber, 4),
      department: formData.department,
      description: sanitizeTextInput(formData.description, { allowNewlines: true, maxLength: 1000 })
    }
    try {
      schema.parse(sanitized)
    } catch (e) {
      if (e instanceof z.ZodError) {
        const issue = e.issues?.[0]
        alert((issue && issue.message) || 'Invalid input')
      }
      return
    }

    setIsSubmitting(true)
    try {
      await createRequest(sanitized)
      setIsOpen(false)
      setFormData({ guestName: '', roomNumber: '', department: '', description: '' })
    } catch (error) {
      console.error('Error creating request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultTrigger = (
    <Button className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
      <Plus className="h-4 w-4 mr-2" />
      New Request
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">Create New Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <Label htmlFor="guest-name" className="text-sm font-medium">Guest Name</Label>
            <Input
              id="guest-name"
              placeholder="Enter guest name"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: sanitizeTextInput(e.target.value, { maxLength: 100 }) })}
              className="h-10 rounded-lg"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="room-number" className="text-sm font-medium">Room Number</Label>
            <Input
              id="room-number"
              placeholder="e.g., 201"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: sanitizeDigits(e.target.value, 4) })}
              className="h-10 rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">Department</Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {formatDepartmentName(dept)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the request in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: sanitizeTextInput(e.target.value, { allowNewlines: true, maxLength: 1000 }) })}
              className="min-h-[100px] rounded-lg resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="h-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.guestName || !formData.roomNumber || !formData.department || !formData.description}
              className="h-10 rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 