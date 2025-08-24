import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // User is logged in, redirect to dashboard
    redirect('/dashboard')
  } else {
    // User is not logged in, redirect to login
    redirect('/login')
  }
}
