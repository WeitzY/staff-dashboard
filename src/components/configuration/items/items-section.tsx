'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ItemCard } from '@/components/configuration/items/item-card'
import { ItemEditModal } from '@/components/configuration/items/Item-edit-modal'
import type { Item } from '@//types/configuration'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AVAILABLE_DEPARTMENTS } from '@/components/dashboard/department-utils'
import { useHotelManagement } from '@/hooks/useHotelManagement'

interface ItemsSectionProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  onCreate: (item: Item) => void
  onToggleActive?: (item: Item, isActive: boolean) => void
}

export function ItemsSection({ items, onEdit, onDelete, onCreate, onToggleActive }: ItemsSectionProps) {
  const { hotel } = useHotelManagement()
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Create itemCategories from hotel's configured departments
  const itemCategories = [
    { value: 'all', label: 'All Departments' },
    ...(hotel?.departments?.map(dept => {
      const departmentInfo = AVAILABLE_DEPARTMENTS.find(d => d.code === dept)
      return {
        value: dept,
        label: departmentInfo ? departmentInfo.name : dept.charAt(0).toUpperCase() + dept.slice(1).replace('_', ' ')
      }
    }) || [])
  ]

  const filterItems = useCallback(() => {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.department === selectedCategory)
      }
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedCategory])

  useEffect(() => {
    filterItems()
  }, [filterItems])

  const startCreating = () => {
    const firstDepartment = hotel?.departments?.[0] || 'front_desk'
    setEditingItem({
      id: '',
      item: '',
      description: '',
      department: firstDepartment,
      is_active: true,
      updated_at: null,
      embedding: null
    })
    setIsCreating(true)
  }

  const handleSave = (item: Item) => {
    if (isCreating) {
      onCreate(item)
    } else {
      onEdit(item)
    }
    
    setEditingItem(null)
    setIsCreating(false)
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setIsCreating(false)
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-foreground/80">
            {filteredItems.length} Items
          </span>
          <Button 
            onClick={startCreating} 
            className="h-10 rounded-xl bg-primary hover:bg-primary/90 px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          
          <div className="flex items-center gap-3 sm:gap-2">
            <Label htmlFor="mobile-item-department" className="text-sm font-medium whitespace-nowrap sm:hidden">
              Department:
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="mobile-item-department" className="w-full sm:w-[160px] h-10 rounded-xl">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {itemCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="item-department" className="text-sm font-medium whitespace-nowrap">
            Department:
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="item-department" className="w-[180px] h-11 rounded-xl">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {itemCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-s font-bold text-foreground/80">
            {filteredItems.length} Items
          </span>
          <Button 
            onClick={startCreating} 
            className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by adding your first item or service'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <Button onClick={startCreating} className="h-10 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Item</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onEdit={handleEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Modal */}
      <ItemEditModal
        item={editingItem || {
          id: '',
          item: '',
          description: '',
          department: 'housekeeping',
          is_active: true,
          updated_at: null,
          embedding: null
        }}
        isCreating={isCreating}
        onSave={handleSave}
        onCancel={() => {
          setEditingItem(null)
          setIsCreating(false)
        }}
        open={editingItem !== null}
      />
    </>
  )
} 