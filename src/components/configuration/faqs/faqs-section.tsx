'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { FAQCard } from '@/components/configuration/faqs/faq-card'
import { FAQEditModal } from '@/components/configuration/faqs/faq-edit-modal'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { FAQ } from '@/types/configuration'

interface FAQsSectionProps {
  faqs: FAQ[]
  onEdit: (faq: FAQ) => void
  onDelete: (faq: FAQ) => void
  onCreate: (faq: FAQ) => void
  onToggleActive?: (faq: FAQ, isActive: boolean) => void
}

// category filter removed per request

export function FAQsSection({ faqs, onEdit, onDelete, onCreate, onToggleActive }: FAQsSectionProps) {
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  // category removed
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const filterFaqs = useCallback(() => {
    let filtered = faqs

    if (searchQuery) {
      filtered = filtered.filter(faq => 
        (faq.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (faq.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // category filtering removed

    setFilteredFaqs(filtered)
  }, [faqs, searchQuery])

  useEffect(() => {
    filterFaqs()
  }, [filterFaqs])

  const startCreating = () => {
    setEditingFaq({
      id: '',
      title: '',
      content: '',
      language: 'en',
      category: 'general',
      hotel_id: '',
      updated_at: '',
      is_active: true,
      metadata: null,
      token_count: null,
      embedding: null
    })
    setIsCreating(true)
  }

  const handleSave = (faq: FAQ) => {
    if (isCreating) {
      onCreate(faq)
    } else {
      onEdit(faq)
    }
    
    setEditingFaq(null)
    setIsCreating(false)
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setIsCreating(false)
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-foreground/80">
            {filteredFaqs.length} FAQs
          </span>
          <Button 
            onClick={startCreating} 
            className="h-10 rounded-xl bg-primary hover:bg-primary/90 px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add FAQ</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-s font-bold text-foreground/80">
            {filteredFaqs.length} FAQs
          </span>
          <Button 
            onClick={startCreating} 
            className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </div>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No FAQs found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {searchQuery ? 'Try adjusting your search or filter criteria' : 'Get started by adding your first FAQ'}
          </p>
          {!searchQuery && (
            <Button onClick={startCreating} className="h-10 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add First FAQ
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold w-[220px]">Title</TableHead>
              <TableHead className="font-semibold w-[720px]">Description</TableHead>
              <TableHead className="w-[96px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFaqs.map((faq) => (
              <FAQCard key={faq.id} faq={faq} onEdit={handleEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Modal */}
      <FAQEditModal
        faq={editingFaq || {
          id: '',
          title: '',
          content: '',
          language: 'en',
          category: 'general',
          hotel_id: '',
          updated_at: '',
          is_active: true,
          metadata: null,
          token_count: null,
          embedding: null
        }}
        isCreating={isCreating}
        onSave={handleSave}
        onCancel={() => {
          setEditingFaq(null)
          setIsCreating(false)
        }}
        open={editingFaq !== null}
      />
    </>
  )
} 