import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Edit, Trash2 } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'
import type { Item } from '@//types/configuration'

interface ItemCardProps {
  item: Item
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  onToggleActive?: (item: Item, isActive: boolean) => void
}

export function ItemCard({ item, onEdit, onDelete, onToggleActive }: ItemCardProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium w-[220px] align-top">{item.item}</TableCell>
      <TableCell className="capitalize w-[180px] align-top">{item.department?.replace('_', ' ') || '—'}</TableCell>
      <TableCell className="text-sm text-muted-foreground min-w-0 w-[640px] align-top">
        <div className="break-words whitespace-pre-wrap">{item.description || '—'}</div>
      </TableCell>
      <TableCell className="w-[96px] text-right align-top">
        <div className="flex items-center justify-end gap-1">
          {onToggleActive && (
            <Switch
              checked={!!item.is_active}
              onCheckedChange={(checked) => onToggleActive(item, checked)}
              className="mr-1"
            />
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Delete this item?')) onDelete(item)
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


