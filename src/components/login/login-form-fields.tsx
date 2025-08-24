'use client'

import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Mail, Lock } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface LoginFormFieldsProps {
  form: UseFormReturn<{
    email: string
    password: string
  }>
  isLoading: boolean
}

export function LoginFormFields({ form, isLoading }: LoginFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Email Address
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12 bg-input/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200 placeholder:text-[#b0b3bb]"
                  disabled={isLoading}
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Password
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-12 bg-input/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200 placeholder:text-[#b0b3bb]"
                  disabled={isLoading}
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
} 