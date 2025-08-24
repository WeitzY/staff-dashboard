'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { LoginFormFields } from './login-form-fields'
import {
  Form,
} from '@/components/ui/form'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        toast.success('Welcome back! Successfully logged in')
        // Persist session cookies on the server
        await fetch('/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ event: 'SIGNED_IN', session: data.session }),
        })

        window.location.href = '/dashboard'
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Centered Welcome Title */}
      <div className="text-center mb-8">
        <h1 className="font-bold text-xl mb-2 relative inline-block">
          Hotel Dashboard
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#3b82f6] to-transparent opacity-60"></span>
        </h1>
      </div>

      {/* Main form card */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl animate-slide-up">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <LoginFormFields form={form} isLoading={isLoading} />

            <Button
              type="submit"
              className="w-full h-12 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
            </div>
          </div>
          <p className="text-sm mt-4" style={{ color: '#b0b3bb' }}>
            Contact your hotel manager for access assistance
          </p>
        </div>
      </div>



      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  )
} 