'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'
import { sanitizeTextInput } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const passwordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export function PasswordChangeForm() {
  const supabase = createClient()
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID
  const isDemoUser = (user?.email === 'resume@test.com') || Boolean(demoUserId && user?.id === demoUserId)


  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const watchNewPassword = form.watch('newPassword')
  const watchConfirmPassword = form.watch('confirmPassword')

  // Password requirements validation
  const passwordRequirements = [
    {
      text: 'At least 8 characters',
      met: watchNewPassword.length >= 8
    },
    {
      text: 'Contains lowercase letter',
      met: /[a-z]/.test(watchNewPassword)
    },
    {
      text: 'Contains uppercase letter',
      met: /[A-Z]/.test(watchNewPassword)
    },
    {
      text: 'Contains digit',
      met: /\d/.test(watchNewPassword)
    },
    {
      text: 'Passwords match',
      met: watchNewPassword === watchConfirmPassword && watchNewPassword.length > 0
    }
  ]

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (isDemoUser) {
      setError('Password changes are disabled for the demo account.')
      return
    }
    // Sanitize textual password inputs to normalize/control characters only
    const sanitizedValues: PasswordFormValues = {
      currentPassword: sanitizeTextInput(values.currentPassword, { maxLength: 100 }),
      newPassword: sanitizeTextInput(values.newPassword, { maxLength: 100 }),
      confirmPassword: sanitizeTextInput(values.confirmPassword, { maxLength: 100 })
    }
    setIsUpdatingPassword(true)
    setError(null)

    try {
      // First verify the current password by getting user email and attempting sign in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('User email not found')
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: sanitizedValues.currentPassword
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // If verification successful, update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: sanitizedValues.newPassword
      })

      if (updateError) {
        throw updateError
      }

      toast.success('Password updated successfully')
      form.reset()
    } catch (error: unknown) {
      console.error('Error updating password:', error)
      const message = error instanceof Error ? error.message : 'Failed to update password. Please try again.'
      setError(message)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handlePasswordSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      disabled={isUpdatingPassword || isDemoUser}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      disabled={isUpdatingPassword || isDemoUser}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      disabled={isUpdatingPassword || isDemoUser}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Requirements */}
          {watchNewPassword && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Password Requirements:</p>
              <div className="space-y-1">
                {passwordRequirements.map((requirement, index) => (
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
          )}
        
          <Button 
            type="submit" 
            disabled={isUpdatingPassword || isDemoUser}
            className="w-full"
          >
            {isUpdatingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
} 