import { LoginForm } from '@/components/login/login-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  
  // Check if user is already authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[size:32px_32px] opacity-60" />
      
      {/* Floating orbs for visual effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-70 animate-pulse" style={{animationDelay: '2s'}} />
      
      <div className="relative w-full max-w-md flex flex-col items-center justify-center min-h-[60vh]">
        <LoginForm />
      </div>
    </div>
  )
} 