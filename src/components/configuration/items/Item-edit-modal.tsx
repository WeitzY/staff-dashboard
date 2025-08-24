import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { Item } from '@//types/configuration'
import { AVAILABLE_DEPARTMENTS } from '@/components/dashboard/department-utils'
import { useHotelManagement } from '@/hooks/useHotelManagement'

interface ItemEditModalProps {
  item: Item
  isCreating: boolean
  onSave: (item: Item) => void
  onCancel: () => void
  open: boolean
}

export function ItemEditModal({ item, isCreating, onSave, onCancel, open }: ItemEditModalProps) {
  const { hotel } = useHotelManagement()
  const [formData, setFormData] = useState(item)

  useEffect(() => {
    setFormData(item)
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.item) {
      alert('Please fill in required fields')
      return
    }
    onSave({ ...formData, is_active: true })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Item' : 'Edit Item'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.item}
                  onChange={(e) => setFormData(prev => ({ ...prev, item: e.target.value }))}
                  placeholder="e.g., Towels"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotel?.departments?.map((dept) => {
                      const departmentInfo = AVAILABLE_DEPARTMENTS.find(d => d.code === dept)
                      const displayName = departmentInfo ? departmentInfo.name : dept.charAt(0).toUpperCase() + dept.slice(1).replace('_', ' ')
                      return (
                        <SelectItem key={dept} value={dept}>
                          {displayName}
                        </SelectItem>
                      )
                    }) || (
                      <SelectItem value="front_desk">Front Desk</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the item"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isCreating ? 'Create Item' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


