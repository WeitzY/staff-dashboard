'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Edit3, MapPin } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Hotel = Database['public']['Tables']['hotels']['Row']

interface DepartmentsSectionProps {
  hotel: Hotel
  isUpdating: boolean
  onUpdate: (updates: { departments: string[] }) => Promise<Hotel | null>
}

const AVAILABLE_DEPARTMENTS = [
  { code: 'front_desk', name: 'Front Desk' },
  { code: 'housekeeping', name: 'Housekeeping' },
  { code: 'maintenance', name: 'Maintenance' },
  { code: 'kitchen', name: 'Kitchen' },
  { code: 'food_beverage', name: 'Food & Beverage' },
  { code: 'concierge', name: 'Concierge' },
  { code: 'security', name: 'Security' },
  { code: 'management', name: 'Management' },
  { code: 'laundry', name: 'Laundry' },
  { code: 'spa', name: 'Spa' }
]

export function DepartmentsSection({ hotel, isUpdating, onUpdate }: DepartmentsSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingDepartments, setEditingDepartments] = useState<string[]>([])

  const formatDepartmentName = (dept: string) => {
    const departmentInfo = AVAILABLE_DEPARTMENTS.find(d => d.code === dept)
    return departmentInfo ? departmentInfo.name : dept.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const startEditing = () => {
    setIsEditing(true)
    setEditingDepartments([...hotel.departments || []])
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingDepartments([])
  }

  const saveChanges = async () => {
    try {
      await onUpdate({ departments: editingDepartments })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving departments:', error)
    }
  }

  const toggleDepartment = (departmentCode: string) => {
    if (editingDepartments.includes(departmentCode)) {
      setEditingDepartments(editingDepartments.filter(d => d !== departmentCode))
    } else {
      setEditingDepartments([...editingDepartments, departmentCode])
    }
  }

  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-card/50 backdrop-blur">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl font-semibold">Departments</CardTitle>
            </div>
          </div>
          {!isEditing ? (
            <Button 
              onClick={startEditing} 
              className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-6 gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button onClick={cancelEdit} variant="outline">
                Cancel
              </Button>
              <Button onClick={saveChanges} disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="flex flex-wrap gap-2">
            {hotel.departments?.map((dept) => (
              <Badge key={dept} variant="secondary" className="text-sm px-3 py-1 bg-muted/40">
                {formatDepartmentName(dept)}
              </Badge>
            )) || <p className="text-sm text-muted-foreground">No departments configured</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Available Departments</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                {AVAILABLE_DEPARTMENTS.map((dept) => (
                  <label key={dept.code} className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={editingDepartments.includes(dept.code)}
                      onChange={() => toggleDepartment(dept.code)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{dept.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
