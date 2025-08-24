'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  tabIndex?: number
  'aria-label'?: string
}

export function PasswordInput({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  className = "h-10 rounded-lg pr-10",
  tabIndex,
  'aria-label': ariaLabel
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        tabIndex={tabIndex}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={ariaLabel || (showPassword ? "Hide password" : "Show password")}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
