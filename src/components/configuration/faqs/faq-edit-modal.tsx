import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
// category selection removed per request
import type { FAQ } from '@/types/configuration'

interface FAQEditModalProps {
  faq: FAQ
  isCreating: boolean
  onSave: (faq: FAQ) => void
  onCancel: () => void
  open: boolean
}

export function FAQEditModal({ faq, isCreating, onSave, onCancel, open }: FAQEditModalProps) {
  const [formData, setFormData] = useState(faq)

  useEffect(() => {
    setFormData(faq)
  }, [faq])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields')
      return
    }
    const updated: FAQ = { ...formData, language: 'en', category: undefined, is_active: true }
    onSave(updated)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New FAQ' : 'Edit FAQ'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Checkout"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe the topic in English..."
                className="min-h-[120px] resize-y"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isCreating ? 'Create FAQ' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


