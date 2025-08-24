'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface StatusFilterProps {
  value: string[]
  onChange: (statuses: string[]) => void
  options: { value: string; label: string }[]
  label?: string
}

export function StatusFilter({ value, onChange, options, label = "Status" }: StatusFilterProps) {
  const handleChange = (selectedValue: string) => {
    if (selectedValue === 'all') {
      onChange(options.map(opt => opt.value))
    } else {
      onChange([selectedValue])
    }
  }

  const displayValue = value.length === options.length ? 'all' : value[0] || 'all'

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium whitespace-nowrap hidden sm:block">
        {label}:
      </Label>
      <Select value={displayValue} onValueChange={handleChange}>
        <SelectTrigger className="w-28 sm:w-36 h-10 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 