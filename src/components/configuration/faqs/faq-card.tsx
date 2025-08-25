import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Edit, Trash2 } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'
import type { FAQ } from '@/types/configuration'

interface FAQCardProps {
  faq: FAQ
  onEdit: (faq: FAQ) => void
  onDelete: (faq: FAQ) => void
  onToggleActive?: (faq: FAQ, isActive: boolean) => void
}

export function FAQCard({ faq, onEdit, onDelete, onToggleActive }: FAQCardProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium w-[220px] align-top">{faq.title || 'Untitled'}</TableCell>
      <TableCell className="font-medium min-w-0 w-[720px] align-top">
        <div className="break-words whitespace-pre-wrap max-w-[80ch]">
          {faq.content}
        </div>
      </TableCell>
      <TableCell className="w-[96px] text-right align-top">
        <div className="flex items-center justify-end gap-1">
          {onToggleActive && (
            <Switch
              checked={!!faq.is_active}
              onCheckedChange={(checked) => onToggleActive(faq, checked)}
              className="mr-1"
            />
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(faq)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Delete this FAQ?')) onDelete(faq)
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}


