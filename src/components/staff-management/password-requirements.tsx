'use client'

import { Check } from 'lucide-react'

interface PasswordRequirement {
  text: string
  met: boolean
}

interface PasswordRequirementsProps {
  password: string
  confirmPassword: string
}

export function PasswordRequirements({ password, confirmPassword }: PasswordRequirementsProps) {
  const requirements: PasswordRequirement[] = [
    {
      text: 'At least 8 characters',
      met: password.length >= 8
    },
    {
      text: 'Contains lowercase letter',
      met: /[a-z]/.test(password)
    },
    {
      text: 'Contains uppercase letter',
      met: /[A-Z]/.test(password)
    },
    {
      text: 'Contains digit',
      met: /\d/.test(password)
    },
    {
      text: 'Passwords match',
      met: password === confirmPassword && password.length > 0
    }
  ]

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Password Requirements:</p>
      <div className="space-y-1">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`flex h-4 w-4 items-center justify-center rounded-sm border-2 ${
              requirement.met 
                ? 'bg-green-500 border-green-500' 
                : 'border-muted-foreground/30'
            }`}>
              {requirement.met && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className={`text-xs ${
              requirement.met ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {requirement.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
